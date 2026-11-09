import { defineAction } from "@agent-native/core/action";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { identity } from "../server/lib/case-store.js";
export default defineAction({
  description: "List your recent synthetic recovery cases.",
  schema: z.object({}),
  outputSchema: z.any(),
  http: { method: "GET" },
  readOnly: true,
  run: async (_args, ctx) => ({
    cases: await getDb()
      .select({
        id: schema.cases.id,
        scenario: schema.cases.scenario,
        createdAt: schema.cases.createdAt,
      })
      .from(schema.cases)
      .where(
        and(
          eq(schema.cases.ownerEmail, identity(ctx)),
          ctx?.orgId
            ? eq(schema.cases.orgId, ctx.orgId)
            : isNull(schema.cases.orgId),
        ),
      )
      .orderBy(desc(schema.cases.createdAt))
      .limit(50),
  }),
});
