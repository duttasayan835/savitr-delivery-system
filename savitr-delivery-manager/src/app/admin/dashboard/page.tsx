"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardStats from "@/components/admin/DashboardStats";
import DeliverySearch from "@/components/admin/DeliverySearch";
import DeliveryForm from "@/components/admin/DeliveryForm";
import RouteOptimizer from "@/components/admin/RouteOptimizer";
import ConsignmentBookingForm from "@/components/ConsignmentBookingForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { getPredictedSlot } from "./aiClient";

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('deliveries');

  // Fetch all deliveries on mount
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      fetchDeliveries();
    }
  }, [loading, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/admin/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  const fetchDeliveries = async (params?: any) => {
    setIsLoading(true);
    try {
      let url = "/api/delivery";
      if (params) {
        const query = new URLSearchParams(params).toString();
        url += `?${query}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setDeliveries(data.deliveries || []);
      // Optionally, update stats here if your API returns them
    } catch (err) {
      toast.error("Failed to fetch deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for DeliverySearch
  const handleSearch = (params: any) => {
    // Map search params to API query params
    const query: any = {};
    if (params.query) query.search = params.query;
    if (params.status && params.status !== "all") query.status = params.status;
    // Add more mappings as needed
    fetchDeliveries(query);
  };

  // Handler for DeliveryForm
  const handleCreateDelivery = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Creating delivery with data:", data);
      
      // Get the predicted slot from the form's already populated field
      // which was automatically set by our prediction callback
      const predictedSlot = data.deliveryTime;
      console.log("Using predicted slot from form:", predictedSlot);

      // Make sure coordinates are properly included
      // The form returns them as numbers, preserve that type
      const latitude = data.latitude !== undefined ? data.latitude : null;
      const longitude = data.longitude !== undefined ? data.longitude : null;
      
      console.log("Coordinates being sent:", { latitude, longitude });

      // Add predictedSlot and coordinates to the delivery data explicitly
      const deliveryPayload = { 
        ...data, 
        predictedSlot,
        latitude,
        longitude
      };
      console.log("Final delivery payload:", deliveryPayload);

      // Create delivery
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryPayload),
      });
      
      if (!res.ok) {
        console.error("Error response from server:", res.status, res.statusText);
        throw new Error("Failed to create delivery");
      }
      
      const responseData = await res.json();
      console.log("Delivery created successfully:", responseData);
      
      toast.success("Delivery created successfully");
      fetchDeliveries();
    } catch (err) {
      console.error("Error in create delivery:", err);
      toast.error("Failed to create delivery");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-gray-600">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="mb-8">
          <DashboardStats />
        </div>
        
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'deliveries' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('deliveries')}
          >
            Manage Deliveries
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'routes' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('routes')}
          >
            Route Optimization
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'consignments' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('consignments')}
          >
            Consignments
          </button>
        </div>
        
        {activeTab === 'deliveries' && (
          <>
            <div className="mb-8">
              <DeliverySearch onSearch={handleSearch} isLoading={isLoading} />
            </div>
            <div className="mb-8">
              <DeliveryForm 
                onSubmit={handleCreateDelivery} 
                isSubmitting={isLoading}
                getPrediction={getPredictedSlot}
              />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">All Deliveries</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking ID</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Predicted Slot</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery._id}>
                        <TableCell>{delivery.trackingId}</TableCell>
                        <TableCell>{delivery.name || delivery.recipientName}</TableCell>
                        <TableCell>{delivery.product || delivery.productInfo}</TableCell>
                        <TableCell>{delivery.deliveryDate} {delivery.deliveryTime}</TableCell>
                        <TableCell>{delivery.status}</TableCell>
                        <TableCell>{delivery.predictedSlot || "N/A"}</TableCell>
                        <TableCell>
                          {delivery.latitude != null && delivery.longitude != null 
                            ? `${Number(delivery.latitude).toFixed(4)}, ${Number(delivery.longitude).toFixed(4)}`
                            : "Not set"}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`/reschedule/${delivery.trackingId}`}
                            className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Reschedule
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'routes' && (
          <div className="mb-8">
            <RouteOptimizer deliveries={deliveries} />
          </div>
        )}
        
        {activeTab === 'consignments' && (
          <div className="mb-8">
            <ConsignmentBookingForm />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 