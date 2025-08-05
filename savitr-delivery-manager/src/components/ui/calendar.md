# Calendar Component

The Calendar component provides a date picker functionality based on the `react-day-picker` library. It allows users to select dates in a user-friendly interface with various customization options.

## Usage

```tsx
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function CalendarExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="border rounded-md"
      />
      
      {date && (
        <p>Selected date: {format(date, "PPP")}</p>
      )}
    </div>
  );
}
```

## Features

- Single date selection
- Date range selection
- Disable specific dates
- Custom styling options
- Integrates with form libraries like react-hook-form

## Props

The Calendar component accepts all props from `react-day-picker`'s DayPicker component, including:

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `"single"` \| `"range"` \| `"multiple"` | Selection mode |
| `selected` | `Date` \| `Date[]` \| `DateRange` | The selected date(s) |
| `onSelect` | Function | Callback when date selection changes |
| `disabled` | Function \| Date[] | Dates to disable |
| `className` | String | Additional CSS classes |
| `showOutsideDays` | Boolean | Show days from previous/next months |

## Examples

### Basic Calendar

```tsx
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>
```

### Disabling Past Dates

```tsx
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
/>
```

### Date Range Selection

```tsx
const [dateRange, setDateRange] = useState<{
  from: Date | undefined;
  to: Date | undefined;
}>({
  from: new Date(),
  to: undefined,
});

<Calendar
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
/>
```

## Customization

The Calendar component can be customized by modifying the `calendar.tsx` file and applying different styles through Tailwind classes.

## Dependencies

- `react-day-picker`: The underlying date picker library
- `date-fns`: For date formatting and manipulation
- `lucide-react`: For icons 