"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const aqiColor: Record<string, string> = {
  good: "#2d6a2d",
  moderate: "#b8860b",
  unhealthy: "#cc5500",
  hazardous: "#990000",
};

const aqiLabel: Record<string, string> = {
  good: "Добрий",
  moderate: "Помірний",
  unhealthy: "Шкідливий",
  hazardous: "Небезпечний",
};

interface Station {
  id: string;
  name: string;
  city: string;
  coordinates: { lat: number; lng: number };
  measurement?: {
    indicators: {
      aqi: number;
      aqiLevel: string;
      pm25: number;
      no2: number;
    };
  };
}

interface MapProps {
  stations: Station[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Map({ stations, selectedId, onSelect }: MapProps) {
  const validStations = stations.filter(
    (s) => s.coordinates && s.coordinates.lat && s.coordinates.lng
  );

  return (
    <MapContainer
      center={[49.0, 31.0]}
      zoom={6}
      style={{ height: "100%", minHeight: "400px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="OpenStreetMap"
      />
      {validStations.map((s) => {
        const level = s.measurement?.indicators.aqiLevel ?? "good";
        const color = aqiColor[level] ?? "#888";
        const isSelected = s.id === selectedId;
        return (
          <CircleMarker
            key={s.id}
            center={[s.coordinates.lat, s.coordinates.lng]}
            radius={isSelected ? 16 : 10}
            pathOptions={{
              color: isSelected ? "#000" : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect(s.id) }}
          >
            <Popup>
              <strong>{s.name}</strong><br />
              {s.city}<br />
              AQI: {s.measurement?.indicators.aqi ?? "—"}<br />
              PM2.5: {s.measurement?.indicators.pm25 ?? "—"}<br />
              NO2: {s.measurement?.indicators.no2 ?? "—"}<br />
              <span style={{ color, fontWeight: "bold" }}>
                {aqiLabel[level]}
              </span>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}