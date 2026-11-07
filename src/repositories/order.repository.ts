import { prisma } from "@/lib/prisma";
import { OrderStatus, Provider, MailboxStatus, Role } from "@prisma/client";

export interface CreateOrderData {
  userId: string;
  domain: string;
  provider: Provider;
  mailboxCount: number;
  idempotencyKey?: string;
}

export const orderRepository = {
  async createWithMailboxes(data: CreateOrderData) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          domain: data.domain,
          provider: data.provider,
          mailboxCount: data.mailboxCount,
          idempotencyKey: data.idempotencyKey,
          status: "PENDING",
        },
      });
      await tx.mailbox.createMany({
        data: Array.from({ length: data.mailboxCount }, (_, i) => ({
          orderId: order.id,
          index: i,
          status: "PENDING",
        })),
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: "PENDING",
          actorId: data.userId,
          actorRole: "CUSTOMER" as Role,
          reason: "Order created",
        },
      });
      return tx.order.findUnique({
        where: { id: order.id },
        include: { mailboxes: { orderBy: { index: "asc" } }, history: { orderBy: { createdAt: "asc" } } },
      });
    });
  },

  async findByIdempotencyKey(key: string) {
    return prisma.order.findUnique({
      where: { idempotencyKey: key },
      include: { mailboxes: { orderBy: { index: "asc" } }, history: { orderBy: { createdAt: "asc" } } },
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        mailboxes: { orderBy: { index: "asc" } },
        history: { orderBy: { createdAt: "asc" } },
        user: { select: { id: true, email: true, role: true } },
      },
    });
  },

  async listByUser(userId: string, filters?: { status?: OrderStatus; provider?: Provider }) {
    return prisma.order.findMany({
      where: { userId, status: filters?.status, provider: filters?.provider },
      include: { mailboxes: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async listAll(filters?: { status?: OrderStatus; provider?: Provider }, page = 1, pageSize = 20) {
    const where = { status: filters?.status, provider: filters?.provider };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { mailboxes: true, user: { select: { id: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  async claimForProcessing(id: string): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "PROVISIONING" },
      });
      if (res.count !== 1) return false;
      await tx.orderStatusHistory.create({
        data: { orderId: id, fromStatus: "PENDING", toStatus: "PROVISIONING", actorRole: null, reason: "Worker claimed order" },
      });
      return true;
    });
  },

  async transition(id: string, from: OrderStatus, to: OrderStatus, actor?: { id?: string; role?: Role }, reason?: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id, status: from },
        data: { status: to },
      });
      if (updated.count !== 1) return null;
      await tx.orderStatusHistory.create({
        data: { orderId: id, fromStatus: from, toStatus: to, actorId: actor?.id ?? null, actorRole: actor?.role ?? null, reason },
      });
      return tx.order.findUnique({ where: { id } });
    });
  },

  async updateMailboxStatus(id: string, status: MailboxStatus, error?: string | null) {
    return prisma.mailbox.update({ where: { id }, data: { status, error: error ?? null } });
  },

  async resetFailedMailboxes(orderId: string) {
    await prisma.mailbox.updateMany({
      where: { orderId, status: { in: ["FAILED", "PROVISIONING"] } },
      data: { status: "PENDING", error: null },
    });
  },
};
