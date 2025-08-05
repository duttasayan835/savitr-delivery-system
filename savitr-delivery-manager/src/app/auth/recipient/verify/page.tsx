"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingId = searchParams.get('trackingId');
  const [phone, setPhone] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    try {
      setIsVerifying(true);
      setError("");

      const response = await fetch("/api/recipient/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          trackingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      if (data.exists) {
        // User exists, redirect to login
        router.push(`/auth/recipient/login?phone=${phone}&trackingId=${trackingId}`);
      } else {
        // User doesn't exist, redirect to signup
        router.push(`/auth/recipient/signup?phone=${phone}&trackingId=${trackingId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify phone number");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Your Phone Number</CardTitle>
            <CardDescription>
              Enter your phone number to continue with rescheduling delivery #{trackingId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="^[6-9]\d{9}$"
                  title="Please enter a valid Indian phone number"
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter the phone number where you received the SMS
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-500">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
} 