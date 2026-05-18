"use client";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => setStats(d.data));
  }, []);

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; margin: 0; background: #fff; color: #111; }
        nav { background: #2d6a2d; padding: 10px 20px; display: flex; gap: 20px; align-items: center; }
        nav span { color: #fff; font-weight: bold; font-size: 16px; }
        nav a { color: #c8e6c8; font-size: 14px; text-decoration: none; }
        nav a:hover { color: #fff; }
        nav a.active { color: #fff; font-weight: bold; }
        .wrap { max-width: 900px; margin: 0 auto; padding: 32px 16px 60px; }
        h1 { font-size: 22px; margin-bottom: 24px; }
        h2 { font-size: 15px; color: #2d6a2d; border-bottom: 2px solid #2d6a2d; padding-bottom: 4px; margin: 24px 0 12px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 12px; margin-bottom: 24px; }
        .stat-card { border: 1px solid #ddd; padding: 16px; text-align: center; }
        .stat-val { font-size: 32px; font-weight: bold; color: #2d6a2d; }
        .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 10px; border-bottom: 2px solid #2d6a2d; font-size: 12px; color: #444; }
        td { padding: 7px 10px; border-bottom: 1px solid #eee; }
        tr:hover td { background: #f5faf5; }
        .note { font-size: 12px; color: #888; margin-top: 8px; }
        .refresh { font-size: 13px; color: #2d6a2d; cursor: pointer; background: none; border: 1px solid #2d6a2d; padding: 6px 16px; margin-bottom: 20px; }
      `}</style>

      <nav>
        <span>EcoMonitor</span>
        <a href="/">Станції</a>
        <a href="/map">Карта</a>
        <a href="/pollutants">Довідник</a>
        <a href="/about">Про проєкт</a>
        <a href="/analytics" className="active">Аналітика</a>
      </nav>

      <div className="wrap">
        <h1>Панель аналітики</h1>

        <button className="refresh" onClick={async () => {
            const res = await fetch("/api/analytics", { cache: "no-store" });
            const d = await res.json();
            setStats(d.data);
            }}>
            Оновити дані
        </button>


        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-val">{stats?.totalEvents ?? 0}</div>
            <div className="stat-label">всього подій</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{Object.keys(stats?.pageViews ?? {}).length}</div>
            <div className="stat-label">унікальних сторінок</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{Object.keys(stats?.eventCounts ?? {}).length}</div>
            <div className="stat-label">типів подій</div>
          </div>
        </div>

        <h2>Перегляди сторінок</h2>
        <table>
          <thead><tr><th>Сторінка</th><th>Переглядів</th></tr></thead>
          <tbody>
            {Object.entries(stats?.pageViews ?? {}).map(([page, count]) => (
              <tr key={page}>
                <td>{page}</td>
                <td><b>{count as number}</b></td>
              </tr>
            ))}
            {Object.keys(stats?.pageViews ?? {}).length === 0 && (
              <tr><td colSpan={2} style={{color:"#888"}}>Зайди на кілька сторінок і натисни "Оновити дані"</td></tr>
            )}
          </tbody>
        </table>

        <h2>Типи подій</h2>
        <table>
          <thead><tr><th>Подія</th><th>Кількість</th></tr></thead>
          <tbody>
            {Object.entries(stats?.eventCounts ?? {}).map(([event, count]) => (
              <tr key={event}>
                <td>{event}</td>
                <td><b>{count as number}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}