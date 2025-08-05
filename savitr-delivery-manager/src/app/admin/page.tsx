"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { DeliveryStatus } from "@/models/Delivery";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Package,
  Search,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Filter,
  Info
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/contexts/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";

// Define the type for delivery data from the API
interface Delivery {
  _id: string;
  trackingId: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  product: string;
  status: DeliveryStatus;
  createdAt: string;
  rescheduleHistory: any[];
}

// Form data for creating a new delivery
interface DeliveryFormData {
  name: string;
  phone: string;
  email?: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  product: string;
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("view");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [reschedulingLink, setReschedulingLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DeliveryFormData>();

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!isAdmin) {
      router.push("/");
      return;
    }

    // Fetch deliveries
    fetchDeliveries();
  }, [isAuthenticated, isAdmin, router]);

  // Fetch deliveries from the API
  const fetchDeliveries = async (status: string | null = null, search: string = "") => {
    try {
      setIsLoading(true);
      setError(null);

      let url = "/api/delivery";
      const params: Record<string, string> = {};

      if (status) {
        params.status = status;
      }

      if (search) {
        params.search = search;
      }

      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await axios.get(url);
      setDeliveries(response.data.deliveries);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search and filtering
  const handleSearch = () => {
    fetchDeliveries(statusFilter || null, searchTerm);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    fetchDeliveries(status, searchTerm);
  };

  // Handle form submission to create a new delivery
  const onSubmit = async (data: DeliveryFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Ensure adminId is present and valid
      if (!user?.id) {
        setError('Admin ID is missing. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      
      // Map frontend fields to backend expected fields
      const requestData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        product: data.product,
        deliveryDate: data.deliveryDate,
        deliveryTime: data.deliveryTime,
        adminId: user.id // Use adminId as expected by backend
      };
      
      console.log("Submitting delivery data:", requestData);
      
      const response = await axios.post("/api/delivery", requestData);
      console.log("Delivery creation response:", response.data);
      
      if (response.data.success) {
        // Show success toast
        toast({
          title: "Delivery Created!",
          description: `Tracking ID: ${response.data.delivery.trackingId}`,
        });
        
        // Show rescheduling link if available
        if (response.data.delivery.rescheduleLink) {
          setReschedulingLink(response.data.delivery.rescheduleLink);
        }
        
        // Refresh the deliveries list
        fetchDeliveries();
        
        // Reset the form
        reset();
        
        // Switch to view tab
        setActiveTab("view");
      } else {
        // Handle unexpected success=false responses
        setError(response.data.error || "Failed to create delivery");
      }
    } catch (err: any) {
      console.error("Error creating delivery:", err);
      
      // Get the most detailed error message possible
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message ||
                          err.message ||
                          "Failed to create delivery";
      
      setError(errorMessage);
      
      toast({
        title: "Error Creating Delivery",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get badge color based on status
  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Pending</Badge>;
      case DeliveryStatus.SCHEDULED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case DeliveryStatus.RESCHEDULED:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Rescheduled</Badge>;
      case DeliveryStatus.OUT_FOR_DELIVERY:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Out for Delivery</Badge>;
      case DeliveryStatus.DELIVERED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Delivered</Badge>;
      case DeliveryStatus.FAILED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/admin/twilio-help" className="flex items-center text-sm text-red-600 hover:text-red-800">
              <Info className="h-4 w-4 mr-1" />
              Twilio SMS Help
            </Link>
            <Link href="/consignment/booking" className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Package className="h-4 w-4 mr-2" />
              Consignment Booking
            </Link>
            {activeTab !== "create" ? (
              <Button onClick={() => setActiveTab("create")} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                New Delivery
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setActiveTab("view")}>
                <Package className="h-4 w-4 mr-2" />
                View Deliveries
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">
              <Package className="w-4 h-4 mr-2" />
              View Deliveries
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Create Delivery
            </TabsTrigger>
          </TabsList>

          {/* View Deliveries Tab */}
          <TabsContent value="view" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Search by name, tracking ID, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="p-2 border rounded-md bg-white"
                      value={statusFilter || ""}
                      onChange={(e) => handleStatusFilter(e.target.value || null)}
                    >
                      <option value="">All Status</option>
                      {Object.values(DeliveryStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>

                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                      setStatusFilter(null);
                      fetchDeliveries();
                    }}>
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deliveries Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>All Deliveries</CardTitle>
                <CardDescription>
                  {deliveries.length} deliveries found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading deliveries...</div>
                ) : error ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    {error}
                  </div>
                ) : deliveries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No deliveries found. Create a new delivery to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tracking ID</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Delivery Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveries.map((delivery) => (
                          <TableRow key={delivery._id}>
                            <TableCell className="font-medium">
                              {delivery.trackingId}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{delivery.name}</div>
                              <div className="text-sm text-gray-500">{delivery.phone}</div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={delivery.product}>
                                {delivery.product}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{formatDate(delivery.deliveryDate)}</div>
                              <div className="text-sm text-gray-500">{delivery.deliveryTime}</div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(delivery.status)}
                              {delivery.rescheduleHistory && delivery.rescheduleHistory.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <div>Rescheduled {delivery.rescheduleHistory.length} time(s)</div>
                                  <div>Latest: {format(new Date(delivery.deliveryDate), 'MMM d, yyyy')} at {delivery.deliveryTime}</div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/reschedule/${delivery.trackingId}`} passHref legacyBehavior>
                                <Button as="a" variant="outline" size="sm" className="h-8 mr-2">
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Delivery Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Delivery</CardTitle>
                <CardDescription>
                  Enter the details to schedule a new delivery
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {reschedulingLink && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                      <p className="font-medium">Delivery created successfully!</p>
                      <p className="mt-1">Rescheduling link: <a href={reschedulingLink} target="_blank" className="underline">{reschedulingLink}</a></p>
                      <p className="text-xs mt-2">Send this link to the recipient so they can reschedule if needed.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recipient Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <User className="w-5 h-5 mr-2 text-red-600" />
                          Recipient Details
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Recipient Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter recipient name"
                          {...register("name", { required: "Recipient name is required" })}
                        />
                        {errors.name && (
                          <span className="text-sm text-red-500">{errors.name.message}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          {...register("phone", { required: "Phone number is required" })}
                        />
                        {errors.phone && (
                          <span className="text-sm text-red-500">{errors.phone.message}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          {...register("email", {
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {errors.email && (
                          <span className="text-sm text-red-500">{errors.email.message}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Input
                          id="address"
                          placeholder="Enter delivery address"
                          {...register("address", { required: "Address is required" })}
                        />
                        {errors.address && (
                          <span className="text-sm text-red-500">{errors.address.message}</span>
                        )}
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <Package className="w-5 h-5 mr-2 text-red-600" />
                          Delivery Details
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="product">Product Details</Label>
                        <Input
                          id="product"
                          placeholder="Enter product description"
                          {...register("product", { required: "Product details are required" })}
                        />
                        {errors.product && (
                          <span className="text-sm text-red-500">{errors.product.message}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryDate">Delivery Date</Label>
                        <Input
                          id="deliveryDate"
                          type="date"
                          {...register("deliveryDate", { required: "Delivery date is required" })}
                        />
                        {errors.deliveryDate && (
                          <span className="text-sm text-red-500">{errors.deliveryDate.message}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryTime">Delivery Time</Label>
                        <select
                          id="deliveryTime"
                          className="w-full p-2 border rounded-md"
                          {...register("deliveryTime", { required: "Delivery time is required" })}
                        >
                          <option value="">Select a time slot</option>
                          <option value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                          <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
                          <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                          <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                          <option value="6:00 PM - 8:00 PM">6:00 PM - 8:00 PM</option>
                        </select>
                        {errors.deliveryTime && (
                          <span className="text-sm text-red-500">{errors.deliveryTime.message}</span>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 mt-4">
                        <p className="font-medium flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          Tracking ID Generation
                        </p>
                        <p className="mt-2">
                          A unique tracking ID will be automatically generated for this delivery.
                          The recipient will receive a link where they can view and reschedule their delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      reset();
                      setError(null);
                      setReschedulingLink(null);
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Creating Delivery...</>
                    ) : (
                      <>
                        <Truck className="mr-2 h-4 w-4" />
                        Schedule Delivery
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
