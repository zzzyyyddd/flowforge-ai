import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getCase } from "../server/lib/case-store.js";
import { idSchema } from "../server/lib/contracts.js";
export default defineAction({
  description:
    "Inspect a synthetic recovery case, including execution timeline, proposed patch, simulation evidence and audit history. Use this before investigating.",
  schema: z.object({ id: idSchema }),
  outputSchema: z.any(),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ id }, ctx) => getCase(id, ctx),
});
