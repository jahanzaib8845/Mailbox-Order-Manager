import { z } from "zod";

export const createOrderSchema = z.object({
  domain: z.string().min(1).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  provider: z.enum(["GOOGLE", "MICROSOFT"]),
  mailboxCount: z.number().int().min(1).max(50),
  idempotencyKey: z.string().optional(),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(["PENDING", "PROVISIONING", "ACTIVE", "FAILED"]).optional(),
  provider: z.enum(["GOOGLE", "MICROSOFT"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
