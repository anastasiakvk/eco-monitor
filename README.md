# EcoMonitor — Звіти з лабораторних робіт

**Студентка:** Карачун Анастасія Володимирівна, група ТР-33  
**Дисципліна:** Веб-орієнтована розробка системи екологічного моніторингу  
**Викладач:** Рудик Володимир Іванович  
**Університет:** КПІ ім. Ігоря Сікорського, ННІАТЕ, Кафедра цифрових технологій в енергетиці

---

## Зміст

- [Лабораторна робота №1 — Next.js і TypeScript](#лабораторна-робота-1)
- [Лабораторна робота №2 — Інтерактивна карта та графіки](#лабораторна-робота-2)
- [Лабораторна робота №3 — Аналітика та логування](#лабораторна-робота-3)
- [Лабораторна робота №4 — Аудит продуктивності, оптимізація та деплой](#лабораторна-робота-4)

---

# Лабораторна робота №1

**Тема:** Створення проєкту на TypeScript, Next.js та Node.js (SSR)

**Мета роботи:** Набути практичних навичок створення веб-додатку з використанням Next.js та TypeScript, налаштування серверного рендерингу та розробки API для роботи з екологічними даними.

## Структура проєкту

```
eco-monitor/
├── app/
│   ├── layout.tsx                    # Головний layout, навігація та футер
│   ├── globals.css                   # Глобальні стилі
│   ├── page.tsx                      # Головна сторінка зі списком станцій (SSR)
│   ├── stations/[id]/page.tsx        # Детальна сторінка станції (SSR + динамічний роутинг)
│   ├── about/page.tsx                # Сторінка про проєкт (SSG)
│   ├── pollutants/page.tsx           # Довідник забруднювачів (SSG)
│   └── api/
│       ├── stations/route.ts         # GET /api/stations
│       ├── stations/[id]/route.ts    # GET /api/stations/:id
│       ├── measurements/route.ts     # GET /api/measurements
│       └── current/route.ts          # GET /api/current
├── components/                       # Перевикористовувані компоненти
├── data/
│   ├── stations.ts                   # 6 моніторингових станцій
│   └── measurements.ts               # 180 згенерованих вимірювань
├── lib/
│   └── utils.ts                      # Допоміжні функції для AQI
├── types/
│   ├── air-quality.ts                # Інтерфейси та enum для якості повітря
│   └── api.ts                        # Типи для API-відповідей
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Призначення основних каталогів

`app/` містить сторінки, layout і серверні API-маршрути. Саме тут реалізовано основну логіку інтерфейсу та отримання даних.

`data/` зберігає локальні тестові набори даних — 6 станцій у містах України та 180 вимірювань (по 30 на кожну станцію за останній місяць).

`lib/` використовується для повторно застосовуваних функцій, наприклад для розрахунку AQI.

`types/` містить спільні інтерфейси та enum, які використовуються і на сервері, і на клієнті.

## TypeScript-інтерфейси

### types/air-quality.ts

**Enum `StationType`** — описує типи станцій:

```typescript
export enum StationType {
  Urban = "urban",
  Rural = "rural",
  Industrial = "industrial",
  Suburban = "suburban",
}
```

**Enum `AQILevel`** — рівні якості повітря:

```typescript
export enum AQILevel {
  Good = "good",
  Moderate = "moderate",
  Unhealthy = "unhealthy",
  Hazardous = "hazardous",
}
```

**Інтерфейс `MonitoringStation`** — описує моніторингову станцію:

```typescript
export interface MonitoringStation {
  id: string;
  name: string;
  city: string;
  region: string;
  coordinates: Coordinates;
  type: StationType;
  isActive: boolean;
}
```

**Інтерфейс `AirQualityIndicators`** — показники якості повітря:

```typescript
export interface AirQualityIndicators {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  aqi: number;
  aqiLevel: AQILevel;
}
```

**Інтерфейс `Measurement`** — одне вимірювання:

```typescript
export interface Measurement {
  id: string;
  stationId: string;
  timestamp: string;
  indicators: AirQualityIndicators;
}
```

### types/api.ts

```typescript
export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

## SSR, SSG та призначення сторінок

### SSR

Головна сторінка і сторінка станції побудовані як серверно-рендерені. Параметр `cache: "no-store"` забезпечує завантаження свіжих даних при кожному запиті:

```typescript
async function getStations() {
  const res = await fetch("http://localhost:3000/api/stations", {
    cache: "no-store",
  });
  return res.json();
}

export default async function HomePage() {
  const { data: stations, total } = await getStations();
  // рендеринг сторінки...
}
```

У Next.js 15 параметри динамічного роутингу стали асинхронними:

```typescript
export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const station = await getStation(id);
  if (!station) notFound();
}
```

### SSG

Сторінки `app/about/page.tsx` і `app/pollutants/page.tsx` є статичними (`export const revalidate = false`). Довідник забруднювачів містить таблицю з описом 6 забруднювачів з нормами концентрації згідно стандартів ВОЗ.

## Тестові дані

Створено 6 моніторингових станцій у `data/stations.ts`:

| ID | Місто | Тип |
|---|---|---|
| kyiv-001 | Київ | urban |
| kharkiv-001 | Харків | urban |
| odesa-001 | Одеса | urban |
| lviv-001 | Львів | urban |
| dnipro-001 | Дніпро | industrial |
| zaporizhzhia-001 | Запоріжжя | industrial |

У `data/measurements.ts` згенеровано 180 вимірювань — по 30 на кожну станцію. PM2.5 для міських станцій: 8–45 мкг/м³, для промислових: 25–75 мкг/м³.

## API

### GET /api/stations

Підтримує фільтрацію по `region` та `type`, пагінацію через `page` і `limit`:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  let result = [...stations];
  if (region) {
    result = result.filter((s) =>
      s.region.toLowerCase().includes(region.toLowerCase())
    );
  }
  // пагінація та повернення...
}
```

### GET /api/stations/:id

Повертає деталі станції, останнє вимірювання та середні значення за 30 днів.

### GET /api/measurements

Фільтрація за `stationId`, діапазоном дат, пагінація і сортування.

### GET /api/current

Поточні показники для всіх активних станцій.

## Висновки

У ході лабораторної роботи створено веб-додаток EcoMonitor для моніторингу якості повітря по 6 містах України. Реалізовано SSR для динамічних сторінок, SSG для довідкових, чотири API-маршрути з валідацією та пагінацією, типобезпечні інтерфейси з enum. Строга перевірка типів у `tsconfig.json` дозволяє виявляти помилки ще до запуску застосунку.

---

# Лабораторна робота №2

**Тема:** Інтеграція інтерактивної карти та графіків

**Мета роботи:** Навчитися інтегрувати картографічні бібліотеки та інструменти візуалізації для створення інтерактивного інтерфейсу відображення екологічних даних.

## Нові залежності

```bash
npm install leaflet react-leaflet @types/leaflet
npm install recharts
```

## Нова структура файлів

```
app/
└── map/
    └── page.tsx          # Сторінка з картою та графіками ("use client")
components/
├── Map.tsx               # Клієнтський компонент карти (Leaflet)
└── Charts.tsx            # Три типи графіків (Recharts)
```

## Частина 1. Інтерактивна карта

### Проблема SSR та її вирішення

Leaflet використовує об'єкт `window`, який не існує на сервері. Компонент карти підключається виключно на клієнті через dynamic import:

```typescript
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
```

Компонент `components/Map.tsx` позначений директивою `"use client"`.

### Компонент карти

```tsx
<MapContainer center={[49.0, 31.0]} zoom={6}
  style={{ height: "420px", width: "100%" }}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {/* маркери станцій */}
</MapContainer>
```

### Маркери з кольоровим кодуванням

Використано `CircleMarker` — кола, колір яких залежить від рівня AQI:

```typescript
const aqiColor = {
  good: "#2d6a2d",       // зелений
  moderate: "#b8860b",   // жовтий
  unhealthy: "#cc5500",  // помаранчевий
  hazardous: "#990000",  // червоний
};
```

Обрана станція виділяється більшим радіусом (16px замість 10px) та чорною обводкою. `Popup` відображає назву, місто, AQI, PM2.5, NO2 та рівень забруднення.

## Частина 2. Графіки (components/Charts.tsx)

### Лінійний графік

Зміна AQI, PM2.5 та NO2 за останні 14 днів:

```tsx
<LineChart data={lineData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" /><YAxis />
  <Tooltip /><Legend />
  <Line dataKey="AQI"   stroke="#cc5500" strokeWidth={2} dot={false} />
  <Line dataKey="PM2.5" stroke="#2d6a2d" strokeWidth={2} dot={false} />
  <Line dataKey="NO2"   stroke="#185FA5" strokeWidth={2} dot={false} />
</LineChart>
```

### Стовпчикова діаграма

Порівняння PM2.5, PM10 та NO2 за останні 7 днів:

```tsx
<BarChart data={barData}>
  <Bar dataKey="PM2.5" fill="#2d6a2d" />
  <Bar dataKey="PM10"  fill="#b8860b" />
  <Bar dataKey="NO2"   fill="#185FA5" />
</BarChart>
```

### Кругова діаграма

Структура забруднення — частка кожного з 6 забруднювачів:

```tsx
<PieChart>
  <Pie data={pieData} dataKey="value" nameKey="name"
    cx="50%" cy="50%" outerRadius={80} label>
    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
  </Pie>
  <Tooltip /><Legend />
</PieChart>
```

## Частина 3. Інтеграція карти та графіків

Сторінка `app/map/page.tsx` — клієнтський компонент (`"use client"`).

### Стан компонента

```typescript
const [selectedId, setSelectedId] = useState<string | null>(null);
const [measurements, setMeasurements] = useState<any[]>([]);
```

### Завантаження даних

```typescript
useEffect(() => {
  if (!selectedId) return;
  fetch(`/api/measurements?stationId=${selectedId}&limit=30`)
    .then(r => r.json())
    .then(d => setMeasurements(d.data));
}, [selectedId]);
```

Layout сторінки розділений на дві колонки через CSS Grid. На мобільних — одна колонка.

## Висновки

Реалізовано інтерактивну карту станцій України з `CircleMarker` і кольоровим кодуванням за AQI. Підключено три типи графіків у `components/Charts.tsx`. Карту та графіки зв'язано через `selectedId` у `app/map/page.tsx`. Вирішено проблему SSR для Leaflet через `dynamic import` з `ssr: false`.

---

# Лабораторна робота №3

**Тема:** Впровадження аналітики та логування

**Мета роботи:** Навчитися інтегрувати системи веб-аналітики для відстеження користувацької активності та реалізувати серверне логування для моніторингу роботи додатку.

## Нові залежності

```bash
npm install pino pino-pretty
```

## Нові файли

```
lib/
  analytics.ts              # Власна система аналітики
  logger.ts                 # Pino-логер
  useAnalytics.ts           # Hook відстеження переглядів
app/
  analytics/page.tsx        # Панель аналітики
  components/
    Analytics.tsx           # Компонент (підключений у layout)
  api/
    analytics/route.ts      # POST /api/analytics
  not-found.tsx             # Кастомна сторінка 404
  error.tsx                 # Кастомна сторінка 500
  global-error.tsx          # Глобальний обробник помилок
analytics-log.json          # Файл збереження подій
```

## Частина 1. Власна система аналітики

Замість зовнішніх сервісів (Google Analytics) реалізовано власну систему — повний контроль над даними без зовнішніх залежностей.

### lib/analytics.ts

Глобальна змінна вирішує проблему скидання при перезапуску модулів Next.js:

```typescript
declare global {
  var __analytics_events: AnalyticsEvent[];
}

if (!global.__analytics_events) {
  global.__analytics_events = [];
}

export function trackEvent(data: Omit<AnalyticsEvent, "timestamp">) {
  const entry: AnalyticsEvent = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  global.__analytics_events.push(entry);
  console.log("[Analytics]", JSON.stringify(entry));
}
```

Кожна подія також зберігається у файл `analytics-log.json`:

```typescript
function saveToFile(event: object) {
  let existing: object[] = [];
  if (fs.existsSync(LOG_FILE)) {
    existing = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  }
  existing.push(event);
  fs.writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));
}
```

### lib/useAnalytics.ts

Hook відправляє `page_view` при кожному переході між сторінками:

```typescript
export function usePageView() {
  const pathname = usePathname();
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: pathname }),
    }).catch(() => {});
  }, [pathname]);
}
```

Компонент `Analytics.tsx` підключений у `app/layout.tsx` і працює на всіх сторінках:

```typescript
export default function Analytics() {
  usePageView();
  return null;
}
```

### Панель аналітики — app/analytics/page.tsx

Відображає: загальну кількість подій, перегляди кожної сторінки, типи подій та їх кількість, кількість збережених подій у файлі.

## Частина 2. Серверне логування

### lib/logger.ts

```typescript
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  base: { service: "eco-monitor" },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

### Рівні логування в API routes

```typescript
// Початок запиту
logger.info({ method: "GET", path: "/api/stations" }, "Запит списку станцій");

// Успішний результат
logger.info({ total, page }, "Станції успішно повернуто");

// Відсутній ресурс
logger.warn({ id }, "Станцію не знайдено");

// Помилка
logger.error({ path: "/api/stations", error: err }, "Помилка отримання станцій");
```

### middleware.ts

Логує всі запити до `/api/*`, крім `/api/analytics` (щоб уникнути нескінченного циклу):

```typescript
export function middleware(request: NextRequest) {
  const start = Date.now();
  const pathname = new URL(request.url).pathname;
  const response = NextResponse.next();
  const duration = Date.now() - start;

  if (pathname.startsWith("/api") &&
      !pathname.startsWith("/api/analytics")) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: request.method,
      pathname,
      duration: `${duration}ms`,
    }));
  }

  return response;
}
```

## Частина 3. Обробка помилок

### Ієрархія

```
GlobalError (app/global-error.tsx)    ← помилки у layout.tsx
  └── ErrorPage (app/error.tsx)       ← помилки на рівні маршруту
        └── ErrorBoundary             ← помилки у конкретному блоці
```

`app/not-found.tsx` — кастомна сторінка 404.  
`app/error.tsx` — отримує `error` та `reset` як пропси.  
`app/global-error.tsx` — повертає повноцінний HTML без залежності від layout.

## Висновки

Реалізовано власну систему аналітики з глобальним сховищем подій, збереженням у `analytics-log.json` та панеллю статистики. Підключено pino-логер з JSON-виводом у продакшні та `pino-pretty` у розробці. Middleware логує всі API-запити крім аналітики. Побудовано триступеневу ієрархію обробки помилок з кастомними сторінками 404 і 500.

---

# Лабораторна робота №4

**Тема:** Аудит продуктивності, оптимізація та деплой

**Мета:** навчитися проводити аудит продуктивності веб-додатку, застосовувати методи оптимізації та налаштовувати автоматизований деплой у продакшн-середовище.

## Частина 1. Аудит продуктивності

Аудит виконано інструментом Lighthouse у режимі інкогніто для двох сторінок: головної (`/`) та сторінки карти (`/map`).

### Основні проблеми, виявлені Lighthouse

- Великий початковий JS-bundle через синхронний імпорт Recharts
- Відсутність заголовків кешування для `/_next/static/`
- Recharts і react-leaflet блокують рендер при завантаженні разом із HTML

## Частина 2. Оптимізація

### 2.1 Dynamic import для карти

Вже реалізовано у лаб. №2:

```typescript
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
```

### 2.2 Lazy loading для графіків

```typescript
const Charts = dynamic(
  () => import("@/components/Charts"),
  { loading: () => <div className="chart-loading">Завантаження графіків...</div> }
)
```

**Обґрунтування:** Recharts (≈140 KB gzip) не потрібен при першому відкритті сторінки.

### 2.3 optimizePackageImports

```typescript
experimental: {
  optimizePackageImports: ["recharts", "leaflet"],
},
```

### 2.4 Кешування

```typescript
async headers() {
  return [
    {
      source: "/_next/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
      ],
    },
  ];
},
```

### 2.5 Фінальний next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" }],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["recharts", "leaflet"],
  },
};

export default nextConfig;
```

## Частина 3. CI/CD — .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Type check & build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build
```

**Кроки CI:**
1. `npm ci` — чиста установка залежностей
2. `npx tsc --noEmit` — перевірка TypeScript без генерації файлів
3. `npm run build` — повноцінна збірка Next.js

## Частина 4. Деплой на Vercel

- **GitHub:** https://github.com/anastasiakvk/eco-monitor
- **Production:** https://eco-monitor-iota.vercel.app
- **Node.js:** 20.x
- Production deploy — при push до `main`
- Preview deploy — для кожного pull request

## Контрольні питання

### 1. Які Core Web Vitals найкритичніші для додатків з візуалізацією?

LCP (Largest Contentful Paint) і TBT (Total Blocking Time). Leaflet і Recharts завантажені синхронно блокують відображення карти та збільшують TBT. CLS важливий, якщо карта зсуває контент після завантаження.

### 2. Як dynamic import впливає на початкове завантаження?

Виключає компонент із початкового JS-bundle. Recharts (≈140 KB) і Leaflet (≈45 KB) не блокують перший рендер — браузер спочатку відображає HTML, бібліотеки завантажуються за потребою.

### 3. Переваги CI/CD над ручним деплоєм?

Автоматична перевірка TypeScript при кожному push — якщо збірка зламана, деплой не відбудеться. Preview-деплої дозволяють перевірити зміни до злиття в main. Немає людського фактору і помилок від пропущених кроків.

### 4. Організація змінних оточення?

`.env.local` для локальної розробки (не комітити). `NEXT_PUBLIC_` змінні доступні на клієнті — секрети туди не класти. Для Vercel секрети задаються через інтерфейс платформи. `.env.example` без значень — для документування.

### 5. Стратегії кешування для екологічних даних?

`/_next/static/` — `max-age=31536000, immutable` (файли з хешем ніколи не застарівають). `/api/` — `max-age=60, stale-while-revalidate=300` (відповідь із кешу + фонове оновлення). ISR з `revalidate` для сторінок зі зведеною статистикою.

## Висновки

Застосовано lazy loading для Recharts і Leaflet через `next/dynamic`. Налаштовано кешування статики (1 рік) і API (60 с + SWR). Увімкнено `optimizePackageImports` та gzip. Створено GitHub Actions CI з перевіркою TypeScript і збіркою. Проєкт задеплоєно на Vercel з автоматичними production та preview деплоями.
