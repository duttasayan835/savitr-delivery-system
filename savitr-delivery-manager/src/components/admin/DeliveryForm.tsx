"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock3, Sparkles, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Define schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Recipient name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  product: z.string().min(2, {
    message: "Product information is required.",
  }),
  deliveryDate: z.date({
    required_error: "Delivery date is required.",
  }),
  deliveryTime: z.string().min(1, {
    message: "Delivery time is required.",
  }),
  trackingId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DeliveryFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
  getPrediction?: (data: FormData) => Promise<string | null>;
}

export default function DeliveryForm({ 
  onSubmit, 
  isSubmitting = false, 
  getPrediction 
}: DeliveryFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isPredicting, setIsPredicting] = useState(false);
  const [isPredicted, setIsPredicted] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      latitude: undefined,
      longitude: undefined,
      product: "",
      deliveryDate: new Date(),
      deliveryTime: "",
      trackingId: "",
      notes: "",
    },
  });

  // Auto-predict time slot when form values change
  useEffect(() => {
    const predictTimeSlot = async () => {
      if (!getPrediction) return;
      
      const formData = form.getValues();
      
      // Only predict if we have enough data
      if (formData.name && formData.address && formData.product) {
        setIsPredicting(true);
        try {
          const predictedSlot = await getPrediction(formData);
          if (predictedSlot) {
            form.setValue('deliveryTime', predictedSlot);
            setIsPredicted(true);
          }
        } catch (error) {
          console.error("Error predicting time slot:", error);
        } finally {
          setIsPredicting(false);
        }
      }
    };
    
    const subscription = form.watch(() => {
      // Don't re-predict if we already have a prediction
      if (!isPredicted) {
        predictTimeSlot();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, getPrediction, isPredicted]);

  // Generate a random tracking ID
  const generateTrackingId = () => {
    const prefix = "SAVITR";
    const randomNum = Math.floor(Math.random() * 10000000);
    return `${prefix}-${randomNum.toString().padStart(7, '0')}`;
  };

  // Handle form submission
  const handleSubmit = (data: FormData) => {
    // If no tracking ID is provided, generate one
    if (!data.trackingId) {
      data.trackingId = generateTrackingId();
    }
    
    onSubmit(data);
    
    // In development mode, show a success message
    toast.success("Delivery created successfully", {
      description: `Tracking ID: ${data.trackingId}`,
    });
    
    // Reset form
    form.reset();
    setIsPredicted(false);
  };

  // Helper to randomly generate coordinates near an address for testing
  const generateRandomCoordinates = () => {
    // Generate coordinates around Mumbai, India as an example
    // Generate with 13 decimal places for high precision
    const baseLatitude = 19.0760 + (Math.random() * 0.1 - 0.05);
    const baseLongitude = 72.8770 + (Math.random() * 0.1 - 0.05);
    
    // Format with 13 decimal places
    const formattedLat = parseFloat(baseLatitude.toFixed(13));
    const formattedLng = parseFloat(baseLongitude.toFixed(13));
    
    form.setValue('latitude', formattedLat);
    form.setValue('longitude', formattedLng);
    
    toast.info("Generated random coordinates", {
      description: `Lat: ${formattedLat}, Lng: ${formattedLng}`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recipient Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter recipient name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recipient Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Recipient Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter delivery address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Latitude */}
          <FormField
            control={form.control}
            name="latitude"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Latitude
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.0000000000001" 
                    min="-90" 
                    max="90" 
                    placeholder="e.g. 19.0760000000000"
                    {...field}
                    value={value === undefined ? "" : value}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Parse with high precision (13 decimal places)
                      const parsed = val ? parseFloat(parseFloat(val).toFixed(13)) : undefined;
                      onChange(parsed);
                    }}
                  />
                </FormControl>
                <FormDescription>Supports up to 13 decimal places for high precision</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Longitude */}
          <FormField
            control={form.control}
            name="longitude"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Longitude
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.0000000000001" 
                      min="-180" 
                      max="180" 
                      placeholder="e.g. 72.8770000000000"
                      {...field}
                      value={value === undefined ? "" : value}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Parse with high precision (13 decimal places)
                        const parsed = val ? parseFloat(parseFloat(val).toFixed(13)) : undefined;
                        onChange(parsed);
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={generateRandomCoordinates}
                    className="whitespace-nowrap"
                  >
                    Random
                  </Button>
                </div>
                <FormDescription>
                  For route optimization, please provide coordinates (up to 13 decimal places)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product Info */}
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Information</FormLabel>
              <FormControl>
                <Input placeholder="Enter product details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delivery Date */}
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Delivery Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        // Reset prediction when date changes
                        setIsPredicted(false);
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery Time */}
          <FormField
            control={form.control}
            name="deliveryTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Delivery Time
                  {isPredicted && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <Sparkles className="h-3 w-3" />
                      <span>AI Recommended</span>
                    </div>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <select
                      className={cn(
                        "w-full p-2 border rounded-md",
                        isPredicted && "border-blue-400 bg-blue-50"
                      )}
                      {...field}
                      disabled={isPredicting}
                    >
                      <option value="">Select a time slot</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</option>
                      <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
                    </select>
                    {isPredicting && (
                      <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
                        <span className="text-sm text-gray-500">Predicting...</span>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tracking ID (Optional) */}
          <FormField
            control={form.control}
            name="trackingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Will be auto-generated if empty" {...field} />
                </FormControl>
                <FormDescription>
                  Leave blank to auto-generate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes (Optional) */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Additional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating delivery..." : "Create Delivery"}
        </Button>
      </form>
    </Form>
  );
} 