"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SignupForm } from "@/components/auth/SignupForm";
import { UserRole } from "@/models/User";

export default function RecipientSignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <SignupForm role={UserRole.RECIPIENT} includeEmail={true} />
      </main>
      <Footer />
    </div>
  );
} 