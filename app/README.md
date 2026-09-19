This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Backend setup

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — a Postgres connection string. Then run:
  ```bash
  npx prisma migrate deploy   # applies the schema
  npm run db:seed             # loads the 3 Omra/Hajj packages
  ```
  This is what backs the home page's package cards, the package detail
  pages, and both booking flows (packages and flights). Hotels are still
  static mock content (`src/messages/*.json`) — not wired to a backend yet.

- `DUFFEL_API_KEY` — a test/sandbox token from [duffel.com](https://duffel.com)
  (Developers → Access tokens). Powers real flight search (`/flights`) and
  booking (`POST /api/bookings/flight`, which creates a Duffel **hold**
  order — seats reserved, payment settled with Duffel separately, since
  Bankily/Masrvi/bank transfer aren't things Duffel can charge directly).
  Without a key, `/flights` shows a "not configured" message and the rest
  of the site works normally. This integration has never made a live call
  in development — verify it against a real sandbox token before relying
  on it, and check Duffel's current `Duffel-Version` header value in their
  docs (it changes over time; see `src/lib/duffel.ts`).

- `MRU_PER_EUR` in `src/lib/currency.ts` is a hardcoded placeholder exchange
  rate (Duffel doesn't settle in MRU) — replace with a real FX source
  before relying on displayed MRU prices.

## Accounts & the two dashboards

- **Customer account** (`/account`) — sign up at `/account/login` with any
  email/password. Signing up with the same email used in an earlier guest
  booking (flight or package checkout) links that booking to the new
  account automatically, since both resolve to the same `Customer` row by
  email. Covers all 6 tabs from the design: trips, booking history, Omra
  group progress, travelers & passport-expiry warnings, price alerts
  (created from the "Alerte prix" button on `/flights`), and a message
  thread with the agency.

- **Agency back-office** (`/admin`) — `npm run db:seed` creates one admin
  account: `admin@cherifvoyages.mr` / `ChangeMe123!`. **Change this
  password before deploying anywhere real** (there's no self-service admin
  signup by design — create further staff accounts directly in the
  database). Covers KPIs computed from real booking data, a bookings table
  with a working "mark as paid / confirm" reconciliation action (this is
  the piece that actually moves a `Payment` from `PENDING` to `PAID`),
  Omra/Hajj group rosters, a payments ledger, a customer list, and a
  package-catalogue editor.

  Both dashboards' data is 100% real — no fabricated agent-performance
  stats or a fake visa pipeline, because we have no data model backing
  those. If you want them, that's new schema, not a UI tweak.

- Sessions are custom (scrypt-hashed passwords, a `Session` table, httpOnly
  cookies) — no NextAuth/Clerk/etc. Customer and admin sessions use
  separate cookies, so a browser can be signed into both at once; the main
  site header always reflects the *customer* session regardless of
  whether an admin session is also active.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
