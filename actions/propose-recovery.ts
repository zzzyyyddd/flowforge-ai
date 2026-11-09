import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { audit, identity, scope } from "../server/lib/case-store.js";
import { idSchema, patchSchema } from "../server/lib/contracts.js";
export default defineAction({
  description:
    "Save a structured proposed recovery patch after inspecting the case. Changes invalidate any earlier approval and verification.",
  schema: z.object({ id: idSchema, patch: patchSchema }),
  outputSchema: z.object({ id: z.string(), revision: z.number() }),
  run: async ({ id, patch }, ctx) =>
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
      if (!row.before)
        return fail("Run the initial simulation first.", {
          statusCode: 409,
          errorCode: "simulation_required",
        });
      const revision = row.revision + 1;
      await tx
        .update(schema.cases)
        .set({
          proposal: patch,
          revision,
          approvedRevision: null,
          appliedRevision: null,
          after: null,
          audit: [
            ...row.audit,
            audit(
              "Patch proposed",
              `Revision ${revision}: ${patch.rationale}`,
              ctx?.caller === "tool" ? "Agent" : identity(ctx),
            ),
          ],
        })
        .where(scope(id, ctx));
      return { id, revision };
    }),
});
