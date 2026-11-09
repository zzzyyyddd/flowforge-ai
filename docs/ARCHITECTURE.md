# Architecture

```text
Studio UI ── Agent-Native actions ── PostgreSQL / local PGlite
   │                 │                      │
   │            case + audit         baseline, patch, result
   │
   └── AgentSidebar ── Groq model ── inspect-recovery / propose-recovery
                         │
                human reviews in Studio
                         │
          deterministic verification → approval → simulated apply
```

The Studio uses framework action hooks. The agent's investigation surface permits `inspect-recovery` and `propose-recovery` and instructs the model to inspect before proposing. The model is not a substitute for the deterministic engine in [recovery.ts](../server/lib/recovery.ts). It models payment timeout, inventory shortage, and duplicate webhook cases; no external workflow is invoked.

Cases are scoped to the signed-in owner and organization. A proposal increments the revision and clears prior verification and approval. Mutating case actions lock the row. Verification runs the saved patch. Approval is available to a human through the Studio and refers to that revision. Apply checks approval, successful verification and zero duplicate captures, then simulates again. Case events are stored in an application audit array, not an immutable ledger.

The intended Vercel architecture uses the framework's Nitro serverless output with a hosted PostgreSQL database. The current deployment used the Node preset through React Router auto-detection and failed at runtime; production readiness requires a corrected deployment and end-to-end verification. See [deployment preparation](../JUDGE-DEPLOYMENT.md). For implementation detail, see the existing [architecture notes](../ARCHITECTURE.md).
