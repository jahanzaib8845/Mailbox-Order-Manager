# Architecture

## Design patterns

### State Machine
- Location: `src/domain/order-state.ts`
- Why: centralizes allowed order status transitions (PENDING -> PROVISIONING -> ACTIVE/FAILED, FAILED -> PENDING) and rejects invalid ones.
- Alternative rejected: scattering transition checks across services.

### Strategy (Provider Abstraction)
- Location: `src/domain/providers/` (types.ts, mock.ts, factory.ts)
- Why: Google and Microsoft provisioning behind a common `MailboxProvider` interface; factory selects implementation by provider enum.
- Alternative rejected: switch statements inside the worker.

### Repository + Service Layer
- Location: `src/repositories/`, `src/services/`
- Why: route handlers stay thin; data access isolated from business logic; testable.
- Alternative rejected: Prisma calls directly in route handlers.

### Queue + Worker
- Location: `src/worker/index.ts`, `orderRepository.claimForProcessing`
- Why: background polling worker claims orders atomically (PENDING -> PROVISIONING) so running twice never processes the same order.
- Alternative rejected: in-process setTimeout per order (lost on restart).

### Idempotency
- Location: `order.service.create` + unique `idempotencyKey` on Order
- Why: duplicate requests return the existing order.

## Data model
User, Order, Mailbox, OrderStatusHistory. See `prisma/schema.prisma`.
