export default function AboutPage() {
  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; margin: 0; background: #fff; color: #111; }
        nav { background: #2d6a2d; padding: 10px 20px; display: flex; gap: 20px; align-items: center; }
        nav span { color: #fff; font-weight: bold; font-size: 16px; margin-right: 8px; }
        nav a { color: #c8e6c8; font-size: 14px; text-decoration: none; }
        nav a:hover { color: #fff; }
        nav a.active { color: #fff; font-weight: bold; }
        .wrap { max-width: 900px; margin: 0 auto; padding: 32px 16px 60px; }
        h1 { font-size: 22px; margin-bottom: 20px; }
        .box { border: 1px solid #ddd; padding: 20px; background: #f9faf9; font-size: 14px; line-height: 1.8; }
        .box p { margin-bottom: 12px; }
        .techs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
        .tech { font-size: 12px; padding: 3px 10px; background: #e8f5e8; color: #2d6a2d; border: 1px solid #c8dfc8; }
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
        <h1>Про проєкт</h1>
        <div className="box">
          <p>Система моніторингу якості повітря в містах України. Дані збираються з 6 моніторингових станцій і оновлюються щогодини.</p>
          <p>Проєкт реалізовано в рамках лабораторної роботи з дисципліни "Веб-технології". Використовується серверний рендеринг (SSR) для динамічних сторінок та статична генерація (SSG) для довідкових.</p>
          <p>API підтримує фільтрацію по регіону та типу станції, а також пагінацію для великих наборів даних.</p>
          <div className="techs">
            {["Next.js 15","TypeScript","SSR","SSG","REST API","Node.js","App Router"].map(t => (
              <span key={t} className="tech">{t}</span>
            ))}
          </div>
        </div>
      </div>

    </>
  );
}