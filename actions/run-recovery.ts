import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { audit, identity, scope } from "../server/lib/case-store.js";
import { idSchema } from "../server/lib/contracts.js";
import { baseline, simulate } from "../server/lib/recovery.js";
export default defineAction({
  description:
    "Run a baseline or proposed-patch simulation, or apply a human-approved, successfully verified patch. All outcomes are simulated.",
  schema: z.object({
    id: idSchema,
    operation: z
      .enum(["baseline", "verify", "apply"])
      .describe("baseline, verify, or apply"),
  }),
  outputSchema: z.object({ id: z.string(), message: z.string() }),
  run: async ({ id, operation }, ctx) =>
    getDb().transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(schema.cases)
        .where(scope(id, ctx))
        .for("update");
      if (!row)
        return fail("Recovery case not found.", {
          statusCode: 404,
          errorCode: "not_found",
        });
      const actor = ctx?.caller === "tool" ? "Agent" : identity(ctx);
      if (operation === "baseline") {
        const before = simulate(row.scenario, baseline);
        await tx
          .update(schema.cases)
          .set({
            before,
            proposal: null,
            after: null,
            approvedRevision: null,
            appliedRevision: null,
            revision: row.revision + 1,
            audit: [
              ...row.audit,
              audit(
                "Baseline simulated",
                `${before.success ? "Passed" : "Failed"}; ${before.captures} synthetic capture(s)`,
                actor,
              ),
            ],
          })
          .where(scope(id, ctx));
        return { id, message: "Baseline simulation complete" };
      }
      if (!row.proposal)
        return fail("A patch proposal is required.", {
          statusCode: 409,
          errorCode: "proposal_required",
        });
      if (operation === "verify") {
        const after = simulate(row.scenario, row.proposal);
        await tx
          .update(schema.cases)
          .set({
            after,
            approvedRevision: null,
            appliedRevision: null,
            audit: [
              ...row.audit,
              audit(
                "Patch simulated",
                `${after.success ? "Passed" : "Failed"}; ${after.duplicateCaptures} duplicate capture(s)`,
                actor,
              ),
            ],
          })
          .where(scope(id, ctx));
        return {
          id,
          message: after.success
            ? "Verification passed"
            : "Verification failed",
        };
      }
      if (row.approvedRevision !== row.revision)
        return fail("Human approval of this exact revision is required.", {
          statusCode: 403,
          errorCode: "approval_required",
        });
      if (!row.after?.success || row.after.duplicateCaptures !== 0)
        return fail(
          "A passing simulation with no duplicate captures is required.",
          { statusCode: 409, errorCode: "verification_required" },
        );
      if (row.appliedRevision === row.revision)
        return fail("This revision is already applied.", {
          statusCode: 409,
          errorCode: "already_applied",
        });
      const recovered = simulate(row.scenario, row.proposal);
      if (!recovered.success || recovered.duplicateCaptures !== 0)
        return fail("Recovery verification failed.", {
          statusCode: 409,
          errorCode: "verification_failed",
        });
      await tx
        .update(schema.cases)
        .set({
          after: recovered,
          appliedRevision: row.revision,
          audit: [
            ...row.audit,
            audit(
              "Patch applied",
              `Revision ${row.revision} applied to the simulated workflow`,
              actor,
            ),
          ],
        })
        .where(scope(id, ctx));
      return { id, message: "Approved patch applied to simulated workflow" };
    }),
});
