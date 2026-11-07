import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { orderService } from "@/services/order.service";
import bcrypt from "bcryptjs";

let userId: string;

beforeAll(async () => {
  const u = await prisma.user.create({
    data: { email: `test-${Date.now()}@example.com`, passwordHash: await bcrypt.hash("x", 10), role: "CUSTOMER" },
  });
  userId = u.id;
});

afterAll(async () => {
  await prisma.order.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

describe("order creation", () => {
  it("creates an order with mailboxes", async () => {
    const order = await orderService.create(userId, { domain: "test.com", provider: "GOOGLE", mailboxCount: 2 });
    expect(order).toBeTruthy();
    expect(order!.mailboxCount).toBe(2);
    expect(order!.mailboxes.length).toBe(2);
    expect(order!.status).toBe("PENDING");
  });

  it("is idempotent with key", async () => {
    const key = `idem-${Date.now()}`;
    const o1 = await orderService.create(userId, { domain: "idem.com", provider: "MICROSOFT", mailboxCount: 1, idempotencyKey: key });
    const o2 = await orderService.create(userId, { domain: "idem.com", provider: "MICROSOFT", mailboxCount: 1, idempotencyKey: key });
    expect(o1!.id).toBe(o2!.id);
  });
});
