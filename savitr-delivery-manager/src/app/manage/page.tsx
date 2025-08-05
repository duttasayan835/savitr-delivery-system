'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Bell, Home, MapPin, Calendar, Clock, UserCheck,
  Settings, Lock, Edit, Package, Plus
} from "lucide-react";
import { useState } from "react";

export default function ManageDeliveriesPage() {
  // Form states
  const [signature, setSignature] = useState<string>('not-required');
  const [dropOffLocation, setDropOffLocation] = useState<string>('Front Door');
  const [instructions, setInstructions] = useState<string>('');
  const [vacationHoldEnabled, setVacationHoldEnabled] = useState(false);
  const [holdAtLocationEnabled, setHoldAtLocationEnabled] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notificationMethods, setNotificationMethods] = useState({
    email: true,
    sms: true,
    push: false
  });
  const [notificationEvents, setNotificationEvents] = useState({
    shipped: true,
    outForDelivery: true,
    delivered: true,
    delayed: true,
    exception: false,
    scheduled: false
  });
  const [advancedOptions, setAdvancedOptions] = useState({
    timeWindows: false,
    deliveryPhoto: true,
    earlyDelivery: false
  });
  const [selectedDays, setSelectedDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false
  });
  const [releaseAuth, setReleaseAuth] = useState(false);

  // Mock data for delivery addresses
  const deliveryAddresses = [
    {
      id: "addr-1",
      name: "Home",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "Office",
      address: "456 Business Ave, Suite 200",
      city: "New York",
      state: "NY",
      zip: "10018",
      isDefault: false,
    },
    {
      id: "addr-3",
      name: "Parent's House",
      address: "789 Family Road",
      city: "Brooklyn",
      state: "NY",
      zip: "11201",
      isDefault: false,
    },
  ];

  // Mock data for delivery preferences
  const deliveryPreferences = {
    signature: "Not Required",
    dropOffLocation: "Front Door",
    deliveryInstructions: "Please leave package under the awning if raining",
    holdAtLocationEnabled: false,
    vacationHold: {
      active: false,
      startDate: "",
      endDate: "",
    },
  };

  // Generate time options from 8:00 AM to 7:00 PM
  const timeOptions = Array.from({ length: 12 }).map((_, i) => ({
    id: `time-${i + 8}`,
    value: `${i + 8}:00`,
    label: `${i + 8}:00 ${i + 8 < 12 ? "AM" : "PM"}`
  }));

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
  };

  const handleVacationHoldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVacationHoldEnabled(e.target.checked);
  };

  const handleHoldAtLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoldAtLocationEnabled(e.target.checked);
  };

  const handleNotificationMethodChange = (method: keyof typeof notificationMethods) => {
    setNotificationMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const handleNotificationEventChange = (event: keyof typeof notificationEvents) => {
    setNotificationEvents(prev => ({
      ...prev,
      [event]: !prev[event]
    }));
  };

  const handleAdvancedOptionChange = (option: keyof typeof advancedOptions) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleDayChange = (day: keyof typeof selectedDays) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Manage Your Deliveries</h1>

          <Tabs defaultValue="addresses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 gap-2">
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Delivery Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Delivery Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="authorization" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Authorization</span>
              </TabsTrigger>
            </TabsList>

            {/* Delivery Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Delivery Addresses</h2>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveryAddresses.map((address) => (
                  <Card key={address.id} className={address.isDefault ? "border-red-200" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Home className="w-5 h-5 text-red-600" />
                          <CardTitle className="text-lg">{address.name}</CardTitle>
                        </div>
                        {address.isDefault && (
                          <div className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                            Default
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1 mb-4">
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {!address.isDefault && (
                          <Button variant="outline" size="sm" className="text-xs">
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Delivery Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <h2 className="text-xl font-semibold">Delivery Preferences</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <UserCheck className="w-5 h-5 text-red-600" />
                        Signature Options
                      </CardTitle>
                      <CardDescription>
                        Set your signature preferences for package delivery
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="sig-not-required"
                          name="signature"
                          value="not-required"
                          checked={signature === 'not-required'}
                          onChange={handleSignatureChange}
                        />
                        <label htmlFor="sig-not-required">Not Required</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="sig-indirect"
                          name="signature"
                          value="indirect"
                          checked={signature === 'indirect'}
                          onChange={handleSignatureChange}
                        />
                        <label htmlFor="sig-indirect">Indirect</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="sig-direct"
                          name="signature"
                          value="direct"
                          checked={signature === 'direct'}
                          onChange={handleSignatureChange}
                        />
                        <label htmlFor="sig-direct">Direct</label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="w-5 h-5 text-red-600" />
                        Delivery Instructions
                      </CardTitle>
                      <CardDescription>
                        Provide special instructions for your deliveries
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label htmlFor="drop-location" className="block text-sm font-medium mb-1">
                          Preferred Drop-off Location
                        </label>
                        <select
                          id="drop-location"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          defaultValue={deliveryPreferences.dropOffLocation}
                        >
                          <option value="Front Door">Front Door</option>
                          <option value="Back Door">Back Door</option>
                          <option value="Side Door">Side Door</option>
                          <option value="Garage">Garage</option>
                          <option value="Mailroom">Mailroom</option>
                          <option value="Office">Office</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="special-instructions" className="block text-sm font-medium mb-1">
                          Special Instructions
                        </label>
                        <textarea
                          id="special-instructions"
                          className="w-full p-2 border border-gray-300 rounded-md h-24"
                          defaultValue={deliveryPreferences.deliveryInstructions}
                          placeholder="Add any special delivery instructions here..."
                        />
                      </div>

                      <Button className="bg-red-600 hover:bg-red-700 w-full">
                        Save Preferences
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5 text-red-600" />
                        Vacation Hold
                      </CardTitle>
                      <CardDescription>
                        Temporarily hold your deliveries while you're away
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            id="vacation-hold"
                            checked={vacationHoldEnabled}
                            onChange={handleVacationHoldChange}
                            className="text-red-600"
                          />
                          <label htmlFor="vacation-hold" className="font-medium">
                            Enable Vacation Hold
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="start-date" className="block text-sm mb-1">
                              Start Date
                            </label>
                            <Input
                              type="date"
                              id="start-date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              disabled={!vacationHoldEnabled}
                            />
                          </div>
                          <div>
                            <label htmlFor="end-date" className="block text-sm mb-1">
                              End Date
                            </label>
                            <Input
                              type="date"
                              id="end-date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              disabled={!vacationHoldEnabled}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            id="hold-location"
                            checked={holdAtLocationEnabled}
                            onChange={handleHoldAtLocationChange}
                            className="text-red-600"
                          />
                          <label htmlFor="hold-location" className="font-medium">
                            Hold at Location
                          </label>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                          Have your packages held at a nearby Savitr-AI location for pickup.
                        </p>

                        <Button variant="outline" className="w-full" disabled={!holdAtLocationEnabled}>
                          Find a Location
                        </Button>
                      </div>

                      <Button className="bg-red-600 hover:bg-red-700 w-full">
                        Save Hold Settings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-red-600" />
                        Delivery Timing
                      </CardTitle>
                      <CardDescription>
                        Set your preferred delivery time windows
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <p className="text-sm text-gray-500">
                          Specify the times when you're usually available to receive packages.
                          We'll try to deliver during these windows when possible.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                            <div key={day} className="flex items-center gap-2">
                              <input type="checkbox" id={`day-${day}`} className="text-red-600" />
                              <label htmlFor={`day-${day}`}>{day}</label>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label htmlFor="time-from" className="block text-sm mb-1">
                              From
                            </label>
                            <select id="time-from" className="w-full p-2 border border-gray-300 rounded-md">
                              {timeOptions.map((option) => (
                                <option key={option.id} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="time-to" className="block text-sm mb-1">
                              To
                            </label>
                            <select id="time-to" className="w-full p-2 border border-gray-300 rounded-md">
                              {timeOptions.map((option) => (
                                <option key={option.id} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <Button className="bg-red-600 hover:bg-red-700 w-full">
                        Save Timing Preferences
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Alerts</CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified about your deliveries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Methods</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="email-notify"
                              checked={notificationMethods.email}
                              onChange={() => handleNotificationMethodChange('email')}
                              className="text-red-600"
                            />
                            <label htmlFor="email-notify">Email Notifications</label>
                          </div>
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            className="w-60"
                            defaultValue="jane.doe@example.com"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="sms-notify"
                              checked={notificationMethods.sms}
                              onChange={() => handleNotificationMethodChange('sms')}
                              className="text-red-600"
                            />
                            <label htmlFor="sms-notify">SMS Notifications</label>
                          </div>
                          <Input
                            type="tel"
                            placeholder="(123) 456-7890"
                            className="w-60"
                            defaultValue="(212) 555-1234"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="push-notify"
                              checked={notificationMethods.push}
                              onChange={() => handleNotificationMethodChange('push')}
                              className="text-red-600"
                            />
                            <label htmlFor="push-notify">Push Notifications</label>
                          </div>
                          <div className="text-sm text-gray-500 w-60">
                            Enable in the Savitr-AI mobile app
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Events</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="ship-notify"
                            checked={notificationEvents.shipped}
                            onChange={() => handleNotificationEventChange('shipped')}
                            className="text-red-600"
                          />
                          <label htmlFor="ship-notify">When package ships</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="out-notify"
                            checked={notificationEvents.outForDelivery}
                            onChange={() => handleNotificationEventChange('outForDelivery')}
                            className="text-red-600"
                          />
                          <label htmlFor="out-notify">When out for delivery</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="delivered-notify"
                            checked={notificationEvents.delivered}
                            onChange={() => handleNotificationEventChange('delivered')}
                            className="text-red-600"
                          />
                          <label htmlFor="delivered-notify">When delivered</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="delay-notify"
                            checked={notificationEvents.delayed}
                            onChange={() => handleNotificationEventChange('delayed')}
                            className="text-red-600"
                          />
                          <label htmlFor="delay-notify">When delivery is delayed</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="exception-notify"
                            checked={notificationEvents.exception}
                            onChange={() => handleNotificationEventChange('exception')}
                            className="text-red-600"
                          />
                          <label htmlFor="exception-notify">Delivery exceptions</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="scheduled-notify"
                            checked={notificationEvents.scheduled}
                            onChange={() => handleNotificationEventChange('scheduled')}
                            className="text-red-600"
                          />
                          <label htmlFor="scheduled-notify">Scheduled delivery updates</label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Advanced Options</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="time-windows"
                            checked={advancedOptions.timeWindows}
                            onChange={() => handleAdvancedOptionChange('timeWindows')}
                            className="text-red-600"
                          />
                          <label htmlFor="time-windows">Send estimated delivery time window</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="picture-notify"
                            checked={advancedOptions.deliveryPhoto}
                            onChange={() => handleAdvancedOptionChange('deliveryPhoto')}
                            className="text-red-600"
                          />
                          <label htmlFor="picture-notify">Include delivery photo in notifications</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="early-notify"
                            checked={advancedOptions.earlyDelivery}
                            onChange={() => handleAdvancedOptionChange('earlyDelivery')}
                            className="text-red-600"
                          />
                          <label htmlFor="early-notify">Send notifications for early deliveries</label>
                        </div>
                      </div>
                    </div>

                    <Button className="bg-red-600 hover:bg-red-700">
                      Save Notification Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authorization Tab */}
            <TabsContent value="authorization" className="space-y-6">
              <h2 className="text-xl font-semibold">Delivery Authorization</h2>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Authorized Recipients</CardTitle>
                  <CardDescription>
                    Add people who are authorized to receive packages on your behalf
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">John Smith</h4>
                          <p className="text-sm text-gray-500">Relation: Family Member</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-red-600">Remove</Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Building Management</h4>
                          <p className="text-sm text-gray-500">Relation: Property Manager</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-red-600">Remove</Button>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Authorized Recipient
                    </Button>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Release Authorization</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        By enabling this option, you authorize Savitr-AI to release packages without a signature at the delivery address.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="release-auth"
                          checked={releaseAuth}
                          onChange={(e) => setReleaseAuth(e.target.checked)}
                          className="text-red-600"
                        />
                        <label htmlFor="release-auth">
                          I authorize the release of my packages without a signature
                        </label>
                      </div>
                    </div>

                    <Button className="bg-red-600 hover:bg-red-700">
                      Save Authorization Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
