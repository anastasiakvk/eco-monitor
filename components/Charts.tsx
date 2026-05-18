"use client";
import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface Measurement {
  timestamp: string;
  indicators: {
    pm25: number; pm10: number; no2: number;
    so2: number; co: number; o3: number; aqi: number;
  };
}

interface ChartsProps {
  measurements: Measurement[];
  stationName: string;
}

const INDICATORS = [
  { key: "aqi",  label: "AQI",   color: "#cc5500" },
  { key: "pm25", label: "PM2.5", color: "#2d6a2d" },
  { key: "pm10", label: "PM10",  color: "#b8860b" },
  { key: "no2",  label: "NO2",   color: "#185FA5" },
  { key: "so2",  label: "SO2",   color: "#534AB7" },
  { key: "co",   label: "CO",    color: "#0F6E56" },
  { key: "o3",   label: "O3",    color: "#993C1D" },
];

const COLORS = INDICATORS.map(i => i.color);

export default function Charts({ measurements, stationName }: ChartsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const activeIndicators = selected
    ? INDICATORS.filter(i => i.key === selected)
    : INDICATORS;

  const lineData = measurements.slice(0, 14).reverse().map((m) => {
    const row: Record<string, any> = {
      date: new Date(m.timestamp).toLocaleDateString("uk-UA", { day:"2-digit", month:"short" }),
    };
    activeIndicators.forEach(i => { row[i.label] = (m.indicators as any)[i.key]; });
    return row;
  });

  const barData = measurements.slice(0, 7).reverse().map((m) => {
    const row: Record<string, any> = {
      date: new Date(m.timestamp).toLocaleDateString("uk-UA", { day:"2-digit", month:"short" }),
    };
    activeIndicators.forEach(i => { row[i.label] = (m.indicators as any)[i.key]; });
    return row;
  });

  const last = measurements[0]?.indicators;
  const pieData = last ? INDICATORS.map(i => ({
    name: i.label,
    value: Math.round((last as any)[i.key] * 10) / 10,
  })) : [];

  const filteredPie = selected
    ? pieData.filter(p => p.name === INDICATORS.find(i => i.key === selected)?.label)
    : pieData;

  return (
    <div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>
        <b>{stationName}</b>
      </p>

      {/* ФІЛЬТР */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          onClick={() => setSelected(null)}
          style={{
            fontSize: 11, padding: "3px 10px", cursor: "pointer",
            border: "1px solid #444",
            background: selected === null ? "#444" : "#fff",
            color: selected === null ? "#fff" : "#444",
            borderRadius: 3, fontWeight: "bold",
          }}
        >
          Всі
        </button>
        {INDICATORS.map(i => (
          <button
            key={i.key}
            onClick={() => setSelected(i.key === selected ? null : i.key)}
            style={{
              fontSize: 11, padding: "3px 10px", cursor: "pointer",
              border: `1px solid ${i.color}`,
              background: selected === i.key ? i.color : "#fff",
              color: selected === i.key ? "#fff" : i.color,
              borderRadius: 3,
            }}
          >
            {i.label}
          </button>
        ))}
      </div>

      {/* ПОТОЧНІ ЗНАЧЕННЯ */}
      {last && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px,1fr))", gap: 6, marginBottom: 14 }}>
          {INDICATORS.map(i => (
            <div
              key={i.key}
              onClick={() => setSelected(i.key === selected ? null : i.key)}
              style={{
                border: `1px solid ${selected === i.key || selected === null ? i.color : "#ddd"}`,
                borderRadius: 4, padding: "6px 4px", textAlign: "center",
                cursor: "pointer",
                background: selected === i.key ? i.color + "18" : "#fff",
              }}
            >
              <div style={{ fontSize: 10, color: "#888" }}>{i.label}</div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: i.color }}>
                {Math.round((last as any)[i.key] * 10) / 10}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ЛІНІЙНИЙ */}
      <p style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
        Динаміка за 14 днів
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          {activeIndicators.map(i => (
            <Line key={i.key} type="monotone" dataKey={i.label}
              stroke={i.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* СТОВПЧИКОВА */}
      <p style={{ fontSize: 11, color: "#666", margin: "12px 0 4px" }}>
        Порівняння за 7 днів
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          {activeIndicators.map(i => (
            <Bar key={i.key} dataKey={i.label} fill={i.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* КРУГОВА */}
      <p style={{ fontSize: 11, color: "#666", margin: "12px 0 4px" }}>
        Структура забруднення зараз
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={filteredPie} dataKey="value" nameKey="name"
            cx="50%" cy="50%" outerRadius={70} label>
            {filteredPie.map((entry, i) => {
              const color = INDICATORS.find(ind => ind.label === entry.name)?.color ?? COLORS[i];
              return <Cell key={i} fill={color} />;
            })}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}