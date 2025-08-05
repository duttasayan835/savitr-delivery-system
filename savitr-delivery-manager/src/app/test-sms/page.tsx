"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/contexts/hooks/use-toast";

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !message) {
      toast({
        title: "Missing information",
        description: "Please provide both phone number and message",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/notify-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Failed to send SMS");
      }
      
      toast({
        title: "SMS Sent Successfully!",
        description: `Message sent with SID: ${data.sid}`,
      });
      
      // Clear form
      setMessage("");
    } catch (error: any) {
      console.error("SMS Error:", error);
      toast({
        title: "Failed to send SMS",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">SMS Testing Tool</h1>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Send Test SMS</CardTitle>
              <CardDescription>
                Use this tool to test SMS delivery functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendSMS} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                  />
                  <p className="text-sm text-gray-500">
                    Enter number in E.164 format with country code
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message here..."
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send SMS"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 max-w-lg mx-auto p-4 bg-blue-50 rounded-lg">
            <h2 className="font-medium mb-2">How it works</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Enter a valid phone number with country code (e.g., +919876543210)</li>
              <li>Type your message</li>
              <li>Click "Send SMS" to send the message via Twilio</li>
              <li>You'll receive a notification with the result</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 