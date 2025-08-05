import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to recipient login by default
  redirect('/auth/recipient/login');
} 