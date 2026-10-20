# Cherif Voyages

Bilingual (FR / AR) travel agency web app for **Cherif Voyages** — flights, hotels, Omra/Hajj packages, customer accounts, and agency back-office. Built with **Next.js 16**, **PostgreSQL**, and **Prisma**.

All application code lives in the [`app/`](app/) directory.

## Quick start

```bash
cd app
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000/fr](http://localhost:3000/fr).

## Environment

Configure `app/.env` (see `app/.env.example`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DUFFEL_API_KEY` | Optional — Duffel sandbox/live token for flight search and hold orders |

After changing the schema, run `npx prisma migrate deploy` from `app/`.

## Features

- **Public site** — Search hub (flights, hotels, Omra/Hajj, cars, visa), package catalogue, flight results (Duffel), booking and inquiry flows
- **Customer account** (`/account`) — Trips, bookings, Omra progress, travelers, price alerts, messages
- **Admin** (`/admin`) — KPIs, bookings, groups, payments, CRM, package catalogue editor

Seed admin (change before production): `admin@cherifvoyages.mr` / `ChangeMe123!`

## Scripts (from `app/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run db:seed` | Seed packages and admin user |
| `npm run lint` | ESLint |

## Deploy

1. Set `DATABASE_URL` and optional `DUFFEL_API_KEY` on the host.
2. Build with root directory **`app`** (or run commands from `app/`).
3. Run migrations: `npx prisma migrate deploy`.
4. Rotate the seeded admin password.

## Repository layout

```
app/          Next.js application (only tracked product code)
README.md     This file
```
