"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/contexts/hooks/use-toast";
import { formatPhoneNumber } from "@/lib/notifications";

export default function TwilioHelpPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedNumber, setFormattedNumber] = useState("");
  const { toast } = useToast();

  const formatPhone = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const formatted = formatPhoneNumber(phoneNumber);
      setFormattedNumber(formatted);
      toast({
        title: "Phone Number Formatted",
        description: `Formatted as: ${formatted}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to format phone number",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container py-10">
        <h1 className="text-3xl font-bold mb-4">Twilio SMS Setup Guide</h1>
        <p className="text-gray-500 mb-6">
          This guide helps you set up Twilio for SMS notifications in Savitr Delivery Manager
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Twilio Trial Account Limitations</CardTitle>
              <CardDescription>
                Understanding Twilio's restrictions for trial accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Twilio trial accounts have certain limitations:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You can only send SMS to <strong>verified phone numbers</strong></li>
                <li>You need to verify each recipient's phone number in your Twilio console</li>
                <li>Your account balance is limited</li>
                <li>The SMS will contain a Twilio trial message prefix</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded p-4 text-amber-800">
                <h3 className="font-semibold">How Savitr Handles This</h3>
                <p className="text-sm mt-1">
                  In development mode, Savitr will simulate SMS sending when Twilio encounters
                  unverified numbers. This allows you to test without verifying every phone number.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Verify Phone Numbers</CardTitle>
              <CardDescription>
                Steps to verify phone numbers in your Twilio console
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Log in to your <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Twilio Console</a></li>
                <li>Navigate to <strong>Phone Numbers</strong> → <strong>Verified Caller IDs</strong></li>
                <li>Click the <strong>+</strong> button to add a new verified number</li>
                <li>Enter the phone number in E.164 format (e.g., +917908261234)</li>
                <li>Twilio will send a verification code to that number</li>
                <li>Enter the code to complete verification</li>
              </ol>

              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800 mt-4">
                <h3 className="font-semibold">Production Environment</h3>
                <p className="text-sm mt-1">
                  For production use, you should upgrade to a paid Twilio account,
                  which removes these verification requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Phone Number Formatter</CardTitle>
            <CardDescription>
              Convert phone numbers to E.164 format for Twilio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Phone Number
              </label>
              <Input
                id="phone"
                placeholder="e.g., 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter with or without country code
              </p>
            </div>

            {formattedNumber && (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm font-medium text-green-800">Formatted Number:</p>
                <p className="text-lg font-bold text-green-700">{formattedNumber}</p>
                <p className="text-xs text-green-600 mt-1">
                  Use this format when verifying in Twilio
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={formatPhone} className="w-full">
              Format Number
            </Button>
          </CardFooter>
        </Card>

        <div className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
          <p className="mb-4">
            These environment variables control SMS behavior in development:
          </p>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm">
            <p><span className="text-purple-600">SEND_REAL_SMS_IN_DEV</span>=<span className="text-green-600">true</span> <span className="text-gray-500"># Try to send real SMS in development mode</span></p>
            <p><span className="text-purple-600">SEND_MOCK_NOTIFICATIONS</span>=<span className="text-green-600">true</span> <span className="text-gray-500"># Send notifications for mock deliveries</span></p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 