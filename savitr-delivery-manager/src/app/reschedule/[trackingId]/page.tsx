"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface DeliverySlot {
  date: string;
  time: string;
}

interface Delivery {
  id: string;
  trackingId: string;
  senderName: string;
  currentSlot: DeliverySlot;
  status: string;
}

export default function ReschedulePage() {
  const { isRecipient, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const trackingId = params.trackingId as string;
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSlot, setNewSlot] = useState<DeliverySlot>({
    date: "",
    time: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isRecipient && !isAdmin) {
      router.push("/auth/recipient/login");
      return;
    }

    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recipient/deliveries/${trackingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch delivery details");
        }

        const data = await response.json();
        setDelivery(data);
      } catch (err: any) {
        setError(err.message || "Failed to load delivery details");
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [isRecipient, isAdmin, router, trackingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      // Debug log: print the JWT token
      const token = localStorage.getItem("token");
      console.log("JWT token being sent:", token);

      const response = await fetch(`/api/delivery/reschedule/${trackingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryDate: newSlot.date,
          deliveryTime: newSlot.time,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reschedule delivery");
      }

      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/recipient/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reschedule delivery");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isAdmin) {
      router.push("/admin");
    } else {
      router.push("/recipient/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delivery details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Delivery not found</h1>
            <p className="mt-2 text-gray-600">The requested delivery could not be found.</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/recipient/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reschedule Delivery</CardTitle>
            <CardDescription>
              Select a new delivery slot for Parcel #{delivery.trackingId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">New Delivery Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">New Delivery Time</Label>
                <select
                  id="time"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a time slot</option>
                  <option value="10:00 AM - 12 NOON">10:00 AM - 12 NOON</option>
                  <option value="12 NOON - 3:00 PM">12 NOON - 3:00 PM</option>
                  <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
                </select>
              </div>

              {error && (
                <div className="text-sm text-red-500">{error}</div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Rescheduling..." : "Reschedule Delivery"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
} 