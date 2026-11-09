import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

import type { Patch, Scenario, Simulation } from "../lib/recovery.js";
export type Audit = {
  at: string;
  actor: string;
  action: string;
  detail: string;
};
export const cases = pgTable("recovery_cases", {
  id: text("id").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  scenario: text("scenario").$type<Scenario>().notNull(),
  revision: integer("revision").notNull().default(0),
  proposal: jsonb("proposal").$type<Patch | null>(),
  before: jsonb("before_result").$type<Simulation | null>(),
  after: jsonb("after_result").$type<Simulation | null>(),
  approvedRevision: integer("approved_revision"),
  appliedRevision: integer("applied_revision"),
  audit: jsonb("audit").$type<Audit[]>().notNull(),
  createdAt: text("created_at").notNull(),
});
