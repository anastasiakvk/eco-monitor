import Link from "next/link";
import { MonitoringStation } from "@/types/air-quality";
import { stations } from "@/data/stations";
import { measurements } from "@/data/measurements";

function getStations() {
  return { data: stations as MonitoringStation[], total: stations.length };
}

function getCurrentMeasurements() {
  const data = stations.map((station) => {
    const latest = measurements
      .filter((m) => m.stationId === station.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return { station, measurement: latest ?? null };
  });
  return { data };
}

const aqiLabel: Record<string, string> = {
  good: "Добрий", moderate: "Помірний", unhealthy: "Шкідливий", hazardous: "Небезпечний",
};
const aqiColor: Record<string, string> = {
  good: "green", moderate: "goldenrod", unhealthy: "darkorange", hazardous: "red",
};

export default async function HomePage() {
  const { data: stations, total } = getStations();
  const { data: current } = getCurrentMeasurements();

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; margin: 0; background: #fff; color: #111; }
        a { color: #2d6a2d; }
        nav { background: #2d6a2d; padding: 10px 20px; display: flex; gap: 20px; align-items: center; }
        nav span { color: #fff; font-weight: bold; font-size: 16px; margin-right: 16px; }
        nav a { color: #c8e6c8; font-size: 14px; text-decoration: none; }
        nav a:hover { color: #fff; }
        .wrap { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #555; font-size: 13px; margin-bottom: 32px; }
        h2 { font-size: 16px; border-bottom: 2px solid #2d6a2d; padding-bottom: 4px; margin-bottom: 16px; color: #2d6a2d; }
        section { margin-bottom: 40px; scroll-margin-top: 56px; }
        .stations-list { display: flex; flex-direction: column; border: 1px solid #ddd; }
        .station-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; background: #fff; text-decoration: none; color: #111;
          border-bottom: 1px solid #eee;
        }
        .station-row:hover { background: #f5faf5; }
        .station-row:last-child { border-bottom: none; }
        .s-name { font-weight: bold; font-size: 14px; }
        .s-city { font-size: 12px; color: #666; }
        .s-right { display: flex; align-items: center; gap: 16px; }
        .s-nums { display: flex; gap: 12px; }
        .s-num { text-align: center; }
        .s-num-k { font-size: 10px; color: #888; }
        .s-num-v { font-size: 15px; font-weight: bold; }
        .badge { font-size: 11px; padding: 2px 8px; border-radius: 3px; border: 1px solid; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 10px; border-bottom: 2px solid #2d6a2d; font-size: 12px; color: #444; font-weight: bold; }
        td { padding: 7px 10px; border-bottom: 1px solid #eee; }
        tr:hover td { background: #f5faf5; }
        .pill { font-size: 11px; padding: 2px 7px; border-radius: 3px; border: 1px solid; }
        footer { text-align: center; padding: 16px; font-size: 12px; color: #888; border-top: 1px solid #ddd; margin-top: 40px; }
      `}</style>

      <nav>
        <span>EcoMonitor</span>
        <a href="/">Станції</a>
        <a href="/map">Карта</a>
        <a href="/pollutants">Довідник</a>
        <a href="/about">Про проєкт</a>
        <a href="/analytics">Аналітика</a>
      </nav>

      <div className="wrap">
        <h1>Екологічний моніторинг України</h1>
        <p className="sub">Моніторингових станцій: {total}</p>

        <section id="stations">
          <h2>Станції</h2>
          <div className="stations-list">
            {Array.isArray(stations) && stations.map((s: MonitoringStation) => {
              const curr = Array.isArray(current)
                ? current.find((c: any) => c.station?.id === s.id)
                : null;
              const ind = curr?.measurement?.indicators;
              const col = ind ? aqiColor[ind.aqiLevel] : "#888";
              const lbl = ind ? aqiLabel[ind.aqiLevel] : "—";
              return (
                <Link key={s.id} href={`/stations/${s.id}`} className="station-row">
                  <div>
                    <div className="s-name">{s.name}</div>
                    <div className="s-city">{s.city} · {s.type}</div>
                  </div>
                  <div className="s-right">
                    {ind && (
                      <div className="s-nums">
                        {([["PM2.5", ind.pm25], ["NO2", ind.no2], ["AQI", ind.aqi]] as [string, number][]).map(([k, v]) => (
                          <div className="s-num" key={k}>
                            <div className="s-num-k">{k}</div>
                            <div className="s-num-v">{v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="badge" style={{ color: col, borderColor: col }}>{lbl}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="measurements">
          <h2>Поточні вимірювання</h2>
          <table>
            <thead>
              <tr>
                {["Станція","PM2.5","PM10","NO2","SO2","CO","O3","AQI","Рівень"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(current) && current.map((c: any) => {
                const ind = c.measurement?.indicators;
                const col = ind ? aqiColor[ind.aqiLevel] : "#888";
                const lbl = ind ? aqiLabel[ind.aqiLevel] : "—";
                return (
                  <tr key={c.station?.id}>
                    <td>
                      <b>{c.station?.name}</b>
                      <br />
                      <span style={{ fontSize: 11, color: "#888" }}>{c.station?.city}</span>
                    </td>
                    {[ind?.pm25, ind?.pm10, ind?.no2, ind?.so2, ind?.co, ind?.o3].map((v, i) => (
                      <td key={i}>{v ?? "—"}</td>
                    ))}
                    <td><b>{ind?.aqi ?? "—"}</b></td>
                    <td>
                      <span className="pill" style={{ color: col, borderColor: col }}>{lbl}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>

      <footer>EcoMonitor · Лабораторна робота №1</footer>
    </>
  );
}