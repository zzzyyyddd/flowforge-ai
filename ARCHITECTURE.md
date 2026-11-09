# Architecture

The `/studio` route uses framework action hooks. The same `defineAction` operations are registered with Agent-Native's agent runtime: create/list/inspect a case, save a structured proposal, and run baseline, verification, and application. The investigation button sends a real request to the shared AgentSidebar with the case ID; the agent is instructed to call `inspect-recovery` and `propose-recovery`. A configured model provider is required; the application does not invent a response if one is unavailable.

`server/lib/recovery.ts` is a deterministic synthetic engine, not an integration. Its timeout model explicitly assumes the gateway accepted a capture before the response was lost; retrying without idempotency produces a second simulated capture. The inventory scenario models a backorder policy, and the webhook scenario models duplicate event delivery. Events are synthetic traces, not evidence from an external system. The fixed set of selectable canvas nodes visualizes this model; it is not a general-purpose drag-and-drop workflow editor.

Each case is stored in PostgreSQL (local PGlite in development), scoped to the authenticated owner and organization. The row holds the baseline, patch, verification, revision, and append-only-in-the-application audit events. Writes serialize on a locked case row. Every proposal edit clears verification and approval. Verification simulates the exact saved patch; approval is bound to that revision. Application checks the same revision, a passing verification and zero duplicate captures, then runs the simulation again. Application changes only the simulated case, never a real workflow.

Approval is an intentional exception to ordinary UI/agent parity: `approve-recovery` is hidden from agent and MCP tools, marked `uiOnly` and `needsApproval`, and rejects non-frontend, delegated, and automation contexts. The framework's UI capability gate verifies a same-origin signed-in browser session. Human approval is recorded with the authenticated identity. These checks depend on the starter's authentication and framework action dispatcher; direct in-process calls are not a separate trusted API.

The JSON export is a snapshot of the case and its synthetic evidence, including its audit events. Audit events are not a tamper-proof ledger. The demonstration engine is intentionally bounded and does not prove idempotency of a real payment processor.

## Local verification

An authenticated case read confirmed an agent-attributed revision 2, a passing simulation with one capture and zero duplicates, human approval and simulated application. The user reports Groq generated the proposal; the individual tool-call records remain unverified. See [AGENT-VERIFICATION.md](AGENT-VERIFICATION.md). Automated tests cover the three deterministic scenarios and approval boundaries. A production build does not establish hosted readiness; production authentication and persistent database configuration are still required.
