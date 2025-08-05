'use client';

import ConsignmentBookingForm from '@/components/ConsignmentBookingForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ConsignmentBookingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <ConsignmentBookingForm />
      </main>
      <Footer />
    </div>
  );
} 