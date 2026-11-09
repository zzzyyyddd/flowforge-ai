import { z } from "zod";
export const scenarioSchema = z
  .enum(["payment_timeout", "inventory_shortage", "duplicate_webhook"])
  .describe("Synthetic failure scenario");
export const patchSchema = z.object({
  retryCount: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe("Maximum synthetic capture retries, 0 to 5"),
  timeoutMs: z
    .number()
    .int()
    .min(100)
    .max(30000)
    .describe("Capture timeout in milliseconds"),
  idempotency: z
    .boolean()
    .describe("Reuse the order idempotency key on capture retry"),
  reserveInventory: z
    .boolean()
    .describe("Use a reservation and backorder policy"),
  deduplicateWebhook: z
    .boolean()
    .describe("Suppress duplicate webhook event IDs"),
  rationale: z
    .string()
    .min(1)
    .max(2000)
    .describe("Reason for the proposed change"),
});
export const idSchema = z.string().uuid().describe("Recovery case ID");
