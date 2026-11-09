# Judge guide

**FlowForge AI** is a recovery rehearsal for synthetic order-to-payment incidents: evidence, a proposed patch, deterministic verification, and a human decision in one workflow.

| Start here | What to expect |
| --- | --- |
| [Repository](https://github.com/zzzyyyddd/flowforge-ai) | Source, tests, and setup |
| [Vercel URL](https://flowforge-ai-seven.vercel.app) | Returned HTTP 500 on 9 November 2026; not currently a usable demo |
| [Evidence](EVIDENCE.md) | What was observed, reported, tested, and not verified |
| [Security](SECURITY.md) | Approval and access boundaries and limitations |

## Try the local flow

1. Install Node.js 22.22+ and pnpm, run `pnpm install` and `pnpm exec agent-native dev`, and sign in at the local URL.
2. Open `/studio`, create a payment-timeout case, and run the baseline. The trace describes a synthetic capture whose response timed out.
3. Configure a working Groq provider in the shared model settings. Choose **Investigate failure** and review the real agent's inspection and proposed patch. If a tool call fails or is absent, report that outcome.
4. Verify the patch and compare the original and recovered traces. Check capture and duplicate counts.
5. As a signed-in human, approve the passing revision and apply it to the simulation. Inspect the audit. A new patch invalidates the old verification and approval.
6. Explore the inventory-shortage and duplicate-webhook scenarios. These are bounded simulations, not integrations.

The historical case in [AGENT-VERIFICATION.md](../AGENT-VERIFICATION.md) belongs to its original local account and database; it is not guaranteed to exist in a fresh installation. [DEMO.md](../DEMO.md) is a script for that existing case, not a substitute for a fresh run.

## What to evaluate

Look for the connection between agent actions and shared case state, the before/after traces, the revision-bound human approval, and the explicit separation between simulations and real-world recovery. No provider key, browser session, or credentials should appear in captured evidence.
