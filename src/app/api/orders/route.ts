import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { orderService } from "@/services/order.service";
import { listOrdersQuerySchema } from "@/validators/order.validator";
import { OrderStatus, Provider } from "@prisma/client";
import { errorResponse } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const parsed = listOrdersQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    const orders = await orderService.listForUser(user.id, {
      status: parsed.data.status as OrderStatus | undefined,
      provider: parsed.data.provider as Provider | undefined,
    });
    return NextResponse.json({ orders });
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "CUSTOMER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const idempotencyKey = req.headers.get("idempotency-key") || body?.idempotencyKey;
    const order = await orderService.create(user.id, body, idempotencyKey ?? undefined);
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}
