'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DeliveryStatus } from '@/models/Delivery';

interface Delivery {
  id: string;
  trackingId: string;
  senderName: string;
  currentSlot: {
    date: string;
    time: string;
  };
  status: string;
  rescheduleHistory?: Array<{
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    timestamp: string;
    reason?: string;
  }>;
  source?: string;
}

export default function DeliveryHistory() {
  const { user, isAuthenticated } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/recipient/login');
      return;
    }

    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/recipient/deliveries', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch deliveries');
        }

        const data = await response.json();
        setDeliveries(Array.isArray(data.deliveries) ? data.deliveries : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [isAuthenticated, router]);

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      [DeliveryStatus.SCHEDULED]: 'bg-blue-500',
      [DeliveryStatus.RESCHEDULED]: 'bg-yellow-500',
      [DeliveryStatus.DELIVERED]: 'bg-green-500',
      [DeliveryStatus.FAILED]: 'bg-red-500',
      cancelled: 'bg-gray-500',
      CANCELLED: 'bg-gray-500',
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center py-8">No deliveries found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={`${delivery.source || ''}-${delivery.id}`}>
                    <TableCell>{delivery.trackingId}</TableCell>
                    <TableCell>{delivery.senderName}</TableCell>
                    <TableCell>
                      {format(new Date(delivery.currentSlot.date), 'MMM d, yyyy')} at {delivery.currentSlot.time}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(delivery.status)}
                      {delivery.rescheduleHistory && delivery.rescheduleHistory.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          <div>Rescheduled {delivery.rescheduleHistory.length} time(s)</div>
                          <div>Latest: {format(new Date(delivery.currentSlot.date), 'MMM d, yyyy')} at {delivery.currentSlot.time}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/recipient/reschedule/${delivery.trackingId}`)}
                        disabled={!delivery.status.includes('SCHEDULED')}
                      >
                        Reschedule
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 