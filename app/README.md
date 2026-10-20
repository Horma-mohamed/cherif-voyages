# Cherif Voyages — Next.js app

Setup and deployment instructions are in the [repository README](../README.md).

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```
