"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CalendarExamplePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Calendar Component</h1>
          <p className="text-gray-500 mb-6">A simple date picker for selecting dates</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Calendar</CardTitle>
                <CardDescription>
                  A simple calendar for picking a date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="border rounded-md"
                />
                
                {date && (
                  <p className="mt-4 text-center">
                    Selected: <span className="font-medium">{format(date, "PPP")}</span>
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Calendar with disabled dates */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar with Disabled Dates</CardTitle>
                <CardDescription>
                  A calendar that disables past dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="border rounded-md"
                />
                
                {date && (
                  <p className="mt-4 text-center">
                    Selected: <span className="font-medium">{format(date, "PPP")}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Component Usage</h2>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto">
              {`import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// In your component
const [date, setDate] = useState<Date | undefined>(new Date());

return (
  <div>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
    />
    {date && <p>Selected: {format(date, "PPP")}</p>}
  </div>
);`}
            </pre>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 