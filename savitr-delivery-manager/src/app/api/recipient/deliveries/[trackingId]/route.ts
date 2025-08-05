import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Delivery from "@/models/Delivery";
import DeliveryHistory from "@/models/DeliveryHistory";
import Consignment from "@/models/Consignment";
import mongoose from "mongoose";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function normalizePhone(phone: string | undefined | null) {
  // Check if phone is undefined or null before using replace
  if (!phone) return '';
  // Remove all non-digit characters and leading country code
  return phone.replace(/\D/g, '').replace(/^91/, '');
}

export async function GET(
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
    console.log('[API] Fetching delivery for trackingId:', trackingId);
    console.log('[API] Decoded token:', decoded);
    
    // First try to find in Delivery collection
    let delivery = await Delivery.findOne({ trackingId }).lean();
    
    // If not found in Delivery, try to find in DeliveryHistory raw collection
    if (!delivery) {
      console.log('[API] Not found in Delivery, checking DeliveryHistory...');
      const db = mongoose.connection.db;
      const deliveryHistoryCollection = db.collection('DeliveryHistory');
      delivery = await deliveryHistoryCollection.findOne({ 
        $or: [
          { trackingId: trackingId },
          { consignment_id: trackingId }
        ]
      });
      
      if (delivery) {
        console.log('[API] Found in DeliveryHistory collection');
      }
    }
    
    // If still not found, try the Consignment collection
    if (!delivery) {
      console.log('[API] Not found in DeliveryHistory either, checking Consignment...');
      delivery = await Consignment.findOne({ consignment_id: trackingId }).lean();
      
      if (delivery) {
        console.log('[API] Found in Consignment collection');
      }
    }
    
    // If delivery is still not found, return 404
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    console.log('[API] Delivery found:', !!delivery);

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

    // Format the response
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
    
    // Organize delivery data depending on which collection it came from
    const formattedDelivery = {
      id: delivery._id || '',
      trackingId: delivery.trackingId || delivery.consignment_id || trackingId,
      senderName: delivery.name || delivery.senderName || delivery.sender_name || 'Unknown',
      currentSlot: {
        date: delivery.deliveryDate || delivery.delivery_date || delivery.created_at || delivery.timestamp || new Date(),
        time: delivery.deliveryTime || delivery.delivery_time || '9:00 AM - 5:00 PM'
      },
      status: delivery.status || delivery.delivery_status || delivery.event || 'pending',
      location: delivery.location || '',
      rescheduleHistory: delivery.rescheduleHistory || [],
      isEligibleForReschedule: isEligibleForReschedule(delivery)
    };

    return NextResponse.json(formattedDelivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 