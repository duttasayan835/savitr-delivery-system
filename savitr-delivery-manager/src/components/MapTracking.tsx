"use client";
import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression, LeafletMouseEvent } from "leaflet";
import dynamic from "next/dynamic";
import { useToast } from "@/contexts/hooks/use-toast";
import { DeliveryStatus } from '@/models/Delivery';

const defaultPosition: LatLngExpression = [40.7128, -74.006]; // New York

// Fix marker icon bug in default Leaflet
if (typeof window !== "undefined" && L.Marker) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function LocationMarker({ setMarkers }: { setMarkers: (arg: any) => void }) {
  const map = useMapEvents({
    click(e: LeafletMouseEvent) {
      setMarkers((prev: any) => [
        ...prev,
        {
          position: [e.latlng.lat, e.latlng.lng],
          info: `Dropped at [${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}]`,
        },
      ]);
    },
  });
  return null;
}

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapTrackingProps {
  delivery: {
    status: DeliveryStatus;
    currentLocation?: {
      lat: number;
      lng: number;
    };
    destination: {
      lat: number;
      lng: number;
    };
  };
  userPos?: {
    lat: number;
    lng: number;
  };
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

const MapTracking = ({ delivery, userPos }: MapTrackingProps) => {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [markers, setMarkers] = useState<{ position: LatLngExpression; info?: string }[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const { toast } = useToast();

  if (!delivery) {
    return <div className="w-full h-[400px] rounded-lg overflow-hidden mb-8 relative bg-gray-200 animate-pulse" />;
  }

  useEffect(() => {
    // Initialize map only once
    if (!mapInitialized) {
      setMapInitialized(true);
    }

    return () => {
      // Cleanup map instance when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapInitialized]);

  if (!mapInitialized) {
    return <div className="w-full h-[400px] rounded-lg overflow-hidden mb-8 relative bg-gray-200 animate-pulse" />;
  }

  const center: LatLngExpression = userPos ? [userPos.lat, userPos.lng] as [number, number] : defaultPosition;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden mb-8 relative">
      <MapContainer
        center={center}
        zoom={11}
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution="© OpenStreetMap contributors" 
        />
        <LocationMarker setMarkers={setMarkers} />
        {markers.map((m, idx) => (
          <Marker key={`marker-${idx}`} position={m.position as LatLngExpression}>
            <Popup>
              {m.info || `Marker #${idx + 1}`}
            </Popup>
          </Marker>
        ))}
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng] as LatLngExpression}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        {delivery.currentLocation && (
          <Marker position={[delivery.currentLocation.lat, delivery.currentLocation.lng] as LatLngExpression}>
            <Popup>Current Delivery Location</Popup>
          </Marker>
        )}
        <Marker position={[delivery.destination.lat, delivery.destination.lng] as LatLngExpression}>
          <Popup>Delivery Destination</Popup>
        </Marker>
        <MapUpdater center={center as [number, number]} />
      </MapContainer>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapTracking), { ssr: false });
