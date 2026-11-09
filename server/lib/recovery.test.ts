import { describe, expect, it } from "vitest";

import { baseline, simulate } from "./recovery";

describe("synthetic recovery engine", () => {
  it("reproduces an ambiguous payment capture and deterministically returns the same trace", () => {
    const result = simulate("payment_timeout", baseline);
    expect(result).toEqual(simulate("payment_timeout", baseline));
    expect(result.success).toBe(false);
    expect(result.captures).toBe(1);
    expect(
      result.events.find((e) => e.step === "Capture payment")?.detail,
    ).toContain("ambiguous");
  });
  it("detects a duplicate if an ambiguous capture is retried without idempotency", () => {
    const result = simulate("payment_timeout", {
      ...baseline,
      retryCount: 1,
      timeoutMs: 3000,
    });
    expect(result.success).toBe(false);
    expect(result.duplicateCaptures).toBe(1);
  });
  it("recovers the timeout with exactly one capture when retries reuse an idempotency key", () => {
    const result = simulate("payment_timeout", {
      ...baseline,
      retryCount: 1,
      timeoutMs: 3000,
      idempotency: true,
    });
    expect(result.success).toBe(true);
    expect(result.captures).toBe(1);
    expect(result.duplicateCaptures).toBe(0);
  });
  it("requires a safe inventory policy to recover a shortage", () => {
    const before = simulate("inventory_shortage", baseline);
    const after = simulate("inventory_shortage", {
      ...baseline,
      reserveInventory: true,
    });
    expect(before.success).toBe(false);
    expect(before.captures).toBe(0);
    expect(after).toMatchObject({
      success: true,
      captures: 1,
      duplicateCaptures: 0,
    });
  });
  it("detects and suppresses duplicate webhook captures", () => {
    expect(simulate("duplicate_webhook", baseline)).toMatchObject({
      success: false,
      captures: 2,
      duplicateCaptures: 1,
    });
    expect(
      simulate("duplicate_webhook", { ...baseline, deduplicateWebhook: true }),
    ).toMatchObject({ success: true, captures: 1, duplicateCaptures: 0 });
  });
});
