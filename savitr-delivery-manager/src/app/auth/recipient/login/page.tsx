"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LoginForm } from "@/components/auth/LoginForm";
import { UserRole } from "@/models/User";

export default function RecipientLoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <LoginForm role={UserRole.RECIPIENT} showOtpOption={true} />
      </main>
      <Footer />
    </div>
  );
} 