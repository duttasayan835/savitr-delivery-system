import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

const ADMIN_EMAIL = 'say.admin@savitr.com';
const ADMIN_PASSWORD = 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = sign(
        { email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return NextResponse.json({
        message: 'Admin login successful',
        token,
        user: {
          email,
          role: 'admin',
          name: 'Admin'
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Admin login failed' },
      { status: 500 }
    );
  }
} 