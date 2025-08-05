import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import RecipientUser from '@/models/RecipientUser';
import Delivery from '@/models/Delivery';
import Consignment from '@/models/Consignment';
import { generateOTP } from '@/lib/utils';
import { sendSMS, messageTemplates } from '@/lib/twilio';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    console.log('Received OTP send request');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { phone } = body;

    if (!phone) {
      console.error('Phone number is missing');
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Clean the phone number (remove any non-digit characters)
    const cleanedPhone = phone.replace(/\D/g, '');
    console.log('Cleaned phone number:', cleanedPhone);

    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');

    // Create array of possible phone number formats
    const phoneFormats = [
      cleanedPhone,
      `+91${cleanedPhone}`,
      `91${cleanedPhone}`,
      `0${cleanedPhone}`
    ];

    let recipient = null;
    
    // Try to find in RecipientUser collection first
    recipient = await RecipientUser.findOne({
      $or: [
        { phone: { $in: phoneFormats } },
        { phone: { $regex: `^${cleanedPhone}$`, $options: 'i' } }
      ]
    });
    
    // If not found, try to find the phone in Delivery collection
    if (!recipient) {
      console.log('Searching in Delivery collection...');
      const delivery = await Delivery.findOne({
        phone: { $in: phoneFormats }
      });
      
      if (delivery) {
        console.log('Found in Delivery collection with phone:', delivery.phone);
        // Create a new recipient user based on delivery information
        recipient = new RecipientUser({
          name: delivery.name,
          phone: delivery.phone,
          email: delivery.email || `${cleanedPhone}@example.com`, // Fallback email
          address: delivery.address
        });
        
        // Save the new recipient
        try {
          await recipient.save();
          console.log('Created new recipient user from delivery data');
        } catch (error) {
          console.error('Error creating new recipient from delivery:', error);
          // If it fails due to duplicate, try to find the existing one
          if (error.code === 11000) { // MongoDB duplicate key error
            recipient = await RecipientUser.findOne({ phone: delivery.phone });
          }
        }
      }
    }
    
    // If still not found, check ConsignmentTable collection
    if (!recipient) {
      console.log('Searching in ConsignmentTable collection...');
      const consignment = await Consignment.findOne({
        receiver_phone: { $in: phoneFormats }
      });
      
      if (consignment) {
        console.log('Found in ConsignmentTable collection with receiver_phone:', consignment.receiver_phone);
        // Create a new recipient user based on consignment information
        recipient = new RecipientUser({
          name: consignment.receiver_name,
          phone: consignment.receiver_phone,
          email: `${cleanedPhone}@example.com`, // Fallback email
          address: consignment.receiver_address
        });
        
        // Save the new recipient
        try {
          await recipient.save();
          console.log('Created new recipient user from consignment data');
        } catch (error) {
          console.error('Error creating new recipient from consignment:', error);
          // If it fails due to duplicate, try to find the existing one
          if (error.code === 11000) { // MongoDB duplicate key error
            recipient = await RecipientUser.findOne({ phone: consignment.receiver_phone });
          }
        }
      }
    }
    
    // Check raw DeliveryHistory collection as a last resort
    if (!recipient) {
      console.log('Searching in raw DeliveryHistory collection...');
      const db = mongoose.connection.db;
      const deliveryHistoryCollection = db.collection('DeliveryHistory');
      
      const deliveryRecord = await deliveryHistoryCollection.findOne({
        $or: phoneFormats.map(p => ({ phone: p }))
      });
      
      if (deliveryRecord) {
        console.log('Found in DeliveryHistory collection');
        // Create a new recipient user based on delivery history information
        recipient = new RecipientUser({
          name: deliveryRecord.name || 'Unknown',
          phone: deliveryRecord.phone,
          email: deliveryRecord.email || `${cleanedPhone}@example.com`, // Fallback email
          address: deliveryRecord.address || 'Unknown'
        });
        
        // Save the new recipient
        try {
          await recipient.save();
          console.log('Created new recipient user from DeliveryHistory data');
        } catch (error) {
          console.error('Error creating new recipient from DeliveryHistory:', error);
          // If it fails due to duplicate, try to find the existing one
          if (error.code === 11000) { // MongoDB duplicate key error
            recipient = await RecipientUser.findOne({ phone: deliveryRecord.phone });
          }
        }
      }
    }
    
    console.log('Found recipient:', recipient ? JSON.stringify(recipient, null, 2) : 'Not found');

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    // Update recipient with OTP
    try {
      await RecipientUser.findByIdAndUpdate(recipient._id, {
        $set: {
          otp,
          otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          otpAttempts: 0
        }
      });
      console.log('OTP saved to recipient');
    } catch (updateError) {
      console.error('Failed to update recipient with OTP:', updateError);
      return NextResponse.json(
        { error: 'Failed to save OTP' },
        { status: 500 }
      );
    }

    // Send SMS
    try {
      await sendSMS(recipient.phone, messageTemplates.otp(otp));
      console.log('SMS sent successfully');
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
      return NextResponse.json(
        { error: 'Failed to send OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      phone: recipient.phone 
    });
  } catch (error) {
    console.error('Error in OTP send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 