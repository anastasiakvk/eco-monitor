import { Measurement, AQILevel } from "@/types/air-quality";

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function calcAQI(pm25: number): { aqi: number; level: AQILevel } {
  if (pm25 <= 12) return { aqi: Math.round(pm25 * 4.17), level: AQILevel.Good };
  if (pm25 <= 35) return { aqi: Math.round(50 + (pm25 - 12) * 2.1), level: AQILevel.Moderate };
  if (pm25 <= 55) return { aqi: Math.round(100 + (pm25 - 35) * 2.5), level: AQILevel.Unhealthy };
  return { aqi: Math.round(150 + (pm25 - 55) * 1.5), level: AQILevel.Hazardous };
}

const stationIds = ["kyiv-001","kharkiv-001","odesa-001","lviv-001","dnipro-001","zaporizhzhia-001"];

export const measurements: Measurement[] = [];

stationIds.forEach((stationId) => {
  const isIndustrial = stationId.includes("dnipro") || stationId.includes("zaporizhzhia");
  for (let day = 29; day >= 0; day--) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(12, 0, 0, 0);
    const pm25 = isIndustrial ? randomInRange(25, 75) : randomInRange(8, 45);
    const { aqi, level } = calcAQI(pm25);
    measurements.push({
      id: `${stationId}-${date.toISOString().split("T")[0]}`,
      stationId,
      timestamp: date.toISOString(),
      indicators: {
        pm25,
        pm10: randomInRange(pm25 * 1.5, pm25 * 2.2),
        no2: isIndustrial ? randomInRange(40, 100) : randomInRange(15, 60),
        so2: isIndustrial ? randomInRange(20, 80) : randomInRange(5, 30),
        co: randomInRange(0.5, 3.5),
        o3: randomInRange(30, 90),
        aqi,
        aqiLevel: level,
      },
    });
  }
});