import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { audit, identity } from "../server/lib/case-store.js";
import { scenarioSchema } from "../server/lib/contracts.js";
export default defineAction({
  description:
    "Create a synthetic workflow recovery case for one of three failure scenarios.",
  schema: z.object({ scenario: scenarioSchema }),
  outputSchema: z.object({ id: z.string() }),
  run: async ({ scenario }, ctx) => {
    const ownerEmail = identity(ctx);
    const id = crypto.randomUUID();
    await getDb()
      .insert(schema.cases)
      .values({
        id,
        ownerEmail,
        orgId: ctx?.orgId ?? null,
        scenario,
        audit: [
          audit("Case created", `Synthetic scenario: ${scenario}`, ownerEmail),
        ],
        createdAt: new Date().toISOString(),
      });
    return { id };
  },
});
