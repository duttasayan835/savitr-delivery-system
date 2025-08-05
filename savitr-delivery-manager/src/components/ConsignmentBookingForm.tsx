'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Package, User, MapPin, Phone, Mail, Truck, ArrowRight, Home, ClipboardList, Settings, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ConsignmentBookingForm() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    sender_name: '',
    sender_phone: '',
    sender_address: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    parcel_type: 'Speed Post'
  });

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.sender_name.trim()) {
        newErrors.sender_name = 'Sender name is required';
      }
      if (!formData.sender_phone.trim()) {
        newErrors.sender_phone = 'Sender phone is required';
      } else if (!/^\+?[\d\s-]{10,}$/.test(formData.sender_phone)) {
        newErrors.sender_phone = 'Invalid phone number format';
      }
      if (!formData.sender_address.trim()) {
        newErrors.sender_address = 'Sender address is required';
      }
    } else if (step === 2) {
      if (!formData.receiver_name.trim()) {
        newErrors.receiver_name = 'Receiver name is required';
      }
      if (!formData.receiver_phone.trim()) {
        newErrors.receiver_phone = 'Receiver phone is required';
      } else if (!/^\+?[\d\s-]{10,}$/.test(formData.receiver_phone)) {
        newErrors.receiver_phone = 'Invalid phone number format';
      }
      if (!formData.receiver_address.trim()) {
        newErrors.receiver_address = 'Receiver address is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isAdmin) {
      toast.error('Only admins can book consignments');
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/consignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create consignment');
      }

      toast.success('Consignment booked successfully!');
      router.push(`/consignment/${data.consignment.consignment_id}`);
    } catch (error: any) {
      toast.error(error.message || 'Error booking consignment');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <Package className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only administrators can access this form.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-gray-900">Savitr Delivery</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                <Home className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link href="/admin" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                <ClipboardList className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <Link href="/settings" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a New Consignment</h1>
            <p className="text-gray-600">Fill in the details below to create a new consignment. We'll handle the rest!</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-100"
          >
            {/* Progress Bar */}
            <div className="bg-gray-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <motion.div
                      key={step}
                      className={`relative flex items-center ${
                        currentStep >= step ? 'text-red-600' : 'text-gray-400'
                      }`}
                      initial={false}
                      animate={{
                        scale: currentStep === step ? 1.1 : 1,
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`w-16 h-1 ${
                          currentStep > step ? 'bg-red-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Step {currentStep} of 4
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <User className="h-6 w-6 text-red-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Sender Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="sender_name"
                              value={formData.sender_name}
                              onChange={handleChange}
                              required
                              className={`w-full px-4 py-2 border ${
                                errors.sender_name ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                              placeholder="Enter sender's name"
                            />
                            {errors.sender_name && (
                              <p className="mt-1 text-sm text-red-600">{errors.sender_name}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              name="sender_phone"
                              value={formData.sender_phone}
                              onChange={handleChange}
                              required
                              className={`w-full pl-10 pr-4 py-2 border ${
                                errors.sender_phone ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                              placeholder="Enter phone number"
                            />
                            {errors.sender_phone && (
                              <p className="mt-1 text-sm text-red-600">{errors.sender_phone}</p>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <textarea
                              name="sender_address"
                              value={formData.sender_address}
                              onChange={handleChange}
                              required
                              rows={3}
                              className={`w-full pl-10 pr-4 py-2 border ${
                                errors.sender_address ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                              placeholder="Enter complete address"
                            />
                            {errors.sender_address && (
                              <p className="mt-1 text-sm text-red-600">{errors.sender_address}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <User className="h-6 w-6 text-red-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Receiver Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="receiver_name"
                              value={formData.receiver_name}
                              onChange={handleChange}
                              required
                              className={`w-full px-4 py-2 border ${
                                errors.receiver_name ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                              placeholder="Enter receiver's name"
                            />
                            {errors.receiver_name && (
                              <p className="mt-1 text-sm text-red-600">{errors.receiver_name}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              name="receiver_phone"
                              value={formData.receiver_phone}
                              onChange={handleChange}
                              required
                              className={`w-full pl-10 pr-4 py-2 border ${
                                errors.receiver_phone ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                              placeholder="Enter phone number"
                            />
                            {errors.receiver_phone && (
                              <p className="mt-1 text-sm text-red-600">{errors.receiver_phone}</p>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <textarea
                              name="receiver_address"
                              value={formData.receiver_address}
                              onChange={handleChange}
                              required
                              rows={3}
                              className={`w-full pl-10 pr-4 py-2 border ${
                                errors.receiver_address ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                              placeholder="Enter complete address"
                            />
                            {errors.receiver_address && (
                              <p className="mt-1 text-sm text-red-600">{errors.receiver_address}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <Package className="h-6 w-6 text-red-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Parcel Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Parcel Type</label>
                          <select
                            name="parcel_type"
                            value={formData.parcel_type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          >
                            <option value="Speed Post">Speed Post</option>
                            <option value="Regular">Regular</option>
                            <option value="Express">Express</option>
                            <option value="Premium">Premium</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                          <select
                            name="delivery_time"
                            value={formData.delivery_time || ""}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          >
                            <option value="">Select a time slot</option>
                            <option value="10:00 AM - 12 NOON">10:00 AM - 12 NOON</option>
                            <option value="12 NOON - 3:00 PM">12 NOON - 3:00 PM</option>
                            <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <ClipboardList className="h-6 w-6 text-red-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Review Details</h3>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Sender Information</h4>
                            <p className="text-gray-600">{formData.sender_name}</p>
                            <p className="text-gray-600">{formData.sender_phone}</p>
                            <p className="text-gray-600">{formData.sender_address}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Receiver Information</h4>
                            <p className="text-gray-600">{formData.receiver_name}</p>
                            <p className="text-gray-600">{formData.receiver_phone}</p>
                            <p className="text-gray-600">{formData.receiver_address}</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Parcel Type</h4>
                          <p className="text-gray-600">{formData.parcel_type}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Submit'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 