"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix Leaflet icon issue
const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper component to handle auto-centering
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Helper component for map clicks (picker mode)
function MapPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function DynamicMap({ 
  reports = [], 
  center = [37.7749, -122.4194], 
  zoom = 13,
  userLocation = null,
  onLocationSelect = null,
  showUserMarker = true
}) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-background">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", background: "#0a0a0c" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <ChangeView center={center} zoom={zoom} />
        
        {onLocationSelect && <MapPicker onLocationSelect={onLocationSelect} />}

        {/* User's Current/Selected Location */}
        {showUserMarker && userLocation && userLocation[0] && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="p-1 font-bold text-xs uppercase tracking-widest">Report Location</div>
            </Popup>
          </Marker>
        )}

        {/* Existing Reports */}
        {reports.map((report) => (
          report.latitude && report.longitude && (
            <Marker 
              key={report.id} 
              position={[report.latitude, report.longitude]} 
              icon={defaultIcon}
            >
              <Popup className="custom-popup">
                <div className="p-2 space-y-2 text-left">
                  <p className="text-[10px] font-black uppercase text-accent-blue tabular-nums">#{report.ticket_id}</p>
                  <p className="text-xs font-bold uppercase tracking-tight text-foreground">{report.category}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed italic">"{report.description}"</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", report.priority_level >= 7 ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-accent-teal')} />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{report.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

// Simple internal cn fallback if not imported
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
