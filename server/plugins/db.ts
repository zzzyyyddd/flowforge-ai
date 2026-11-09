import { runMigrations } from "@agent-native/core/db";
export default runMigrations(
  [
    {
      version: 1,
      name: "recovery-cases",
      sql: `CREATE TABLE IF NOT EXISTS recovery_cases (id TEXT PRIMARY KEY, owner_email TEXT NOT NULL, org_id TEXT, scenario TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0, proposal JSONB, before_result JSONB, after_result JSONB, approved_revision INTEGER, applied_revision INTEGER, audit JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS recovery_cases_owner_created_idx ON recovery_cases (owner_email, created_at);`,
    },
  ],
  { table: "flowforge_migrations" },
);
