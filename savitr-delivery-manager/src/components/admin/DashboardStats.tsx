"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Clock, RefreshCw, Timer, CheckCircle } from "lucide-react";
import { DeliveryStatus } from "@/models/Delivery";

interface DeliveryStats {
  total: number;
  upcoming: number;
  rescheduled: number;
  pending: number;
  delivered: number;
}

export default function DashboardStats() {
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    total: 0,
    upcoming: 0,
    rescheduled: 0,
    pending: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/delivery");
        const data = await res.json();
        const deliveries = data.deliveries || [];
        const now = new Date();
        const stats: DeliveryStats = {
          total: deliveries.length,
          upcoming: deliveries.filter((d: any) => {
            const date = new Date(d.deliveryDate);
            return date > now && d.status !== "delivered" && d.status !== "cancelled";
          }).length,
          rescheduled: deliveries.filter((d: any) => d.status === "rescheduled").length,
          pending: deliveries.filter((d: any) => d.status === "pending").length,
          delivered: deliveries.filter((d: any) => d.status === "delivered").length,
        };
        setDeliveryStats(stats);
      } catch (err) {
        setDeliveryStats({ total: 0, upcoming: 0, rescheduled: 0, pending: 0, delivered: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Total Deliveries */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{loading ? "-" : deliveryStats.total}</div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deliveries */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{loading ? "-" : deliveryStats.upcoming}</div>
            <div className="p-2 bg-orange-100 rounded-full">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rescheduled Deliveries */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Rescheduled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{loading ? "-" : deliveryStats.rescheduled}</div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <RefreshCw className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Deliveries */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{loading ? "-" : deliveryStats.pending}</div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Timer className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivered Parcels */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{loading ? "-" : deliveryStats.delivered}</div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 