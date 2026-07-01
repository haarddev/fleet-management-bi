# Fleet Management BI

A bilingual business intelligence dashboard for fleet operations. The app covers revenue, maintenance, daily operations, idle analysis, and management reporting, with English and Hebrew (RTL) support.

## Features

| Module | Screens |
|--------|---------|
| **Revenue** | Weekly Center, Vehicle Revenue, Customer Revenue, Driver Revenue |
| **Maintenance** | Vehicle Inventory, Disabled Vehicles, Downtime, Agreements, Expenses, Relocations |
| **Management** | Activity Log |
| **Operation** | Daily Status, Work Schedule |
| **Idle Management** | Vehicle Idle Analysis, Driver Idle Analysis |

### Highlights

- JWT authentication with protected API routes
- Global filters (period, area, search) applied across data tables
- Advanced filters on selected modules (vehicle revenue, inventory, activity log)
- Drill-down panels for revenue, idle analysis, and related views
- CSV export from table toolbars
- Date-range filters on idle analysis (start/end, retrieve, swap)
- Responsive layout with sidebar navigation and KPI cards

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, i18next |
| **Backend** | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| **Auth** | JWT (Bearer token), bcrypt password hashing |

## Project structure

```
Fleet-management-BI/
├── backend/
│   ├── migrations/          # SQL migrations + seed data
│   ├── prisma/              # Prisma schema
│   ├── scripts/             # DB migration runner
│   └── src/
│       ├── data/mock/       # Fallback mock data
│       ├── repositories/    # Data access (biRepository)
│       └── routes/          # API route handlers
├── frontend/
│   └── src/
│       ├── api/             # HTTP client
│       ├── components/      # UI components
│       ├── context/         # Auth & app state
│       ├── hooks/           # Shared hooks
│       ├── i18n/            # en / he translations
│       ├── lib/             # Filters, export, utilities
│       └── pages/           # Route pages by module
└── README.md
```

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 14+
- **npm** (comes with Node.js)

## Getting started

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE fleet_management_bi;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials and a secure `JWT_SECRET`.

```bash
npm install
npm run db:migrate
npm run dev
```

The API runs at **http://localhost:3000**.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs at **http://localhost:5173**. Vite proxies `/api` to the backend in development.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret for signing tokens | — |
| `JWT_EXPIRES_IN` | Token lifetime | `8h` |

See `backend/.env.example` for the full list.

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API base path or URL | `/api` |
| `VITE_API_PROXY_TARGET` | Backend URL for dev proxy | `http://localhost:3000` |
| `VITE_DEV_PORT` | Vite dev server port | `5173` |
| `VITE_DEFAULT_LANGUAGE` | Default UI language (`en` / `he`) | `en` |
| `VITE_AUTH_TOKEN_KEY` | localStorage key for JWT | `fleet-bi-token` |

See `frontend/.env.example` for the full list.

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run build` | Generate Prisma client and compile TypeScript |
| `npm start` | Run compiled production server |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint |

## Data & mock fallbacks

- Most modules read from PostgreSQL via Prisma (`biRepository.ts`).
- Some operation endpoints (e.g. daily status, downtime) use mock data directly.
- Idle analysis and a few other modules fall back to mock rows when the database returns no results, so the UI remains usable during development.

## Internationalization

- Languages: **English** and **Hebrew**
- Translation files: `frontend/src/i18n/locales/en.json`, `he.json`
- Hebrew enables RTL layout (sidebar and drill-down panels adjust accordingly).

## Production notes

1. Build the frontend: `cd frontend && npm run build` → output in `frontend/dist/`
2. Build the backend: `cd backend && npm run build`
3. Set `VITE_API_BASE_URL` to your production API URL before building the frontend.
4. Serve the frontend static files and run the backend with `NODE_ENV=production`.
5. Use strong values for `JWT_SECRET` and database credentials.

## License

Private — internal use.
