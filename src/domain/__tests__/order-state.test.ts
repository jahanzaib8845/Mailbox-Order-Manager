import { describe, it, expect } from "vitest";
import { canTransition, assertTransition } from "../order-state";

describe("order state machine", () => {
  it("allows valid transitions", () => {
    expect(canTransition("PENDING", "PROVISIONING")).toBe(true);
    expect(canTransition("PROVISIONING", "ACTIVE")).toBe(true);
    expect(canTransition("PROVISIONING", "FAILED")).toBe(true);
    expect(canTransition("FAILED", "PENDING")).toBe(true);
  });
  it("rejects invalid transitions", () => {
    expect(canTransition("PENDING", "ACTIVE")).toBe(false);
    expect(canTransition("ACTIVE", "PENDING")).toBe(false);
    expect(() => assertTransition("ACTIVE", "FAILED")).toThrow();
  });
});
