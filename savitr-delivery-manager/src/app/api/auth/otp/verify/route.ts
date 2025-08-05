import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import RecipientUser from '@/models/RecipientUser';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    console.log('Received OTP verify request');
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Clean the phone number
    const cleanedPhone = phone.replace(/\D/g, '');
    console.log('Verifying OTP for phone:', cleanedPhone);

    // Connect to database
    await connectToDatabase();
    console.log('Database connected successfully');

    // First, let's check all recipients to see what phone numbers exist
    const allRecipients = await RecipientUser.find({}, { phone: 1, name: 1 });
    console.log('All recipients in database:', JSON.stringify(allRecipients, null, 2));

    // Find recipient with any phone number format
    const recipient = await RecipientUser.findOne({
      $or: [
        { phone: cleanedPhone },
        { phone: `+91${cleanedPhone}` },
        { phone: `91${cleanedPhone}` },
        { phone: `0${cleanedPhone}` },
        { phone: { $regex: `^${cleanedPhone}$`, $options: 'i' } }
      ]
    });

    console.log('Found recipient:', recipient ? JSON.stringify(recipient, null, 2) : 'Not found');

    if (!recipient) {
      console.error('Recipient not found for phone:', cleanedPhone);
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Check OTP expiry
    if (recipient.otpExpiry && new Date() > recipient.otpExpiry) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Check OTP attempts
    if (recipient.otpAttempts >= 3) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new OTP' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (recipient.otp !== otp) {
      // Increment attempts
      await RecipientUser.findByIdAndUpdate(recipient._id, {
        $inc: { otpAttempts: 1 }
      });
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Clear OTP data and update last login
    await RecipientUser.findByIdAndUpdate(recipient._id, {
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      last_login: new Date()
    });

    // Generate JWT token
    const token = sign(
      {
        id: recipient._id,
        phone: recipient.phone,
        role: 'recipient'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: recipient._id,
        name: recipient.name,
        phone: recipient.phone,
        role: 'recipient'
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
} 