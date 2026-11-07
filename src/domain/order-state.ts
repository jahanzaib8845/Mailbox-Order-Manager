import { OrderStatus } from "@prisma/client";

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROVISIONING"],
  PROVISIONING: ["ACTIVE", "FAILED"],
  ACTIVE: [],
  FAILED: ["PENDING"],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} -> ${to}`);
  }
}

export const TERMINAL_STATUSES: OrderStatus[] = ["ACTIVE", "FAILED"];
