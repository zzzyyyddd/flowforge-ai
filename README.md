# FlowForge AI

FlowForge AI is an Agent-Native recovery studio for synthetic Order-to-Payment failures. It helps an operator investigate a failed workflow, review a structured patch, simulate its effects and approve the exact revision before applying it to the simulated case. It never contacts a real payment gateway, inventory service or webhook provider.

## Why agent-native

The agent works through the same typed recovery actions that power the Studio: it can inspect case evidence and propose a structured change in the context of the selected case. The shared AgentSidebar keeps the investigation in the operator's workflow. Case state, simulation results and audit events persist in SQL. A human reviews and approves a passing revision in Studio; the agent cannot approve it. Application checks that exact approval and zero duplicate synthetic captures.

## Demonstrated recovery

For payment-timeout case `9cf20a1d-e774-450b-805e-6461fa89612c`, an authenticated case read confirmed an agent-attributed revision 2, a passing recovery simulation with one synthetic capture and zero duplicate captures, human approval, and application of that revision. The saved patch uses two retries, a 5,000 ms timeout and idempotency. The user reports the proposal was generated with Groq; the individual `inspect-recovery` and `propose-recovery` execution records were not independently accessible and remain **unverified**. See [AGENT-VERIFICATION.md](AGENT-VERIFICATION.md).

The original failure and the recovered outcome appear as separate traces. The simulator also models inventory shortage and duplicate webhook delivery. Its traces and results are synthetic; they are not proof about real-world systems.

## Run locally

Requires Node.js 22.22 or newer and the dependencies in `pnpm-lock.yaml`.

```bash
pnpm install
pnpm exec agent-native dev
```

Open the local URL printed by the server and sign in. Local development uses PGlite. Open `/studio`; chat remains at `/chat`. A configured, tool-capable model provider is required for a live agent investigation; select it in the shared model settings. Do not put provider credentials in the repository or demo materials.

See [DEMO.md](DEMO.md) for the 2–3 minute walkthrough, [SUBMISSION.md](SUBMISSION.md) for submission copy, and [ARCHITECTURE.md](ARCHITECTURE.md) for the implementation and safety boundaries.

## Checks

```bash
pnpm test
pnpm typecheck
pnpm agent-native:doctor
pnpm build
```

A hosted production runtime requires persistent Postgres and production authentication configuration. A successful build is not a deployment or a production-readiness check. Licensed under the MIT license; see [LICENSE](LICENSE).
