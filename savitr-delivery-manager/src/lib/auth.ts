import jwt from 'jsonwebtoken';
import { UserRole } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './mongodb';
import AdminUser from '@/models/AdminUser';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export function isAdmin(user: TokenPayload | null): boolean {
  return user?.role === UserRole.ADMIN;
}

export function isRecipient(user: TokenPayload | null): boolean {
  return user?.role === UserRole.RECIPIENT;
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectToDatabase();

        const admin = await AdminUser.findOne({ email: credentials.email });
        
        if (!admin) {
          throw new Error('No admin found with this email');
        }

        const isValid = await admin.comparePassword(credentials.password);
        
        if (!isValid) {
          throw new Error('Invalid password');
        }

        if (!admin.is_active) {
          throw new Error('Account is deactivated');
        }

        // Update last login
        await AdminUser.findByIdAndUpdate(admin._id, {
          last_login: new Date()
        });

        return {
          id: admin.admin_id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
