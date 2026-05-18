"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Charts = dynamic(() => import("@/components/Charts"), {
  ssr: false,
  loading: () => <div style={{padding:"20px",color:"#888",fontSize:13}}>Завантаження графіків...</div>,
});

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [current, setCurrent]   = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stations").then(r => r.json()),
      fetch("/api/measurements/current").then(r => r.json()),
    ]).then(([st, cur]) => {
      setStations(st.data);
      setCurrent(cur.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/measurements?stationId=${selectedId}&limit=30`)
      .then(r => r.json())
      .then(d => setMeasurements(d.data));
  }, [selectedId]);

  const stationsWithData = stations.map(s => ({
    ...s,
    measurement: current.find((c: any) => c.station.id === s.id)?.measurement,
  }));

  const selectedStation = stations.find(s => s.id === selectedId);

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; margin:0; background:#fff; color:#111; }
        nav { background:#2d6a2d; padding:10px 20px; display:flex; gap:20px; align-items:center; }
        nav span { color:#fff; font-weight:bold; font-size:16px; }
        nav a { color:#c8e6c8; font-size:14px; text-decoration:none; }
        nav a:hover { color:#fff; }
        nav a.active { color:#fff; font-weight:bold; }
        .wrap { width: 100%; padding: 24px 24px 60px; box-sizing: border-box; }
        h1 { font-size:22px; margin-bottom:6px; }
        .sub { font-size:13px; color:#666; margin-bottom:20px; }
        .layout { display:grid; grid-template-columns:1fr 1fr; gap:16px; height: calc(100vh - 140px); }
        @media(max-width:700px){ .layout{ grid-template-columns:1fr; } }
        .panel { border:1px solid #ddd; padding:16px; overflow-y: auto; }
        .panel-title { font-size:13px; font-weight:bold; color:#2d6a2d; border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:12px; }
        .station-list { display:flex; flex-direction:column; gap:1px; max-height:380px; overflow-y:auto; }
        .station-item { padding:10px 12px; border:1px solid #eee; cursor:pointer; font-size:13px; }
        .station-item:hover { background:#f5faf5; }
        .station-item.active { background:#e8f5e8; border-color:#2d6a2d; }
        .station-item-name { font-weight:bold; }
        .station-item-city { font-size:11px; color:#888; }
        .aqi-dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:6px; }
        .reset-btn { margin-top:12px; font-size:12px; color:#2d6a2d; cursor:pointer; background:none; border:1px solid #2d6a2d; padding:4px 12px; }
        .reset-btn:hover { background:#f0f7f0; }
        .hint { font-size:13px; color:#888; padding:40px 0; text-align:center; }
      `}</style>

       <nav>
        <span>EcoMonitor</span>
        <a href="/">Станції</a>
        <a href="/map" className="active">Карта</a>
        <a href="/pollutants">Довідник</a>
        <a href="/about">Про проєкт</a>
        <a href="/analytics">Аналітика</a>
      </nav>

      <div className="wrap">
        <h1>Інтерактивна карта</h1>
        <p className="sub">Клікни на маркер або станцію зі списку — з'являться графіки</p>

        <div className="layout">
          {/* ЛІВА КОЛОНКА — карта + список */}
          <div>
            <div className="panel" style={{ marginBottom:16 }}>
              <div className="panel-title">Карта станцій</div>
              {loading ? <div className="hint">Завантаження...</div> : (
                <Map
                  stations={stationsWithData}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </div>

            <div className="panel">
              <div className="panel-title">Список станцій</div>
              <div className="station-list">
                {stationsWithData.map((s: any) => {
                  const level = s.measurement?.indicators.aqiLevel ?? "good";
                  const colors: Record<string,string> = {
                    good:"#2d6a2d", moderate:"#b8860b",
                    unhealthy:"#cc5500", hazardous:"#990000"
                  };
                  return (
                    <div
                      key={s.id}
                      className={`station-item ${selectedId === s.id ? "active" : ""}`}
                      onClick={() => setSelectedId(s.id)}
                    >
                      <span className="aqi-dot" style={{ background: colors[level] }} />
                      <span className="station-item-name">{s.name}</span>
                      <span className="station-item-city"> · {s.city}</span>
                      {s.measurement && (
                        <span style={{ float:"right", fontWeight:"bold", color: colors[level], fontSize:12 }}>
                          AQI {s.measurement.indicators.aqi}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedId && (
                <button className="reset-btn" onClick={() => { setSelectedId(null); setMeasurements([]); }}>
                  Скинути вибір
                </button>
              )}
            </div>
          </div>

          {/* ПРАВА КОЛОНКА — графіки */}
          <div className="panel">
            <div className="panel-title">Графіки</div>
            {!selectedId && <div className="hint">Оберіть станцію на карті або зі списку</div>}
            {selectedId && measurements.length === 0 && <div className="hint">Завантаження графіків...</div>}
            {selectedId && measurements.length > 0 && (
              <Charts
                measurements={measurements}
                stationName={selectedStation?.name ?? ""}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}