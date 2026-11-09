import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { audit, identity, scope } from "../server/lib/case-store.js";
import { idSchema } from "../server/lib/contracts.js";
export default defineAction({
  description:
    "Record a human approval of a verified recovery patch from the studio UI.",
  agentTool: false,
  mcpTool: false,
  uiOnly: true,
  needsApproval: true,
  schema: z.object({
    id: idSchema,
    revision: z
      .number()
      .int()
      .describe("Exact proposal revision reviewed by the human"),
  }),
  outputSchema: z.object({ id: z.string(), revision: z.number() }),
  run: async ({ id, revision }, ctx) => {
    if (
      ctx?.caller !== "frontend" ||
      ctx.networkProtocol ||
      ctx.automation ||
      ctx.mcpDirectoryWidgetWrite
    )
      return fail(
        "Approval requires an authenticated human using the studio UI.",
        { statusCode: 403, errorCode: "human_required" },
      );
    return getDb().transaction(async (tx) => {
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
      if (
        !row.proposal ||
        row.revision !== revision ||
        !row.after?.success ||
        row.after.duplicateCaptures !== 0
      )
        return fail("Review and verify the current patch before approving.", {
          statusCode: 409,
          errorCode: "verification_required",
        });
      if (row.approvedRevision === revision)
        return fail("This revision is already approved.", {
          statusCode: 409,
          errorCode: "already_approved",
        });
      await tx
        .update(schema.cases)
        .set({
          approvedRevision: revision,
          audit: [
            ...row.audit,
            audit("Human approved", `Revision ${revision}`, identity(ctx)),
          ],
        })
        .where(scope(id, ctx));
      return { id, revision };
    });
  },
});
