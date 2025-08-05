"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, Package, TruckIcon } from "lucide-react";

const MapTracking = dynamic(() => import("@/components/MapTracking"), { ssr: false });

export default function TrackingMapCard({
  delivery = {
    id: "SAV10029384756",
    origin: "New York, NY",
    destination: "Boston, MA",
    status: "In Transit",
    estimatedDelivery: "Apr 20, 2025",
    route: [
      [40.7128, -74.006], // NYC
      [42.3601, -71.0589], // Boston
    ]
  }
}) {
  return (
    <Card className="mb-4 w-full">
      <CardHeader>
        <CardTitle>Active Delivery</CardTitle>
        <CardDescription>Your latest package in transit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 font-medium text-sm">
          <span className="text-gray-600">Tracking:</span> {delivery.id}
        </div>
        <div className="mb-3">
          <div className="flex items-center text-xs text-gray-500 gap-2">
            <TruckIcon className="w-4 h-4 text-red-600" />
            {delivery.origin} <span className="mx-1 text-gray-400">→</span> {delivery.destination}
          </div>
          <div className="text-xs text-gray-600 mt-1">Estimated Delivery: {delivery.estimatedDelivery}</div>
        </div>
        {/* Compact Map */}
        <div className="w-full h-40 rounded mb-3">
          <MapTracking
            showPolyline={true}
            showSearch={false}
            adminMode={false}
            route={delivery.route}
            initialMarkers={[
              { position: delivery.route[0], info: "Origin" },
              { position: delivery.route[1], info: "Destination" },
            ]}
          />
        </div>
        {/* Timeline */}
        <div className="flex items-center justify-between text-xs mt-2">
          <div className="flex flex-col items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mb-1" />
            <span>Shipped</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className={`w-4 h-4 ${delivery.status !== "Delivered" ? "text-blue-600" : "text-green-600"} mb-1`} />
            <span>{delivery.status === "Delivered" ? "Delivered" : "In Transit"}</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <Clock className="w-4 h-4 mb-1" />
            <span>Out for Delivery</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <Package className="w-4 h-4 mb-1" />
            <span>Delivered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
