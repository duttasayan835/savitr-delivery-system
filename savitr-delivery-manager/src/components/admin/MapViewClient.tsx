"use client";

import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DeliveryPoint, RouteSourcePoint } from "@/app/admin/dashboard/aiClient";

// Define props for the MapViewClient component
interface MapViewClientProps {
  depot: RouteSourcePoint;
  deliveries: DeliveryPoint[];
  mapId: string;
}

export default function MapViewClient({ depot, deliveries, mapId }: MapViewClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  
  // Create and destroy the map on component mount/unmount
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Clean up any existing map instance first
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    
    // Create a new map instance
    const mapInstance = L.map(mapContainerRef.current).setView(
      [depot.lat, depot.lng], 
      12
    );
    
    // Add the map tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
    
    // Add depot marker (start point)
    L.marker([depot.lat, depot.lng])
      .bindPopup(`<b>Start: Delivery Hub</b><br>${depot.address}`)
      .addTo(mapInstance);
    
    // Add markers for each delivery point
    deliveries.forEach((delivery, index) => {
      L.marker([delivery.lat, delivery.lng])
        .bindPopup(`<b>Stop ${index + 1}: ${delivery.name}</b><br>${delivery.address}`)
        .addTo(mapInstance);
    });
    
    // Add depot marker again (end point)
    L.marker([depot.lat, depot.lng])
      .bindPopup(`<b>End: Return to Delivery Hub</b><br>${depot.address}`)
      .addTo(mapInstance);
    
    // Create route polyline
    const routePoints = [
      [depot.lat, depot.lng],
      ...deliveries.map(d => [d.lat, d.lng]),
      [depot.lat, depot.lng]
    ] as [number, number][];
    
    L.polyline(routePoints, { color: 'blue', weight: 3 }).addTo(mapInstance);
    
    // Store the map instance for cleanup
    leafletMapRef.current = mapInstance;
    
    // Cleanup function
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [depot, deliveries, mapId]);
  
  return (
    <div 
      ref={mapContainerRef} 
      className="h-[400px] w-full mt-4 border rounded overflow-hidden"
      id={`map-container-${mapId}`}
    />
  );
} 