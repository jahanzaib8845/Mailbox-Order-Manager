import { orderRepository } from "@/repositories/order.repository";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/domain/providers/factory";
import { assertTransition } from "@/domain/order-state";
import { AppError } from "@/lib/errors";
import { Provider, OrderStatus, Role } from "@prisma/client";
import { createOrderSchema } from "@/validators/order.validator";

export const orderService = {
  async create(userId: string, input: unknown, idempotencyKey?: string) {
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) throw new AppError(400, "Invalid input", "VALIDATION_ERROR");
    const { domain, provider, mailboxCount } = parsed.data;
    const key = idempotencyKey ?? parsed.data.idempotencyKey;

    if (key) {
      const existing = await orderRepository.findByIdempotencyKey(key);
      if (existing) return existing;
    }

    return orderRepository.createWithMailboxes({
      userId,
      domain,
      provider: provider as Provider,
      mailboxCount,
      idempotencyKey: key,
    });
  },

  async get(orderId: string, userId: string, role: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError(404, "Order not found");
    if (role !== "ADMIN" && order.userId !== userId) throw new AppError(403, "Forbidden");
    return order;
  },

  async listForUser(userId: string, filters?: { status?: OrderStatus; provider?: Provider }) {
    return orderRepository.listByUser(userId, filters);
  },

  async listAll(filters?: { status?: OrderStatus; provider?: Provider }, page = 1, pageSize = 20) {
    return orderRepository.listAll(filters, page, pageSize);
  },

  async retry(orderId: string, actor: { id: string; role: string }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError(404, "Order not found");
    if (order.status !== "FAILED") throw new AppError(400, "Only failed orders can be retried");
    assertTransition("FAILED", "PENDING");
    await orderRepository.resetFailedMailboxes(orderId);
    const updated = await orderRepository.transition(orderId, "FAILED", "PENDING", { id: actor.id, role: actor.role as Role }, "Retry by admin");
    if (!updated) throw new AppError(409, "Retry failed");
    return orderRepository.findById(orderId);
  },
};

export async function processOrder(orderId: string) {
  const claimed = await orderRepository.claimForProcessing(orderId);
  if (!claimed) return;

  const order = await orderRepository.findById(orderId);
  if (!order) return;

  const pending = order.mailboxes.filter((m) => m.status === "PENDING");
  if (pending.length === 0) {
    // nothing to do; mark active if all active
    const all = await prisma.mailbox.findMany({ where: { orderId } });
    if (all.every((m) => m.status === "ACTIVE")) {
      await orderRepository.transition(orderId, "PROVISIONING", "ACTIVE", undefined, "No pending mailboxes");
    }
    return;
  }

  await Promise.all(pending.map((m) => orderRepository.updateMailboxStatus(m.id, "PROVISIONING")));

  const provider = getProvider(order.provider);
  const results = await provider.provision({
    orderId: order.id,
    domain: order.domain,
    mailboxes: pending.map((m) => ({ index: m.index })),
  });

  for (const r of results) {
    const mb = pending.find((m) => m.index === r.index);
    if (mb) {
      await orderRepository.updateMailboxStatus(mb.id, r.status, r.error ?? null);
    }
  }

  const updatedMailboxes = await prisma.mailbox.findMany({ where: { orderId } });
  const anyFailed = updatedMailboxes.some((m) => m.status === "FAILED");
  const allActive = updatedMailboxes.every((m) => m.status === "ACTIVE");

  if (allActive) {
    await orderRepository.transition(orderId, "PROVISIONING", "ACTIVE", undefined, "All mailboxes provisioned");
  } else if (anyFailed) {
    await orderRepository.transition(orderId, "PROVISIONING", "FAILED", undefined, "Provisioning failed");
  }
}
