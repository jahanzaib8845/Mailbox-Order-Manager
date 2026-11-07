# AI Worklog

## Planning approach
Planned schema and layered architecture first, then domain (state machine, providers), repositories/services, API routes, UI, tests, docs.

## Key prompts
1. Scaffold Next.js + Prisma + Postgres with docker-compose and seed users.
2. Implement order state machine and provider strategy with mocked providers.
3. Implement idempotent order creation and atomic worker claim.
4. Build customer/admin screens with filters, pagination, retry.
5. Add unit + integration tests and documentation.

## Times Claude Code was wrong
1. `create-next-app` latest required Node >=20; switched to v14 to match Node 18.
2. Provider provision signature initially assumed contiguous mailbox indices; changed to accept explicit mailbox list for correct retry handling.
3. Order history missed PENDING->PROVISIONING transition because claim bypassed service; fixed by recording history inside claim transaction.

## Changed by hand
- Adjusted TypeScript types to remove `any`.
- Fixed audit log transition recording.
- Tuned worker polling and claim logic.

## Time per phase (approx)
- Scaffold + DB: 30m
- Domain + services: 45m
- API + UI: 60m
- Tests: 20m
- Docs + polish: 20m
- Total: ~2.75h
