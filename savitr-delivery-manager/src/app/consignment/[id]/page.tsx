'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TrackingCard from '@/components/TrackingCard';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, Plus, ArrowLeft, RefreshCw, Truck, MapPin, Phone, User, Calendar } from 'lucide-react';

interface TrackingUpdate {
  consignment_id: string;
  status: string;
  location: string;
  created_at: string;
}

interface Consignment {
  consignment_id: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  parcel_type: string;
  date_of_booking: string;
  delivery_status: string;
}

export default function ConsignmentDetails() {
  const params = useParams();
  const router = useRouter();
  const [consignment, setConsignment] = useState<Consignment | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/consignment/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch consignment details');
      }
      const data = await response.json();
      setConsignment(data.consignment);
      setTrackingUpdates(data.tracking_updates);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignmentDetails();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-center">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!consignment) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <h2 className="text-2xl font-bold mb-2">Consignment Not Found</h2>
            <p>The requested consignment could not be found.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/consignment/booking')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Consignment
              </button>
              <button
                onClick={fetchConsignmentDetails}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Consignment Details
                  </h1>
                  <div className="flex items-center text-gray-500">
                    <Package className="h-5 w-5 mr-2" />
                    <span>ID: {consignment.consignment_id}</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                  {consignment.delivery_status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl shadow-sm border border-red-100">
                  <div className="flex items-center mb-4">
                    <User className="h-6 w-6 text-red-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Sender Details</h2>
                  </div>
                  <div className="space-y-3">
                    <p className="flex items-center text-gray-700">
                      <span className="font-medium w-24">Name:</span>
                      <span>{consignment.sender_name}</span>
                    </p>
                    <p className="flex items-center text-gray-700">
                      <Phone className="h-4 w-4 text-red-600 mr-2" />
                      <span>{consignment.sender_phone}</span>
                    </p>
                    <p className="flex items-start text-gray-700">
                      <MapPin className="h-4 w-4 text-red-600 mr-2 mt-1" />
                      <span>{consignment.sender_address}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl shadow-sm border border-red-100">
                  <div className="flex items-center mb-4">
                    <User className="h-6 w-6 text-red-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Receiver Details</h2>
                  </div>
                  <div className="space-y-3">
                    <p className="flex items-center text-gray-700">
                      <span className="font-medium w-24">Name:</span>
                      <span>{consignment.receiver_name}</span>
                    </p>
                    <p className="flex items-center text-gray-700">
                      <Phone className="h-4 w-4 text-red-600 mr-2" />
                      <span>{consignment.receiver_phone}</span>
                    </p>
                    <p className="flex items-start text-gray-700">
                      <MapPin className="h-4 w-4 text-red-600 mr-2 mt-1" />
                      <span>{consignment.receiver_address}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8 bg-gradient-to-br from-red-50 to-white p-6 rounded-xl shadow-sm border border-red-100">
                <div className="flex items-center mb-4">
                  <Truck className="h-6 w-6 text-red-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">Parcel Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="font-medium text-gray-800">{consignment.parcel_type}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                    <p className="font-medium text-gray-800">{formatDate(consignment.date_of_booking)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="font-medium text-red-600">{consignment.delivery_status}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-6">
                  <Calendar className="h-6 w-6 text-red-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">Tracking Updates</h2>
                </div>
                <div className="space-y-4">
                  {trackingUpdates.map((update, index) => (
                    <TrackingCard
                      key={`${update.consignment_id}-${update.created_at}-${index}`}
                      consignmentId={update.consignment_id}
                      status={update.status}
                      location={update.location}
                      timestamp={formatDate(update.created_at)}
                      isLatest={index === 0}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 