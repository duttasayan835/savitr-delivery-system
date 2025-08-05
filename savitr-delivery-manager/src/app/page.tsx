import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, MapPin, Package, Settings, Shield, TruckIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-700 to-red-600 text-white">
          <div className="container py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Take control of your deliveries with Savitr-AI Delivery Manager
                </h1>
                <p className="text-lg opacity-90">
                  Powered by AI, our delivery management system gives you more control, visibility, and convenience for your Savitr-AI shipments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                    Sign up for free
                  </Button>
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-red-800">
                    Learn more
                  </Button>
                  <Link href="/auth/admin/login">
                    <Button size="lg" className="bg-red-600 text-white hover:bg-red-700 border-red-700">
                      Admin Login
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative h-80">
        {/* Replace with your actual image */}
        <Image
          src="https://files.catbox.moe/ja0z2x.jpg" // Update this path to your image
          alt="AI Delivery Management"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How Savitr-AI Delivery Manager helps you</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-red-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Package className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle>Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Access real-time package tracking information for all your Savitr-AI deliveries in one place.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Advanced AI-powered security features keep your deliveries and personal information safe.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle>Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Customize delivery preferences, redirect packages, and provide special instructions to drivers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What You Can Do Section */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12">What you can do with Savitr-AI Delivery Manager</h2>

            <Tabs defaultValue="track" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
                <TabsTrigger value="track">Track</TabsTrigger>
                <TabsTrigger value="notify">Notifications</TabsTrigger>
                <TabsTrigger value="reschedule">Reschedule</TabsTrigger>
                <TabsTrigger value="instruct">Instructions</TabsTrigger>
              </TabsList>

              <TabsContent value="track" className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Stay informed with delivery notifications</h3>
                    <p className="text-gray-600 mb-4">
                      Get real-time updates about your deliveries straight to your phone or email. Know exactly when your package arrives, even when you're not home.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Real-time tracking updates</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Predictive AI delivery time estimates</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Package journey visualization</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="w-full h-64 relative bg-gray-100 rounded overflow-hidden">
                      <TruckIcon className="w-24 h-24 text-red-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notify" className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Get timely delivery notifications</h3>
                    <p className="text-gray-600 mb-4">
                      Choose how and when you receive notifications about your packages. Get alerts for out-for-delivery, delivered, and more.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Customizable notification preferences</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>SMS, email, or push notifications</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Delivery window alerts</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="w-full h-64 relative bg-gray-100 rounded overflow-hidden">
                      <Clock className="w-24 h-24 text-red-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reschedule" className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Reschedule deliveries at your convenience</h3>
                    <p className="text-gray-600 mb-4">
                      Can't be home for your delivery? Easily reschedule for a time that works for you, or redirect to a secure location.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Date and time selection</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Delivery hold options</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Alternative delivery locations</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="w-full h-64 relative bg-gray-100 rounded overflow-hidden">
                      <MapPin className="w-24 h-24 text-red-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instruct" className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Provide delivery instructions</h3>
                    <p className="text-gray-600 mb-4">
                      Let our drivers know exactly how you want your package delivered with specific instructions.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Secure drop-off locations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Special handling instructions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Gate codes and entry information</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="w-full h-64 relative bg-gray-100 rounded overflow-hidden">
                      <Settings className="w-24 h-24 text-red-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-red-600 text-white py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Start managing your deliveries today</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of customers who are taking control of their deliveries with Savitr-AI Delivery Manager.
            </p>
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
