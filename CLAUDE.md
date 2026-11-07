# Mailbox Order Manager

## Stack
Next.js 14 (App Router, TypeScript) + PostgreSQL (Prisma) + Tailwind.

## Commands
- `npm run dev` - start app
- `npm run worker` - start background worker
- `npm run build` - production build
- `npm run test` - run tests
- `npm run db:migrate` - run migrations
- `npm run db:seed` - seed users
- `docker compose up -d` - start Postgres

## Architecture
Layered: route handlers -> services -> repositories -> Prisma. Business logic lives in `src/services` and `src/domain`. Route handlers are thin.

## Key files
- `src/domain/order-state.ts` - state machine
- `src/domain/providers/` - provider strategy
- `src/services/order.service.ts` - order business logic + worker processing
- `src/worker/index.ts` - polling worker
