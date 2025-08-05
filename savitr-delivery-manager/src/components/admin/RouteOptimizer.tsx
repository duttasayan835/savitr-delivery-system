"use client";

import { useState, useEffect, useMemo, memo, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, TruckIcon, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { getOptimizedRoute, DeliveryPoint, RouteSourcePoint, OptimizedRoute } from "@/app/admin/dashboard/aiClient";
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Create a client-only map component with no SSR
const MapViewClient = dynamic(() => import('./MapViewClient'), { ssr: false });

// Define a delivery type that matches what's being used
interface Delivery {
  trackingId: string;
  name: string;
  latitude: string | number | null;
  longitude: string | number | null;
  address: string;
  product?: string;
  deliveryTime?: string;
  deliveryDate: string;
  status?: string;
  recipientName?: string;
  productInfo?: string;
  _id?: string;
}

interface RouteOptimizerProps {
  deliveries: Delivery[];
}

export default function RouteOptimizer({ deliveries }: RouteOptimizerProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [deliveriesWithCoords, setDeliveriesWithCoords] = useState<DeliveryPoint[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Define depot point for reuse
  const depot: RouteSourcePoint = {
    lat: 19.0760, // Mumbai coordinates as an example
    lng: 72.8777,
    name: "Delivery Hub",
    address: "Mumbai Central Office"
  };
  
  // Debugging: Log deliveries on mount
  useEffect(() => {
    console.log(`RouteOptimizer: Received ${deliveries.length} deliveries`);
    
    // Check for deliveries with coordinates
    const withCoords = deliveries.filter(d => {
      const hasLat = d.latitude != null && !isNaN(Number(d.latitude));
      const hasLng = d.longitude != null && !isNaN(Number(d.longitude));
      return hasLat && hasLng;
    });
    
    console.log(`RouteOptimizer: ${withCoords.length} deliveries have valid coordinates`);
  }, [deliveries]);
  
  // Update filtered deliveries when date changes
  useEffect(() => {
    const filtered = getDeliveriesForDate();
    setDeliveriesWithCoords(filtered);
    console.log(`RouteOptimizer: ${filtered.length} deliveries for date ${format(date, "yyyy-MM-dd")}`);
  }, [date, deliveries]);
  
  // Filter deliveries for the chosen date and get only those with coordinates
  const getDeliveriesForDate = () => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    return deliveries
      .filter(d => {
        const deliveryDate = new Date(d.deliveryDate);
        // Check that coordinates exist and are valid numbers
        const hasValidLat = d.latitude != null && !isNaN(Number(d.latitude));
        const hasValidLng = d.longitude != null && !isNaN(Number(d.longitude));
        return format(deliveryDate, "yyyy-MM-dd") === dateStr && 
          hasValidLat && hasValidLng;
      })
      .map(d => {
        // Format coordinates to 13 decimal places precision
        const lat = Number(parseFloat(String(d.latitude)).toFixed(13));
        const lng = Number(parseFloat(String(d.longitude)).toFixed(13));
        
        console.log(`Delivery ${d.trackingId} coordinates:`, { lat, lng });
        
        return {
          trackingId: d.trackingId,
          name: d.name,
          lat: lat,
          lng: lng,
          address: d.address,
          product: d.product,
          deliveryTime: d.deliveryTime
        };
      });
  };
  
  const handleOptimizeRoute = async () => {
    console.log("Optimize Route button clicked");
    try {
      setIsOptimizing(true);
      
      // Get deliveries for the selected date that have coordinates
      const deliveriesForDate = getDeliveriesForDate();
      console.log(`Found ${deliveriesForDate.length} deliveries with coordinates for date ${format(date, "yyyy-MM-dd")}`);
      
      if (deliveriesForDate.length === 0) {
        toast.error("No deliveries found", { 
          description: "There are no deliveries with coordinates for the selected date"
        });
        setIsOptimizing(false);
        return;
      }
      
      console.log("Calling getOptimizedRoute with:", {
        deliveriesCount: deliveriesForDate.length,
        depotCoordinates: depot
      });
      
      // Call the optimization service
      try {
        const route = await getOptimizedRoute(deliveriesForDate, depot);
        
        if (route) {
          setOptimizedRoute(route);
          toast.success("Route optimized", {
            description: `Total distance: ${route.total_distance.toFixed(2)} km`
          });
        }
      } catch (error) {
        console.error("Optimization failed:", error);
        toast.error("Failed to optimize route", {
          description: "An error occurred during route optimization"
        });
      }
    } catch (err) {
      console.error("Error in handleOptimizeRoute:", err);
      toast.error("Failed to optimize route");
    } finally {
      setIsOptimizing(false);
      setShowMap(true);
      setViewMode('map');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5" />
          Route Optimization
        </CardTitle>
        <CardDescription>
          Plan optimal delivery routes based on delivery locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div>
              <p className="text-sm mb-2">Choose delivery date:</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="mt-4 sm:mt-auto">
              <Button 
                onClick={handleOptimizeRoute} 
                disabled={isOptimizing || deliveriesWithCoords.length === 0}
              >
                <TruckIcon className="h-4 w-4 mr-2" />
                {isOptimizing ? "Optimizing..." : "Optimize Route"}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {deliveriesWithCoords.length} deliveries with coordinates for selected date.
          </p>
        </div>
        
        {optimizedRoute && (
          <div className="mt-4">
            <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')}>
              <TabsList className="mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <div className="border rounded-md">
                  <div className="p-4 border-b bg-muted/40">
                    <h3 className="font-medium">Optimized Route</h3>
                    <p className="text-sm text-muted-foreground">
                      Total distance: {optimizedRoute.total_distance.toFixed(2)} km
                    </p>
                  </div>
                  <ul className="divide-y">
                    <li className="p-3 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                        S
                      </div>
                      <div>
                        <p className="font-medium">{depot.name}</p>
                        <p className="text-sm text-muted-foreground">{depot.address}</p>
                      </div>
                    </li>
                    
                    {optimizedRoute.ordered_deliveries.map((delivery, index) => (
                      <li key={delivery.trackingId} className="p-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{delivery.name}</p>
                          <p className="text-sm text-muted-foreground">{delivery.address}</p>
                          {delivery.product && (
                            <p className="text-xs text-muted-foreground">
                              Product: {delivery.product}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                    
                    <li className="p-3 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                        E
                      </div>
                      <div>
                        <p className="font-medium">{depot.name}</p>
                        <p className="text-sm text-muted-foreground">{depot.address}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="map">
                {typeof window !== 'undefined' && (
                  <MapViewClient 
                    depot={depot} 
                    deliveries={optimizedRoute.ordered_deliveries} 
                    mapId={`route-map-${date.toISOString()}`} 
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 