"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function CalendarExamplePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Calendar Component Example</h1>
      <div className="rounded-md border p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      <div className="mt-4">
        <p>Selected date: {date?.toLocaleDateString()}</p>
      </div>
    </div>
  );
} 