# FlowForge AI

### Investigate a failed workflow. Rehearse the fix. Let a human decide.

FlowForge AI is an Agent-Native recovery studio for synthetic order-to-payment failures. An operator can inspect a failure with an agent, review a structured recovery patch, compare deterministic simulations, and approve the exact verified revision before applying it to the simulated case.

**[Judge guide](docs/JUDGE_GUIDE.md)** · **[Architecture](docs/ARCHITECTURE.md)** · **[Evidence](docs/EVIDENCE.md)** · **[Security](docs/SECURITY.md)** · **[Source on GitHub](https://github.com/zzzyyyddd/flowforge-ai)**

> **Demo status:** The [Vercel deployment](https://flowforge-ai-seven.vercel.app) returned HTTP 500 on 9 November 2026. It is not currently a working judge demo. Use the local walkthrough below; see [deployment preparation](JUDGE-DEPLOYMENT.md) for the blockers. No real payments, inventory changes, or webhooks are executed.

## Judge quick start

1. Review the [judge guide](docs/JUDGE_GUIDE.md) for a short walkthrough and evidence boundaries.
2. Run locally with Node.js 22.22+ and pnpm: `pnpm install`, then `pnpm exec agent-native dev`. Sign in at the printed URL and open `/studio`.
3. Create a **Payment timeout** case and run the baseline. With a configured Groq provider, use **Investigate failure** to request an agent investigation. Review the proposed patch and run verification.
4. Review the before/after traces and capture counts. A human can approve a passing revision in Studio, then apply it to the simulated case. Changing the patch invalidates verification and approval.

A working provider credential and network access are required for a new agent investigation. Screenshots of the actual product are not currently included in this repository. See [DEMO.md](DEMO.md) for a narrated walkthrough and [evidence status](docs/EVIDENCE.md) before presenting a historical run.

## The recovery loop

```text
Synthetic failure → baseline trace → agent inspects evidence → structured patch
        → deterministic verification → human approval → simulated apply + audit
```

| Scenario | Failure represented | Recovery modeled |
| --- | --- | --- |
| Payment timeout | Capture accepted but the response times out; an unsafe retry can duplicate it. | Retry with an idempotency key. |
| Inventory shortage | Stock is insufficient and payment is skipped. | Reserve or route unavailable stock to backorder. |
| Duplicate webhook | Repeated delivery can create two captures. | Suppress the duplicate event or use idempotency. |

Before and after are **simulation results**. For example, the timeout baseline has one synthetic capture with an unconfirmed outcome; the tested idempotent retry succeeds with one capture and zero duplicates. It does not establish the behavior of a real payment processor.

## Agent-Native, with Groq

The Studio and agent share typed Agent-Native actions and SQL-backed case state. The investigation surface exposes `inspect-recovery` and `propose-recovery`; the configured agent is instructed to inspect evidence before proposing a patch. The default engine is `ai-sdk:groq` with `llama-3.3-70b-versatile`. The model may be changed in configuration or settings. The simulator, verification, and approval gates remain deterministic application logic.

Approval is deliberately reserved for a signed-in human in Studio. Apply requires the same approved revision, a passing simulation, and zero duplicate captures. The audit records case events, but is not a tamper-proof ledger. See [security](docs/SECURITY.md) for the trust boundary.

## Evidence and checks

An authenticated read of a historical synthetic case recorded an agent-attributed proposal, a passing simulation, human approval, and simulated application. The user reports Groq generated that proposal, but the individual `inspect-recovery` and `propose-recovery` execution records were not independently accessible. The saved audit does not prove the provider or those calls. [Read the evidence and its limits](docs/EVIDENCE.md).

```bash
pnpm test
pnpm typecheck
pnpm agent-native:doctor
npm run build:vercel
```

The 9 November 2026 local run passed 10 tests in two files: five deterministic simulation tests and five approval/apply boundary tests using a mocked database. Typecheck and doctor passed. These are not hosted end-to-end or security-audit results. See [evidence](docs/EVIDENCE.md) for the current build and deployment status.

## Repository and deployment

| Path | Purpose |
| --- | --- |
| [app/routes/studio.tsx](app/routes/studio.tsx) | Recovery Studio interface |
| [actions/](actions/) | Real case actions and human approval boundary |
| [server/lib/recovery.ts](server/lib/recovery.ts) | Deterministic synthetic simulator |
| [server/db/](server/db/) | SQL case schema and database access |
| [docs/](docs/) | Judge guide, architecture, security and evidence |
| [JUDGE-DEPLOYMENT.md](JUDGE-DEPLOYMENT.md) | Production configuration and remaining release checks |

Local development uses PGlite; production needs hosted PostgreSQL, authentication, a Groq credential and restricted judge access. A successful build is not proof that the hosted app works. The app is licensed under the [MIT license](LICENSE).
