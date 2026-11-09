import { beforeEach, describe, expect, it, vi } from "vitest";

import { baseline, simulate } from "./recovery";

const state = vi.hoisted(() => ({ row: null as any, writes: 0 }));
vi.mock("../db/index.js", async () => {
  const { pgTable, text } = await import("drizzle-orm/pg-core");
  const cases = pgTable("recovery_cases", {
    id: text("id"),
    ownerEmail: text("owner_email"),
    orgId: text("org_id"),
  });
  return {
    schema: { cases },
    getDb: () => ({
      transaction: async (fn: any) =>
        fn({
          select: () => ({
            from: () => ({
              where: () => ({
                for: async () => (state.row ? [state.row] : []),
              }),
            }),
          }),
          update: () => ({
            set: () => ({
              where: async () => {
                state.writes++;
              },
            }),
          }),
        }),
    }),
  };
});
import approve from "../../actions/approve-recovery";
import run from "../../actions/run-recovery";
const id = "d5db3694-8b86-44be-9339-5603b536ed2e";
const patch = {
  ...baseline,
  retryCount: 1,
  timeoutMs: 3000,
  idempotency: true,
  rationale: "Retry safely",
};
const human = {
  caller: "frontend" as const,
  userEmail: "owner@example.test",
  orgId: null,
};
beforeEach(() => {
  state.writes = 0;
  state.row = {
    id,
    scenario: "payment_timeout",
    revision: 2,
    proposal: patch,
    approvedRevision: null,
    appliedRevision: null,
    after: simulate("payment_timeout", patch),
    audit: [],
  };
});
describe("human approval and apply boundary", () => {
  it("rejects agent self-approval before writing", async () => {
    await expect(
      approve.run({ id, revision: 2 }, { ...human, caller: "tool" }),
    ).rejects.toThrow(/signed-in app UI/i);
    expect(state.writes).toBe(0);
  });
  it("rejects stale revision approval", async () => {
    await expect(approve.run({ id, revision: 1 }, human)).rejects.toThrow(
      /verify/i,
    );
    expect(state.writes).toBe(0);
  });
  it("rejects applying a verified patch without human approval", async () => {
    await expect(run.run({ id, operation: "apply" }, human)).rejects.toThrow(
      /approval/i,
    );
    expect(state.writes).toBe(0);
  });
  it("rejects a duplicate-capture verification even if approval is present", async () => {
    state.row.approvedRevision = 2;
    state.row.after = simulate("payment_timeout", {
      ...patch,
      idempotency: false,
    });
    await expect(run.run({ id, operation: "apply" }, human)).rejects.toThrow(
      /simulation/i,
    );
    expect(state.writes).toBe(0);
  });
  it("accepts only the verified revision once a human has approved it", async () => {
    state.row.approvedRevision = 2;
    await expect(
      run.run({ id, operation: "apply" }, human),
    ).resolves.toMatchObject({ id });
    expect(state.writes).toBe(1);
  });
});
