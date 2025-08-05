"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";

// Define search parameters interface
interface SearchParams {
  query: string;
  filterBy: string;
  sortBy: string;
  status: string;
}

interface DeliverySearchProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

// Filter options
const filterOptions: ComboboxOption[] = [
  { value: "all", label: "All Fields" },
  { value: "tracking", label: "Tracking ID" },
  { value: "name", label: "Recipient Name" },
  { value: "phone", label: "Phone Number" },
  { value: "address", label: "Address" }
];

// Sort options
const sortOptions: ComboboxOption[] = [
  { value: "date_desc", label: "Latest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" }
];

// Status options
const statusOptions: ComboboxOption[] = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "upcoming", label: "Upcoming" },
  { value: "delivered", label: "Delivered" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "cancelled", label: "Cancelled" }
];

export default function DeliverySearch({ onSearch, isLoading = false }: DeliverySearchProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    filterBy: "all",
    sortBy: "date_desc",
    status: "all",
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({
      ...prev,
      query: e.target.value,
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Deliveries</CardTitle>
        <CardDescription>
          Search for deliveries by tracking ID, recipient name, phone number, or address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by tracking ID, name, or phone"
                value={searchParams.query}
                onChange={handleInputChange}
                className="pl-8"
              />
            </div>

            {/* Filter By */}
            <div className="w-full md:w-56">
              <Combobox
                options={filterOptions}
                value={searchParams.filterBy}
                onChange={(value) => handleSelectChange("filterBy", value)}
                placeholder="Filter by"
                searchPlaceholder="Search filters..."
              />
            </div>

            {/* Sort By */}
            <div className="w-full md:w-56">
              <Combobox
                options={sortOptions}
                value={searchParams.sortBy}
                onChange={(value) => handleSelectChange("sortBy", value)}
                placeholder="Sort by"
                searchPlaceholder="Search sort options..."
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-56">
              <Combobox
                options={statusOptions}
                value={searchParams.status}
                onChange={(value) => handleSelectChange("status", value)}
                placeholder="Status"
                searchPlaceholder="Search status..."
              />
            </div>

            {/* Search Button */}
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 