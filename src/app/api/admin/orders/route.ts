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
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const url = new URL(req.url);
    const parsed = listOrdersQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    const result = await orderService.listAll(
      { status: parsed.data.status as OrderStatus | undefined, provider: parsed.data.provider as Provider | undefined },
      parsed.data.page,
      parsed.data.pageSize
    );
    return NextResponse.json(result);
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}
