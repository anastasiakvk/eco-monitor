export enum StationType {
  Urban = "urban",
  Rural = "rural",
  Industrial = "industrial",
  Suburban = "suburban",
}

export enum AQILevel {
  Good = "good",
  Moderate = "moderate",
  Unhealthy = "unhealthy",
  Hazardous = "hazardous",
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MonitoringStation {
  id: string;
  name: string;
  city: string;
  region: string;
  coordinates: Coordinates;
  type: StationType;
  isActive: boolean;
}

export interface AirQualityIndicators {
  pm25: number;   // мкг/м³
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  aqi: number;
  aqiLevel: AQILevel;
}

export interface Measurement {
  id: string;
  stationId: string;
  timestamp: string;  // ISO 8601
  indicators: AirQualityIndicators;
}