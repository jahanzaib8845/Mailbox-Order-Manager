import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { orderService } from "@/services/order.service";
import { errorResponse } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const order = await orderService.get(params.id, user.id, user.role);
    return NextResponse.json({ order });
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}
