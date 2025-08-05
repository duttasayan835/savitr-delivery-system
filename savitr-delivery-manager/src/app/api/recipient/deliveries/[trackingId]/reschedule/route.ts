import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Delivery from "@/models/Delivery";
import DeliveryHistory from "@/models/DeliveryHistory";
import mongoose from "mongoose";
import { verify } from "jsonwebtoken";
import { sendSMS, messageTemplates } from "@/lib/twilio";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function normalizePhone(phone: string | undefined | null) {
  // Check if phone is undefined or null before using replace
  if (!phone) return '';
  // Remove all non-digit characters and leading country code
  return phone.replace(/\D/g, '').replace(/^91/, '');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ trackingId: string }> }
) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { id: string; phone: string; role: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToDatabase();

    const { trackingId } = await context.params;
    const body = await request.json();
    
    console.log('[API] Rescheduling delivery for trackingId:', trackingId);
    console.log('[API] Decoded token:', decoded);
    console.log('[API] Request body:', body);
    
    if (!body.deliveryDate || !body.deliveryTime) {
      return NextResponse.json(
        { error: 'Delivery date and time are required' },
        { status: 400 }
      );
    }
    
    // First try to find in Delivery collection
    let delivery = await Delivery.findOne({ trackingId });
    let isDeliveryModel = true;
    
    // If not found, try to find in DeliveryHistory raw collection
    if (!delivery) {
      console.log('[API] Not found in Delivery, checking DeliveryHistory...');
      const db = mongoose.connection.db;
      const deliveryHistoryCollection = db.collection('DeliveryHistory');
      const rawDelivery = await deliveryHistoryCollection.findOne({ 
        $or: [
          { trackingId: trackingId },
          { consignment_id: trackingId }
        ]
      });
      
      if (rawDelivery) {
        console.log('[API] Found in DeliveryHistory collection');
        delivery = rawDelivery;
        isDeliveryModel = false;
      }
    }
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    // For admin users, skip phone verification
    if (decoded.role !== 'admin') {
      // Extract phone numbers for comparison
      const deliveryPhone = delivery.phone || delivery.receiver_phone;
      console.log('[API] Delivery phone:', deliveryPhone);
      
      if (!deliveryPhone) {
        console.log('[API] No phone number associated with delivery');
        return NextResponse.json({ error: 'Unauthorized - No phone associated with delivery' }, { status: 403 });
      }

      // Check if this delivery belongs to the authenticated user
      const normalizedDeliveryPhone = normalizePhone(deliveryPhone);
      const normalizedDecodedPhone = normalizePhone(decoded.phone);
      
      // Allow more flexible phone matching
      // Remove any leading zeros for comparison
      const cleanDeliveryPhone = normalizedDeliveryPhone.replace(/^0+/, '');
      const cleanUserPhone = normalizedDecodedPhone.replace(/^0+/, '');
      
      // Check if one is a suffix of the other (handles different country code formats)
      const isPhoneMatch = cleanDeliveryPhone.endsWith(cleanUserPhone) || 
                          cleanUserPhone.endsWith(cleanDeliveryPhone);
      
      if (!isPhoneMatch) {
        console.log('[API] Phone mismatch:', deliveryPhone, decoded.phone, '->', normalizedDeliveryPhone, normalizedDecodedPhone);
        return NextResponse.json({ error: 'Unauthorized - Phone number mismatch' }, { status: 403 });
      }
    }
    
    // Check if the delivery is eligible for rescheduling
    function isEligibleForReschedule(delivery) {
      // Different statuses across collections
      const eligibleStatuses = [
        'scheduled', 'rescheduled', 'pending', 'item booked', 
        'in transit', 'received at destination mpc', 
        'received at delivery po'
      ];
      
      const status = delivery.status?.toLowerCase() || 
                    delivery.delivery_status?.toLowerCase() || 
                    delivery.event?.toLowerCase() || '';
                    
      if (!eligibleStatuses.includes(status)) {
        return false;
      }
      
      // Check delivery date
      const deliveryDate = new Date(
        delivery.deliveryDate || 
        delivery.delivery_date || 
        delivery.created_at || 
        delivery.timestamp || 
        new Date()
      );
      
      const now = new Date();
      const isToday = now.toDateString() === deliveryDate.toDateString();
      const cutoff = new Date(deliveryDate);
      cutoff.setHours(9, 30, 0, 0);
      return !isToday || (isToday && now < cutoff);
    }
    
    if (!isEligibleForReschedule(delivery)) {
      return NextResponse.json(
        { error: 'This delivery is not eligible for rescheduling' },
        { status: 400 }
      );
    }
    
    // Process the rescheduling
    const newDate = new Date(body.deliveryDate);
    const oldDate = new Date(
      delivery.deliveryDate || 
      delivery.delivery_date || 
      delivery.created_at || 
      delivery.timestamp || 
      new Date()
    );
    
    const oldTime = delivery.deliveryTime || delivery.delivery_time || '9:00 AM - 5:00 PM';
    
    // Create a reschedule entry
    const rescheduleEntry = {
      oldDate,
      oldTime,
      newDate,
      newTime: body.deliveryTime,
      timestamp: new Date(),
      reason: body.reason || 'Customer requested reschedule'
    };
    
    // Update the delivery based on which collection it belongs to
    let updatedDelivery;
    
    if (isDeliveryModel) {
      // Update the Delivery model
      updatedDelivery = await Delivery.findByIdAndUpdate(
        delivery._id,
        {
          $set: {
            deliveryDate: newDate,
            deliveryTime: body.deliveryTime,
            status: 'rescheduled'
          },
          $push: {
            rescheduleHistory: rescheduleEntry
          }
        },
        { new: true }
      );
    } else {
      // Update in the raw collection
      const db = mongoose.connection.db;
      const deliveryHistoryCollection = db.collection('DeliveryHistory');
      
      // Add a new entry in DeliveryHistory for the reschedule event
      await deliveryHistoryCollection.insertOne({
        consignment_id: delivery.trackingId || delivery.consignment_id,
        event: 'Rescheduled',
        timestamp: new Date(),
        location: 'Customer Portal',
        handled_by: 'Customer',
        notes: `Rescheduled from ${oldDate.toISOString().split('T')[0]} ${oldTime} to ${newDate.toISOString().split('T')[0]} ${body.deliveryTime}`,
        metadata: {
          oldDate,
          oldTime,
          newDate,
          newTime: body.deliveryTime
        }
      });
      
      // Also update the original delivery document if possible
      const updateResult = await deliveryHistoryCollection.updateOne(
        { _id: delivery._id },
        {
          $set: {
            deliveryDate: newDate,
            deliveryTime: body.deliveryTime,
            status: 'Rescheduled',
            updated_at: new Date()
          }
        }
      );
      
      console.log('[API] Raw collection update result:', updateResult);
      
      // Get the updated delivery
      updatedDelivery = await deliveryHistoryCollection.findOne({ _id: delivery._id });
    }
    
    // Send SMS notification
    try {
      const phone = delivery.phone || delivery.receiver_phone;
      if (phone) {
        const message = messageTemplates.rescheduled(
          delivery.trackingId || delivery.consignment_id,
          body.deliveryDate,
          body.deliveryTime
        );
        await sendSMS(phone, message);
        console.log('[API] Reschedule notification SMS sent to:', phone);
      }
    } catch (smsError) {
      console.error('Failed to send reschedule SMS:', smsError);
      // Continue with the process even if SMS fails
    }
    
    return NextResponse.json({
      message: 'Delivery rescheduled successfully',
      deliveryDate: body.deliveryDate,
      deliveryTime: body.deliveryTime,
      trackingId
    });
  } catch (error) {
    console.error('Error rescheduling delivery:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule delivery', details: String(error) },
      { status: 500 }
    );
  }
} 