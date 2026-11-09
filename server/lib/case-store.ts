import { fail, type ActionRunContext } from "@agent-native/core/action";
import { and, eq, isNull } from "drizzle-orm";

import { getDb, schema } from "../db/index.js";
import type { Audit } from "../db/schema.js";
export function identity(ctx?: ActionRunContext) {
  return (
    ctx?.userEmail ??
    fail("Sign in to use recovery cases.", {
      statusCode: 401,
      errorCode: "unauthenticated",
    })
  );
}
export function scope(id: string, ctx?: ActionRunContext) {
  const email = identity(ctx);
  return and(
    eq(schema.cases.id, id),
    eq(schema.cases.ownerEmail, email),
    ctx?.orgId ? eq(schema.cases.orgId, ctx.orgId) : isNull(schema.cases.orgId),
  );
}
export async function getCase(id: string, ctx?: ActionRunContext) {
  const [row] = await getDb()
    .select()
    .from(schema.cases)
    .where(scope(id, ctx))
    .limit(1);
  return (
    row ??
    fail("Recovery case not found.", {
      statusCode: 404,
      errorCode: "not_found",
    })
  );
}
export function audit(action: string, detail: string, actor: string): Audit {
  return { at: new Date().toISOString(), actor, action, detail };
}
