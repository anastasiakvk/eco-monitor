import { notFound } from "next/navigation";
import Link from "next/link";
import { stations } from "@/data/stations";
import { measurements } from "@/data/measurements";

function getStation(id: string) {
  const station = stations.find((s) => s.id === id);
  if (!station) return null;
  const stationMeasurements = measurements
    .filter((m) => m.stationId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);
  return { ...station, measurements: stationMeasurements };
}

const aqiLabel: Record<string, string> = {
  good: "Добрий", moderate: "Помірний", unhealthy: "Шкідливий", hazardous: "Небезпечний",
};
const aqiColor: Record<string, string> = {
  good: "green", moderate: "goldenrod", unhealthy: "darkorange", hazardous: "red",
};

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = getStation(id);
  if (!station) notFound();

  const ind = station.measurements?.[0]?.indicators;
  const col = ind ? aqiColor[ind.aqiLevel] : "#888";
  const lbl = ind ? aqiLabel[ind.aqiLevel] : "—";

  const avg = (key: string) => {
    const vals = station.measurements?.map((m: any) => m.indicators[key]) ?? [];
    return vals.length ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1) : "—";
  };

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; margin: 0; background: #fff; color: #111; }
        a { color: #2d6a2d; }
        nav { background: #2d6a2d; padding: 10px 20px; display: flex; gap: 20px; align-items: center; }
        nav span { color: #fff; font-weight: bold; font-size: 16px; }
        nav a { color: #c8e6c8; font-size: 14px; }
        nav a:hover { color: #fff; }
        .wrap { max-width: 900px; margin: 0 auto; padding: 24px 16px 60px; }
        .breadcrumb { font-size: 12px; color: #888; margin-bottom: 20px; }
        .breadcrumb a { color: #2d6a2d; }
        h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
        .meta { font-size: 13px; color: #666; margin-bottom: 20px; }
        h2 { font-size: 15px; border-bottom: 2px solid #2d6a2d; padding-bottom: 4px; margin: 28px 0 14px; color: #2d6a2d; }

        .top-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .aqi-box { border: 2px solid; padding: 14px 20px; text-align: center; }
        .aqi-num { font-size: 36px; font-weight: bold; line-height: 1; }
        .aqi-txt { font-size: 12px; color: #666; margin-top: 4px; }
        .aqi-lbl { font-size: 13px; font-weight: bold; margin-top: 4px; }

        .ind-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap: 8px; margin-bottom: 28px; }
        .ind-cell { border: 1px solid #ddd; padding: 10px 12px; }
        .ind-k { font-size: 11px; color: #888; margin-bottom: 4px; }
        .ind-v { font-size: 20px; font-weight: bold; }
        .ind-avg { font-size: 11px; color: #888; margin-top: 4px; }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
        .info-box { border: 1px solid #ddd; padding: 14px 16px; }
        .info-box-title { font-size: 12px; font-weight: bold; color: #444; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
        .info-row:last-child { border: none; }
        .info-k { color: #777; }
        .info-v { font-weight: bold; }

        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 10px; border-bottom: 2px solid #2d6a2d; font-size: 12px; color: #444; }
        td { padding: 7px 10px; border-bottom: 1px solid #eee; }
        tr:hover td { background: #f5faf5; }
        .pill { font-size: 11px; padding: 2px 7px; border: 1px solid; border-radius: 3px; }

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
        <div className="breadcrumb">
          <Link href="/">Головна</Link> / {station.city} / {station.name}
        </div>

        <div className="top-row">
          <div>
            <h1>{station.name}</h1>
            <p className="meta">{station.city}, {station.region} · {station.type}</p>
          </div>
          {ind && (
            <div className="aqi-box" style={{ borderColor: col }}>
              <div className="aqi-num" style={{ color: col }}>{ind.aqi}</div>
              <div className="aqi-txt">Індекс AQI</div>
              <div className="aqi-lbl" style={{ color: col }}>{lbl}</div>
            </div>
          )}
        </div>

        {ind && (
          <>
            <h2>Поточні показники</h2>
            <div className="ind-grid">
              {([ ["PM2.5", ind.pm25, avg("pm25")], ["PM10", ind.pm10, avg("pm10")],
                  ["NO2",  ind.no2,  avg("no2")],  ["SO2",  ind.so2,  avg("so2")],
                  ["CO",   ind.co,   avg("co")],   ["O3",   ind.o3,   avg("o3")] ] as [string,number,string][])
                .map(([k, v, av]) => (
                  <div className="ind-cell" key={k}>
                    <div className="ind-k">{k}</div>
                    <div className="ind-v">{v}</div>
                    <div className="ind-avg">сер. {av}</div>
                  </div>
              ))}
            </div>
          </>
        )}

        <h2>Інформація</h2>
        <div className="info-grid">
          <div className="info-box">
            <div className="info-box-title">Загальні дані</div>
            <div className="info-row"><span className="info-k">ID</span><span className="info-v">{station.id}</span></div>
            <div className="info-row"><span className="info-k">Тип</span><span className="info-v">{station.type}</span></div>
            <div className="info-row"><span className="info-k">Статус</span><span className="info-v" style={{color: station.isActive ? "green" : "red"}}>{station.isActive ? "Активна" : "Неактивна"}</span></div>
          </div>
          <div className="info-box">
            <div className="info-box-title">Розташування</div>
            <div className="info-row"><span className="info-k">Місто</span><span className="info-v">{station.city}</span></div>
            <div className="info-row"><span className="info-k">Область</span><span className="info-v">{station.region}</span></div>
            <div className="info-row"><span className="info-k">Координати</span><span className="info-v">{station.coordinates.lat}, {station.coordinates.lng}</span></div>
          </div>
        </div>

        <h2>Вимірювання за 30 днів</h2>
        <table>
          <thead>
            <tr>{["Дата","PM2.5","PM10","NO2","SO2","CO","O3","AQI","Рівень"].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {station.measurements?.map((m: any) => {
              const mi = m.indicators;
              const c  = aqiColor[mi.aqiLevel];
              const l  = aqiLabel[mi.aqiLevel];
              return (
                <tr key={m.id}>
                  <td>{new Date(m.timestamp).toLocaleDateString("uk-UA", { day:"2-digit", month:"short" })}</td>
                  {[mi.pm25, mi.pm10, mi.no2, mi.so2, mi.co, mi.o3].map((v: number, i: number) => <td key={i}>{v}</td>)}
                  <td><b>{mi.aqi}</b></td>
                  <td><span className="pill" style={{ color: c, borderColor: c }}>{l}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer>EcoMonitor · {station.name} · Лабораторна робота №1</footer>
    </>
  );
}