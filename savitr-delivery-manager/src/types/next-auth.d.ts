import { UserRole } from '@/models/User';
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    phone?: string;
  }

  interface Session {
    user: User;
  }
} 