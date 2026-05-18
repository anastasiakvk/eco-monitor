const pollutants = [
  { id: "PM2.5", name: "Дрібний пил",       norm: "≤ 25 мкг/м³", desc: "Частинки менше 2.5 мкм. Проникають глибоко в легені та кровоносну систему. Спричиняють серцево-судинні захворювання." },
  { id: "PM10",  name: "Зважені частинки",   norm: "≤ 50 мкг/м³", desc: "Частинки менше 10 мкм. Подразнюють верхні дихальні шляхи, викликають кашель та задишку." },
  { id: "NO2",   name: "Діоксид азоту",      norm: "≤ 40 мкг/м³", desc: "Утворюється при згоранні палива. Викликає запалення легень, погіршує перебіг астми." },
  { id: "SO2",   name: "Діоксид сірки",      norm: "≤ 20 мкг/м³", desc: "Промисловий забруднювач. Утворює кислотні дощі, подразнює дихальні шляхи." },
  { id: "CO",    name: "Чадний газ",         norm: "≤ 4 мг/м³",   desc: "Продукт неповного згорання. Блокує гемоглобін, зменшує постачання кисню до органів." },
  { id: "O3",    name: "Озон",               norm: "≤ 60 мкг/м³", desc: "Вторинний забруднювач. Подразнює очі та слизові оболонки, шкідливий для рослин." },
];

export default function PollutantsPage() {
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
        h1 { font-size: 22px; margin-bottom: 6px; }
        .sub { font-size: 13px; color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #2d6a2d; font-size: 12px; color: #444; }
        td { padding: 12px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
        tr:hover td { background: #f5faf5; }
        .p-id { font-weight: bold; color: #2d6a2d; font-size: 15px; }
        .p-name { font-size: 12px; color: #666; margin-top: 2px; }
        .p-norm { font-weight: bold; white-space: nowrap; }
        .p-desc { font-size: 13px; color: #444; line-height: 1.5; }
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
        <h1>Довідник забруднювачів</h1>
        <p className="sub">Основні показники якості повітря та їх допустимі норми згідно стандартів ВОЗ</p>
        <table>
          <thead>
            <tr>
              <th>Речовина</th>
              <th>Норма</th>
              <th>Опис</th>
            </tr>
          </thead>
          <tbody>
            {pollutants.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="p-id">{p.id}</div>
                  <div className="p-name">{p.name}</div>
                </td>
                <td className="p-norm">{p.norm}</td>
                <td className="p-desc">{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer>EcoMonitor · Лабораторна робота №1</footer>
    </>
  );
}