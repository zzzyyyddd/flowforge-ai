export type Scenario =
  | "payment_timeout"
  | "inventory_shortage"
  | "duplicate_webhook";
export type Patch = {
  retryCount: number;
  timeoutMs: number;
  idempotency: boolean;
  reserveInventory: boolean;
  deduplicateWebhook: boolean;
  rationale: string;
};
export type Event = {
  step: string;
  status: "passed" | "failed" | "skipped";
  detail: string;
  atMs: number;
};
export type Simulation = {
  scenario: Scenario;
  events: Event[];
  success: boolean;
  captures: number;
  duplicateCaptures: number;
  config: Patch;
};
export const baseline: Patch = {
  retryCount: 0,
  timeoutMs: 1000,
  idempotency: false,
  reserveInventory: false,
  deduplicateWebhook: false,
  rationale: "Original workflow configuration",
};
export function simulate(scenario: Scenario, config: Patch): Simulation {
  const events: Event[] = [];
  const add = (
    step: string,
    status: Event["status"],
    detail: string,
    atMs: number,
  ) => events.push({ step, status, detail, atMs });
  add("Order received", "passed", "Synthetic order ORD-1042 accepted.", 0);
  if (scenario === "inventory_shortage" && !config.reserveInventory) {
    add(
      "Inventory check",
      "failed",
      "Requested quantity exceeds available stock; no reservation or backorder policy.",
      120,
    );
    add(
      "Capture payment",
      "skipped",
      "Payment was not attempted after the inventory failure.",
      120,
    );
    return {
      scenario,
      events,
      success: false,
      captures: 0,
      duplicateCaptures: 0,
      config,
    };
  }
  add(
    "Inventory check",
    "passed",
    scenario === "inventory_shortage"
      ? "Reservation policy routes unavailable items to a safe backorder."
      : "Synthetic stock is available.",
    120,
  );
  if (scenario === "payment_timeout") {
    add(
      "Capture payment",
      "failed",
      "Gateway accepted the capture but its response timed out at 1,000 ms; outcome is ambiguous.",
      1120,
    );
    if (config.retryCount < 1 || config.timeoutMs < 2000) {
      add(
        "Recovery",
        "failed",
        "No effective retry policy; capture status remains unconfirmed.",
        1120,
      );
      return {
        scenario,
        events,
        success: false,
        captures: 1,
        duplicateCaptures: 0,
        config,
      };
    }
    const duplicates = config.idempotency ? 0 : 1;
    add(
      "Retry capture",
      duplicates ? "failed" : "passed",
      duplicates
        ? "Retry created a second synthetic capture without an idempotency key."
        : "Retry reused the order idempotency key and returned the original capture.",
      2120,
    );
    return {
      scenario,
      events,
      success: !duplicates,
      captures: 1 + duplicates,
      duplicateCaptures: duplicates,
      config,
    };
  }
  if (scenario === "duplicate_webhook") {
    add(
      "Webhook delivery",
      "passed",
      "The same synthetic event was delivered twice.",
      200,
    );
    const duplicates = config.deduplicateWebhook || config.idempotency ? 0 : 1;
    add(
      "Capture payment",
      duplicates ? "failed" : "passed",
      duplicates
        ? "Both deliveries created a capture."
        : "The duplicate delivery was suppressed before a second capture.",
      350,
    );
    return {
      scenario,
      events,
      success: !duplicates,
      captures: 1 + duplicates,
      duplicateCaptures: duplicates,
      config,
    };
  }
  add("Capture payment", "passed", "One synthetic capture completed.", 400);
  return {
    scenario,
    events,
    success: true,
    captures: 1,
    duplicateCaptures: 0,
    config,
  };
}
