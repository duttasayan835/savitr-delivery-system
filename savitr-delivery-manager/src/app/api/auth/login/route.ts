import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { sign } from 'jsonwebtoken';
import RecipientUser from '@/models/RecipientUser';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'say.admin@savitr.com';
const ADMIN_PASSWORD = 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Check for admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = sign(
        { email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: {
          email,
          role: 'admin'
        }
      });
    }

    // Connect to database
    await connectToDatabase();

    // Handle recipient login (OTP verification)
    const recipient = await RecipientUser.findOne({ email });
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // For recipients, we'll use OTP verification instead of password
    const token = sign(
      {
        id: recipient._id,
        email: recipient.email,
        role: 'recipient'
      },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
