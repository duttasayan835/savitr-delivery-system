"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, TruckIcon, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { useToast } from "@/contexts/hooks/use-toast";
import { useState } from "react";

const MapTracking = dynamic(() => import("@/components/MapTracking"), { ssr: false });

export default function TrackingPage() {
  // Mock data for recent shipments
  const recentShipments = [
    {
      id: "SAV10029384756",
      origin: "New York, NY",
      destination: "Boston, MA",
      status: "In Transit",
      estimatedDelivery: "Apr 20, 2025",
    },
    {
      id: "SAV10029345671",
      origin: "San Francisco, CA",
      destination: "Los Angeles, CA",
      status: "Out for Delivery",
      estimatedDelivery: "Apr 19, 2025",
    },
    {
      id: "SAV10029307543",
      origin: "Chicago, IL",
      destination: "Detroit, MI",
      status: "Delivered",
      estimatedDelivery: "Apr 18, 2025",
    },
  ];

  // Mock data for tracking details
  const trackingDetails = [
    {
      id: "activity-1",
      date: "Apr 19, 2025 8:37 AM",
      location: "Boston Distribution Center",
      activity: "Package arrived at facility",
      status: "In Progress",
    },
    {
      id: "activity-2",
      date: "Apr 18, 2025 7:14 PM",
      location: "New York Distribution Center",
      activity: "Package departed facility",
      status: "Completed",
    },
    {
      id: "activity-3",
      date: "Apr 18, 2025 2:30 PM",
      location: "New York Distribution Center",
      activity: "Package arrived at facility",
      status: "Completed",
    },
    {
      id: "activity-4",
      date: "Apr 18, 2025 9:45 AM",
      location: "New York, NY",
      activity: "Package picked up",
      status: "Completed",
    },
    {
      id: "activity-5",
      date: "Apr 17, 2025 6:20 PM",
      location: "Savitr-AI System",
      activity: "Shipping label created",
      status: "Completed",
    },
  ];

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Demo SMS send
  const sendDemoSMS = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "+19124726151", // Your Twilio-verified demo number
          message: "Savitr Delivery Demo SMS: Your package status has changed!"
        })
      });
      if (!res.ok) throw new Error("Failed to send SMS");
      const data = await res.json();
      toast({ title: "SMS Sent!", description: `SID: ${data.sid}` });
    } catch (error: any) {
      toast({ title: "SMS Send Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Track Your Package</h1>

          {/* MapTracking feature */}
          <MapTracking adminMode={true} showSearch={true} showPolyline={true} />

          {/* Demo Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              onClick={sendDemoSMS}
              disabled={loading}
              type="button"
            >
              {loading ? "Sending SMS..." : "Send SMS Demo"}
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              type="button"
              onClick={() => toast({ title: "This is a toast!", description: "Toast notifications work!" })}
            >
              Show Toast Demo
            </button>
          </div>

          {/* Tracking Search Box */}
          <div className="bg-red-50 rounded-lg p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">Enter Tracking Number</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter tracking number (e.g., SAV1002938475)"
                className="flex-1"
              />
              <Button className="bg-red-600 hover:bg-red-700">
                <Search className="w-4 h-4 mr-2" />
                Track
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Track up to 10 tracking numbers at once. Separate each tracking number with a comma.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Shipments */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Shipments</CardTitle>
                  <CardDescription>Your recent package activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentShipments.map((shipment) => (
                      <div key={shipment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{shipment.id}</div>
                          <div className={`text-sm px-2 py-1 rounded ${
                            shipment.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : shipment.status === "Out for Delivery"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}>
                            {shipment.status}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-semibold">From:</span> {shipment.origin}
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-semibold">To:</span> {shipment.destination}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">Est. Delivery:</span> {shipment.estimatedDelivery}
                          </div>
                        </div>
                        <Button variant="link" className="text-red-600 p-0 h-auto mt-2">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tracking Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Tracking Details</CardTitle>
                      <CardDescription>Tracking # SAV10029384756</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">In Transit</div>
                      <div className="text-sm text-gray-500 mt-1">Est. Delivery: Apr 20, 2025</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="activity" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b p-0">
                      <TabsTrigger
                        value="activity"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:shadow-none"
                      >
                        Activity
                      </TabsTrigger>
                      <TabsTrigger
                        value="details"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:shadow-none"
                      >
                        Shipment Details
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="activity" className="p-4">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <TruckIcon className="w-5 h-5 text-red-600" />
                          <div className="font-medium">New York, NY to Boston, MA</div>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded mb-4">
                          <div className="bg-red-600 h-2 rounded w-3/4" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex flex-col items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                            <div>Shipped</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                            <div>In Transit</div>
                          </div>
                          <div className="flex flex-col items-center text-gray-400">
                            <Clock className="w-5 h-5 mb-1" />
                            <div>Out for Delivery</div>
                          </div>
                          <div className="flex flex-col items-center text-gray-400">
                            <Package className="w-5 h-5 mb-1" />
                            <div>Delivered</div>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-medium mb-3">Detailed Activity</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Activity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trackingDetails.map((detail) => (
                            <TableRow key={detail.id}>
                              <TableCell className="font-medium">{detail.date}</TableCell>
                              <TableCell>{detail.location}</TableCell>
                              <TableCell>{detail.activity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="details" className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-3">Shipment Information</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-gray-500">Tracking Number</div>
                              <div>SAV10029384756</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Ship Date</div>
                              <div>Apr 18, 2025</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Service Type</div>
                              <div>Savitr-AI Standard Shipping</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Weight</div>
                              <div>3.5 lbs / 1.6 kg</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-3">Shipping Address</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-gray-500">From</div>
                              <div>123 Main St</div>
                              <div>New York, NY 10001</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">To</div>
                              <div>Jane Doe</div>
                              <div>456 Park Ave</div>
                              <div>Boston, MA 02108</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
