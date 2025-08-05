"use client"

import React, { useState } from "react"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Example data
const deliveryLocations: ComboboxOption[] = [
  { value: "front-door", label: "Front Door" },
  { value: "back-door", label: "Back Door" },
  { value: "side-door", label: "Side Door" },
  { value: "garage", label: "Garage" },
  { value: "mailroom", label: "Mailroom" },
  { value: "security-desk", label: "Security Desk" },
  { value: "reception", label: "Reception" },
  { value: "neighbor", label: "Neighbor's House" },
  { value: "porch", label: "Porch" },
  { value: "shed", label: "Shed" }
]

const timeSlots: ComboboxOption[] = [
  { value: "8am-10am", label: "8:00 AM - 10:00 AM" },
  { value: "10am-12pm", label: "10:00 AM - 12:00 PM" },
  { value: "12pm-2pm", label: "12:00 PM - 2:00 PM" },
  { value: "2pm-4pm", label: "2:00 PM - 4:00 PM" },
  { value: "4pm-6pm", label: "4:00 PM - 6:00 PM" },
  { value: "6pm-8pm", label: "6:00 PM - 8:00 PM" }
]

export default function ComboboxExample() {
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Delivery Preferences</CardTitle>
        <CardDescription>
          Select your preferred delivery location and time slot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="location">Preferred Drop-off Location</Label>
          <Combobox
            options={deliveryLocations}
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Select drop-off location"
            searchPlaceholder="Search for locations..."
          />
          {selectedLocation && (
            <p className="text-sm text-muted-foreground mt-2">
              You selected: {deliveryLocations.find(loc => loc.value === selectedLocation)?.label}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeslot">Preferred Delivery Time</Label>
          <Combobox
            options={timeSlots}
            value={selectedTimeSlot}
            onChange={setSelectedTimeSlot}
            placeholder="Select time slot"
            searchPlaceholder="Find available times..."
          />
          {selectedTimeSlot && (
            <p className="text-sm text-muted-foreground mt-2">
              You selected: {timeSlots.find(time => time.value === selectedTimeSlot)?.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 