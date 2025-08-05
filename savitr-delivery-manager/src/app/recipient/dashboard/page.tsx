"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryStatus } from "@/models/Delivery";
import { format } from "date-fns";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

interface HistoryEvent {
  event: string;
  timestamp: string;
  location: string;
  notes?: string;
}

interface Delivery {
  id: string;
  trackingId: string;
  senderName: string;
  currentSlot: {
    date: string;
    time: string;
  };
  status: string;
  source?: string;
  location?: string;
  historyEvents?: HistoryEvent[];
  rescheduleHistory?: Array<{
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    timestamp: string;
    reason?: string;
  }>;
  isEligibleForReschedule: boolean;
}

export default function RecipientDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/recipient/login");
      return;
    }

    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/recipient/deliveries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch deliveries");
        }

        const data = await response.json();
        console.log("Fetched deliveries:", data); // Debug log
        setDeliveries(data.deliveries || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load deliveries";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Map DeliveryHistory event names to DeliveryStatus
  const mapEventToStatus = (event: string): string => {
    const statusMap = {
      'Item Booked': DeliveryStatus.SCHEDULED,
      'Dispatched from Origin PO': DeliveryStatus.SCHEDULED,
      'Received at Origin MPC': DeliveryStatus.SCHEDULED,
      'In Transit': DeliveryStatus.SCHEDULED,
      'Received at Destination MPC': DeliveryStatus.SCHEDULED,
      'Received at Delivery PO': DeliveryStatus.SCHEDULED,
      'Out for Delivery': DeliveryStatus.OUT_FOR_DELIVERY,
      'Delivered': DeliveryStatus.DELIVERED,
      'Delivery Failed': DeliveryStatus.FAILED,
      'Rescheduled': DeliveryStatus.RESCHEDULED,
      'Cancelled': 'cancelled'
    };
    return statusMap[event] || event;
  };

  // Filter deliveries based on status
  const upcomingDeliveries = deliveries.filter((delivery: Delivery) => {
    // If no date is provided, assume it's upcoming
    if (!delivery.currentSlot.date) return true;
    
    const deliveryDate = new Date(delivery.currentSlot.date);
    const startOfDeliveryDay = new Date(
      deliveryDate.getFullYear(),
      deliveryDate.getMonth(),
      deliveryDate.getDate()
    );
    
    const isUpcomingDate = startOfDeliveryDay >= startOfToday;
    
    // Handle DeliveryHistory:Event source specially
    if (delivery.source === 'DeliveryHistory:Event') {
      const mappedStatus = mapEventToStatus(delivery.status);
      const upcomingEvents = [
        'Item Booked', 
        'Dispatched from Origin PO', 
        'Received at Origin MPC',
        'In Transit', 
        'Received at Destination MPC', 
        'Received at Delivery PO',
        'Out for Delivery'
      ];
      return upcomingEvents.includes(delivery.status);
    }
    
    // Normalize status to match DeliveryStatus enum
    const normalizedStatus = delivery.status.toLowerCase().replace(/-/g, '_');
    
    const isUpcomingStatus = [
      DeliveryStatus.SCHEDULED.toLowerCase(),
      DeliveryStatus.RESCHEDULED.toLowerCase(),
      DeliveryStatus.PENDING.toLowerCase(),
      DeliveryStatus.OUT_FOR_DELIVERY.toLowerCase()
    ].includes(normalizedStatus);

    console.log("Delivery filtering:", {
      id: delivery.trackingId,
      status: delivery.status,
      normalizedStatus,
      date: deliveryDate,
      isUpcomingDate,
      isUpcomingStatus
    });

    return isUpcomingDate && isUpcomingStatus;
  });

  const failedDeliveries = deliveries.filter(
    (delivery: Delivery) => 
      delivery.status.toLowerCase() === DeliveryStatus.FAILED.toLowerCase() ||
      delivery.status === 'Delivery Failed'
  );

  const pastDeliveries = deliveries.filter(
    (delivery: Delivery) => 
      (delivery.status.toLowerCase() === DeliveryStatus.DELIVERED.toLowerCase() ||
       delivery.status === 'Delivered') && 
      new Date(delivery.currentSlot.date) < startOfToday
  );

  const outForDeliveryDeliveries = deliveries.filter(
    (delivery: Delivery) => 
      delivery.status.toLowerCase().replace(/-/g, '_') === DeliveryStatus.OUT_FOR_DELIVERY.toLowerCase() ||
      delivery.status === 'Out for Delivery'
  );

  function getStatusBadgeClasses(status: string) {
    const normalizedStatus = status.toLowerCase().replace(/-/g, '_');
    
    switch (normalizedStatus) {
      case DeliveryStatus.SCHEDULED.toLowerCase():
      case 'item booked':
      case 'dispatched from origin po':
      case 'received at origin mpc':
      case 'in transit':
      case 'received at destination mpc':
      case 'received at delivery po':
        return "bg-blue-100 text-blue-800";
      case DeliveryStatus.RESCHEDULED.toLowerCase():
      case 'rescheduled':
        return "bg-yellow-100 text-yellow-800";
      case DeliveryStatus.OUT_FOR_DELIVERY.toLowerCase():
      case 'out for delivery':
        return "bg-orange-100 text-orange-800";
      case DeliveryStatus.PENDING.toLowerCase():
        return "bg-purple-100 text-purple-800";
      case DeliveryStatus.DELIVERED.toLowerCase():
      case 'delivered':
        return "bg-green-100 text-green-800";
      case DeliveryStatus.FAILED.toLowerCase():
      case 'delivery failed':
        return "bg-red-100 text-red-800";
      case 'cancelled':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function formatStatusDisplay(status: string) {
    // For DeliveryHistory events, show the event name
    if (['Item Booked', 'Dispatched from Origin PO', 'Received at Origin MPC',
         'In Transit', 'Received at Destination MPC', 'Received at Delivery PO',
         'Out for Delivery', 'Delivered', 'Delivery Failed', 
         'Rescheduled', 'Cancelled'].includes(status)) {
      return status;
    }
    
    // For other statuses, convert to uppercase with spaces
    return status.replace(/-/g, ' ').toUpperCase();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-600">Manage your deliveries here</p>
        </div>

        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Upcoming Deliveries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>Parcel #{delivery.trackingId}</CardTitle>
                      <CardDescription>
                        From: {delivery.senderName || "Unknown Sender"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Delivery Date:</span>{" "}
                          {format(new Date(delivery.currentSlot.date), "PPP")}
                        </p>
                        <p>
                          <span className="font-semibold">Time:</span>{" "}
                          {delivery.currentSlot.time}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeClasses(delivery.status)}`}
                          >
                            {formatStatusDisplay(delivery.status)}
                          </span>
                        </p>
                        {delivery.location && (
                          <p>
                            <span className="font-semibold">Location:</span>{" "}
                            {delivery.location}
                          </p>
                        )}
                        {delivery.rescheduleHistory && delivery.rescheduleHistory.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            Rescheduled {delivery.rescheduleHistory.length} time(s)
                          </div>
                        )}
                        {delivery.source && (
                          <div className="mt-2 text-xs text-gray-400">
                            Source: {delivery.source}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {delivery.isEligibleForReschedule ? (
                        <Link
                          href={`/recipient/reschedule/${delivery.trackingId}`}
                          className="w-full"
                        >
                          <Button className="w-full">Reschedule</Button>
                        </Link>
                      ) : (
                        <div className="w-full">
                          <Button className="w-full" disabled>
                            Not Eligible for Reschedule
                          </Button>
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            {delivery.status.toLowerCase() === DeliveryStatus.DELIVERED.toLowerCase() || delivery.status === 'Delivered' ? 
                              "This delivery has already been completed." :
                              delivery.status.toLowerCase() === DeliveryStatus.OUT_FOR_DELIVERY.toLowerCase() || delivery.status === 'Out for Delivery' ?
                              "This delivery is already out for delivery." :
                              delivery.status.toLowerCase() === DeliveryStatus.FAILED.toLowerCase() || delivery.status === 'Delivery Failed' ?
                              "This delivery has failed." :
                              "Rescheduling is not available after 9:30 AM on the delivery day."}
                          </p>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
                {upcomingDeliveries.length === 0 && (
                  <p className="text-gray-500">No upcoming deliveries</p>
                )}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Out for Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outForDeliveryDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>Parcel #{delivery.trackingId}</CardTitle>
                      <CardDescription>
                        From: {delivery.senderName || "Unknown Sender"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Delivery Date:</span>{" "}
                          {format(new Date(delivery.currentSlot.date), "PPP")}
                        </p>
                        <p>
                          <span className="font-semibold">Time:</span>{" "}
                          {delivery.currentSlot.time}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="px-2 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                            OUT FOR DELIVERY
                          </span>
                        </p>
                        {delivery.location && (
                          <p>
                            <span className="font-semibold">Location:</span>{" "}
                            {delivery.location}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {outForDeliveryDeliveries.length === 0 && (
                  <p className="text-gray-500">No deliveries out for delivery</p>
                )}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Failed Deliveries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {failedDeliveries.map((delivery, idx) => (
                  <Card key={`${delivery.source || ''}-${delivery.id}-failed-${idx}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>Parcel #{delivery.trackingId}</CardTitle>
                      <CardDescription>
                        From: {delivery.senderName || "Unknown Sender"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Delivery Date:</span>{" "}
                          {format(new Date(delivery.currentSlot.date), "PPP")}
                        </p>
                        <p>
                          <span className="font-semibold">Time:</span>{" "}
                          {delivery.currentSlot.time}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="px-2 py-1 rounded-full text-sm bg-red-100 text-red-800">
                            {delivery.status}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {failedDeliveries.length === 0 && (
                  <p className="text-gray-500">No failed deliveries</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Past Deliveries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastDeliveries.map((delivery, idx) => (
                  <Card key={`${delivery.source || ''}-${delivery.id}-past-${idx}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>Parcel #{delivery.trackingId}</CardTitle>
                      <CardDescription>
                        From: {delivery.senderName || "Unknown Sender"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Delivery Date:</span>{" "}
                          {format(new Date(delivery.currentSlot.date), "PPP")}
                        </p>
                        <p>
                          <span className="font-semibold">Time:</span>{" "}
                          {delivery.currentSlot.time}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            {delivery.status}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pastDeliveries.length === 0 && (
                  <p className="text-gray-500">No past deliveries</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
} 