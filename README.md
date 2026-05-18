# EcoMonitor — Звіти з лабораторних робіт

**Студентка:** Карачун Анастасія Володимирівна, група ТР-33  
**Дисципліна:** Веб-орієнтована розробка системи екологічного моніторингу  

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

`app/` — сторінки та API маршрути Next.js App Router

`data/`— серверні API endpoints

`lib/`— TypeScript інтерфейси та типи

`types/` — тестові дані для станцій та вимірювань

`components/ ` — перевикористовувані компоненти

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
На головній сторінці відображається список 6 моніторингових станцій з поточними показниками PM2.5, NO2, AQI та рівнем забруднення. Також відображається таблиця поточних вимірювань по всіх станціях.
<img width="943" height="510" alt="image" src="https://github.com/user-attachments/assets/b8fd5620-1d80-4518-b5f7-e6eb48d3eeb6" />

<img width="974" height="525" alt="image" src="https://github.com/user-attachments/assets/07635815-3887-4a6d-8806-59467b5cb988" />


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
Сторінка відображає поточні показники станції, середні значення за 30 днів, загальну інформацію та таблицю вимірювань.

<img width="974" height="521" alt="image" src="https://github.com/user-attachments/assets/671b8484-115a-4795-8003-f0b94faa3486" />

<img width="974" height="533" alt="image" src="https://github.com/user-attachments/assets/564781b0-5edd-4163-be89-68094d0aa148" />



### SSG

Сторінки `app/about/page.tsx` і `app/pollutants/page.tsx` є статичними (`export const revalidate = false`). 

Статична сторінка "Про проєкт" (`app/about/page.tsx`) — SSG:

```typescript
export const revalidate = false;

export default function AboutPage() {
  // статичний контент...
}
```

<img width="974" height="213" alt="image" src="https://github.com/user-attachments/assets/7b7cdb83-2532-4460-bc33-34eefb898a41" />

Статична сторінка "Довідник забруднювачів" (`app/pollutants/page.tsx`) — SSG:
Містить таблицю з описом 6 забруднювачів: PM2.5, PM10, NO2, SO2, CO, O3 з нормами концентрації згідно стандартів ВОЗ.

<img width="974" height="411" alt="image" src="https://github.com/user-attachments/assets/48d9424c-a93c-4ccd-a372-6edf8fc1e0db" />


## Тестові дані

Створено 6 моніторингових станцій у `data/stations.ts`:
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

<img width="821" height="987" alt="image" src="https://github.com/user-attachments/assets/44985bed-aa87-4e99-b9bc-0db0212d90d9" />


### GET /api/stations/:id

Повертає деталі станції, останнє вимірювання та середні значення за 30 днів.

<img width="960" height="1518" alt="image" src="https://github.com/user-attachments/assets/62d9d470-5bfd-496d-873b-b6cbc2bae6ca" />

### GET /api/measurements

Фільтрація за `stationId`, діапазоном дат, пагінація і сортування.

<img width="974" height="1285" alt="image" src="https://github.com/user-attachments/assets/639b972b-302b-419f-884a-8ff6f1a77eb9" />

### GET /api/current

Поточні показники для всіх активних станцій.

<img width="974" height="1219" alt="image" src="https://github.com/user-attachments/assets/bc483ae3-fd02-4d94-8a60-a6358cce3317" />


## Висновки

В ході виконання лабораторної роботи було створено веб-додаток для моніторингу якості повітря на Next.js 15 з TypeScript.
Практично освоєно:
•	створення Next.js проєкту та налаштування TypeScript з строгою перевіркою типів
•	розробку TypeScript інтерфейсів та enum для структурованого опису екологічних даних
•	реалізацію SSR для динамічних сторінок через async компоненти
•	реалізацію SSG для статичних інформаційних сторінок
•	динамічний роутинг з параметрами [id] та асинхронні params у Next.js 15
•	розробку 4 API endpoints з валідацією, фільтрацією, пагінацією та обробкою помилок
•	генерацію тестових даних для 6 станцій з часовими рядами за 30 днів
Використання TypeScript значно підвищило надійність коду — всі помилки типів виявлялись на етапі розробки. Система демонструє правильне застосування різних стратегій рендерингу залежно від характеру даних.

---

# Лабораторна робота №2

**Тема:** Інтеграція інтерактивної карти та графіків

**Мета роботи:** Навчитися інтегрувати картографічні бібліотеки та інструменти візуалізації для створення інтерактивного інтерфейсу відображення екологічних даних.

## Для реалізації карти обрано бібліотеку Leaflet.js разом з обгорткою react-leaflet для зручної інтеграції з React. Встановлення виконано командою

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

При інтеграції Leaflet у Next.js виникає проблема — бібліотека використовує об'єкт window, який не існує на сервері. Тому компонент карти підключається виключно на клієнті через dynamic import з параметром `ssr`:

```typescript
false:
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

```

Компонент `components/Map.tsx` позначений директивою `"use client"` і не виконується на сервері.

### Компонент карти^

Карта відцентрована на координатах України (49.0, 31.0) з початковим масштабом 6. Як підкладку використано тайли OpenStreetMap.

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

### Спливаючі вікна (Popup)

При кліку на маркер відображається Popup з назвою станції, містом, значеннями AQI, PM2.5, NO2 та рівнем забруднення.

<img width="567" height="475" alt="image" src="https://github.com/user-attachments/assets/ceae0745-4753-4840-8fd3-ca35659e6212" />

<img width="624" height="371" alt="image" src="https://github.com/user-attachments/assets/55511ccc-2d79-4656-88dc-a419760331fb" />


## Частина 2. Графіки (components/Charts.tsx)

### Лінійний графік

Відображає зміну показників AQI, PM2.5 та NO2 за останні 14 днів. Кожен показник — окрема лінія свого кольору. При наведенні курсора з'являється підказка з точними значеннями.

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
<img width="902" height="337" alt="image" src="https://github.com/user-attachments/assets/310c45d0-2ed6-42e5-9663-d5f5943564d0" />


### Стовпчикова діаграма

Порівнює показники PM2.5, PM10 та NO2 за останні 7 днів. Кожен день — група з трьох стовпців різного кольору. Компонент Tooltip відображає точні значення при наведенні.

```tsx
<BarChart data={barData}>
  <Bar dataKey="PM2.5" fill="#2d6a2d" />
  <Bar dataKey="PM10"  fill="#b8860b" />
  <Bar dataKey="NO2"   fill="#185FA5" />
</BarChart>
```

<img width="901" height="183" alt="image" src="https://github.com/user-attachments/assets/6ae076be-c607-40b2-a3cb-c2d8e8eadffc" />


### Кругова діаграма

Відображає структуру забруднення в поточний момент — частку кожного забруднювача відносно загального. Використовує поточні значення PM2.5, PM10, NO2, SO2, CO, O3.

```tsx
<PieChart>
  <Pie data={pieData} dataKey="value" nameKey="name"
    cx="50%" cy="50%" outerRadius={80} label>
    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
  </Pie>
  <Tooltip /><Legend />
</PieChart>
```

<img width="907" height="253" alt="image" src="https://github.com/user-attachments/assets/0552f8ea-d270-41f9-969c-7c5780f4aea4" />


## Частина 3. Інтеграція карти та графіків

Сторінка `app/map/page.tsx` — клієнтський компонент (`"use client"`).

### Стан компонента

```typescript
const [selectedId, setSelectedId] = useState<string | null>(null);
const [measurements, setMeasurements] = useState<any[]>([]);
```
Змінна `selectedId` зберігає ID обраної станції і передається одночасно в компонент карти (для виділення маркера) та використовується

### Завантаження даних

При зміні `selectedId` автоматично виконується `fetch` вимірювань обраної станції

```typescript
useEffect(() => {
  if (!selectedId) return;
  fetch(`/api/measurements?stationId=${selectedId}&limit=30`)
    .then(r => r.json())
    .then(d => setMeasurements(d.data));
}, [selectedId]);
```

### Layout сторінки

Layout сторінки розділений на дві колонки через CSS Grid. На мобільних — одна колонка.

```css
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
@media(max-width: 700px) {
  .layout { grid-template-columns: 1fr; }
}
```
### Список станцій

Під картою розміщено список всіх станцій з кольоровою крапкою (відповідає кольору маркера), назвою, містом та поточним AQI. Клік на елемент списку — те саме що клік на маркер карти.

### Скидання вибору

Реалізовано кнопку "Скинути вибір" яка обнуляє `selectedId` та очищує масив вимірювань

```typescript
onClick={() => { setSelectedId(null); setMeasurements([]); }}
```

<img width="1878" height="977" alt="image" src="https://github.com/user-attachments/assets/499fdc46-dcb2-4233-a462-3756fec62b57" />


## Висновки

В ході виконання лабораторної роботи проєкт eco-monitor доповнено інтерактивною картою та візуалізацією даних.
Практично освоєно:
•	інтеграцію Leaflet.js у Next.js з вирішенням проблеми SSR через dynamic import
•	створення кастомних маркерів з кольоровим кодуванням за рівнем AQI
•	реалізацію трьох типів графіків через Recharts — лінійний, стовпчиковий, круговий
•	синхронізацію компонентів карти і графіків через спільний стан
•	адаптивний layout з двома колонками через CSS Grid
•	клієнтське завантаження даних через useEffect і fetch
Реалізована функціональність дозволяє наочно відстежувати екологічну ситуацію — вибір станції на карті автоматично відображає її графіки із часовою динамікою показників.


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

Система складається з трьох частин — клієнтська частина відправляє події, серверна частина приймає і зберігає їх, панель аналітики відображає статистику.
Створено файл `lib/analytics.ts` з використанням глобальної змінної для зберігання подій між запитами:

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

### Збереження даних у файл

Кожна аналітична подія зберігається у файл `analytics-log.json` в корені проєкту через модуль `fs`:

```typescript
function saveToFile(event: object) {
  let existing: object[] = [];
  if (fs.existsSync(LOG_FILE)) {
    const raw = fs.readFileSync(LOG_FILE, "utf-8");
    existing = JSON.parse(raw);
  }
  existing.push(event);
  fs.writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));
}

```

### Панель аналітики — app/analytics/page.tsx

Відображає: загальну кількість подій, перегляди кожної сторінки, типи подій та їх кількість, кількість збережених подій у файлі.

<img width="329" height="496" alt="image" src="https://github.com/user-attachments/assets/8b6145cf-2400-4618-8bba-cefde9e3164e" />

<img width="284" height="575" alt="image" src="https://github.com/user-attachments/assets/0fe556bf-acce-4ce1-a998-775de61e7d38" />


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

<img width="974" height="398" alt="image" src="https://github.com/user-attachments/assets/cf074a25-ac18-4388-a89c-7f1516e39fdb" />


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

<img width="778" height="262" alt="image" src="https://github.com/user-attachments/assets/60d18bdd-e94a-413a-971b-f5160dc9f408" />

### Error Boundary (app/error.tsx)

Клієнтський компонент який перехоплює помилки React і відображає зрозуміле повідомлення. При виникненні помилки автоматично відправляє подію в систему аналітики:

```typescript
export default function Error({ error, reset }) {
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({
        event: "error",
        message: error.message,
      }),
    });
  }, [error]);


}
```

```css
  return (
    <div>
      <div style={{ fontSize: 64, color: "#cc5500" }}>500</div>
      <h1>Щось пішло не так</h1>
      <button onClick={reset}>Спробувати знову</button>
    </div>
  );
}
```
### Обробка помилок в API

У всіх API `endpoints` реалізовано `try/catch` з поверненням правильного HTTP статус коду

```typescript
} catch (err) {
  logger.error({ error: err }, "Помилка");
  return NextResponse.json(
    { error: "Internal Server Error", message: "Помилка сервера" },
    { status: 500 }
  );
}

```
## Висновки

В ході виконання лабораторної роботи проєкт eco-monitor доповнено системами логування, аналітики та обробки помилок.
Практично освоєно:
•	структуроване логування через pino з різними рівнями — info, warn, error
•	автоматичне логування API запитів через Next.js Middleware
•	реалізацію власної системи аналітики без зовнішніх залежностей
•	збереження аналітичних подій у файл через модуль fs
•	відстеження переглядів сторінок через usePathname і useEffect
•	реалізацію Error Boundary для перехоплення помилок React компонентів
•	кастомні сторінки 404 і 500 через файли not-found.tsx і error.tsx
Реалізована система логування дозволяє відстежувати роботу додатку в реальному часі, а аналітика — розуміти поведінку користувачів без передачі даних зовнішнім сервісам

---

# Лабораторна робота №4

**Тема:** Аудит продуктивності, оптимізація та деплой

**Мета:** навчитися проводити аудит продуктивності веб-додатку, застосовувати методи оптимізації та налаштовувати автоматизований деплой у продакшн-середовище.

## Частина 1. Аудит продуктивності

Аудит виконано інструментом Lighthouse у режимі інкогніто для двох сторінок: головної (`/`) та сторінки карти (`/map`).

### Показники до оптимізації

Головна сторінка:

<img width="689" height="519" alt="image" src="https://github.com/user-attachments/assets/91decc59-3e18-433a-bc47-395d12947232" />

<img width="607" height="395" alt="image" src="https://github.com/user-attachments/assets/9ba3f706-9467-4a64-9e1a-a583949f230c" />

Сторінка станції:

<img width="553" height="418" alt="image" src="https://github.com/user-attachments/assets/1341a5f4-f5e3-4d93-8613-f57367d8c8ae" />

<img width="612" height="402" alt="image" src="https://github.com/user-attachments/assets/fb09fdcf-b7e0-4452-bcb5-9b97b7191bcc" />


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
## Показники після оптимізації

Головна сторінка:

<img width="964" height="1256" alt="image" src="https://github.com/user-attachments/assets/24cc7ba8-41e4-48e9-b442-8aaf38be3296" />

<img width="927" height="866" alt="image" src="https://github.com/user-attachments/assets/f965417e-328a-4121-9734-f9da6cd07163" />


Сторінка станції:

<img width="959" height="1152" alt="image" src="https://github.com/user-attachments/assets/b38795e8-3f02-4d6f-8d39-f538b334e3d1" />

<img width="970" height="711" alt="image" src="https://github.com/user-attachments/assets/d6f116a1-c828-4bb8-94ac-bc8fee776084" />



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
- **Production:** https://eco-monitor-iota.vercel.app](https://eco-monitor-jet.vercel.app/
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
