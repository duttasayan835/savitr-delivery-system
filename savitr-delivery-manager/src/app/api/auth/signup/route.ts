import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import RecipientUser from '@/models/RecipientUser';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/models/User';
import { generateToken } from '@/lib/auth';
import { generateUserId } from '@/lib/mongodb';

// Admin secret code that should match what admins provide during signup
const ADMIN_SECRET = process.env.ADMIN_SECRET_CODE || 'savitr-admin-2024';
// Additional valid admin codes for easier testing
const VALID_ADMIN_CODES = ['savitr-admin-2024', 'admin', 'savitr-admin'];
// Enable development mode when MongoDB connection fails
const DEV_MODE = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  const { name, email, password, phone, role, address } = await req.json();

  console.log('Received signup request:', { name, email, phone, role, address });

  // Basic validation
  if (!name || !password || !role) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // For recipient signup, phone and address are required
  if (role === UserRole.RECIPIENT) {
    if (!phone) {
      console.log('Phone number missing');
      return NextResponse.json(
        { error: "Phone number is required for recipient signup" },
        { status: 400 }
      );
    }

    if (!address) {
      console.log('Address missing');
      return NextResponse.json(
        { error: "Address is required for recipient signup" },
        { status: 400 }
      );
    }
  }

  try {
    // Connect to database
    const mongoose = await connectToDatabase();
    console.log('Database connection established');

    // Check if recipient already exists by phone
    if (phone) {
      const existingRecipient = await RecipientUser.findOne({ phone });
      if (existingRecipient) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Create new recipient user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUserId(phone);
    console.log('Generated userId:', userId);

    const recipient = await RecipientUser.create({
      name,
      email: email || null,
      password_hash: hashedPassword,
      phone,
      address,
      role,
      userId,
      created_at: new Date(),
      is_active: true
    });

    console.log(`User created successfully: ${recipient.name} with ID: ${recipient.userId}`);

    // Generate token
    const token = generateToken({
      userId: recipient._id.toString(),
      name: recipient.name,
      email: recipient.email,
      role: recipient.role
    });

    // Don't return sensitive data in response
    const userData = {
      id: recipient._id,
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone,
      role: recipient.role,
      created_at: recipient.created_at
    };

    return NextResponse.json({ user: userData, token }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A user with this phone number or email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
