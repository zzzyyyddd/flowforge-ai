# Evidence and verification

| Claim | Evidence and limit |
| --- | --- |
| Historical synthetic case reached simulated apply | An authenticated case read recorded agent-attributed revision 2, passing simulation with one capture and zero duplicates, human approval, and simulated application. See [agent evidence](../AGENT-VERIFICATION.md). |
| Groq assisted that historical proposal | Reported by the user. The saved case row does not independently establish the provider. |
| Individual agent tool calls in that run | **Unverified.** The signed-in transcript/tool-call records were not accessible; audit attribution is not proof of individual calls. |
| Simulator and approval logic | On 9 November 2026, local Vitest passed 10 tests in two files. Five cover deterministic simulation; five cover approval and apply boundaries with mocked database operations. |
| Typecheck and doctor | Passed locally on 9 November 2026. |
| Vercel runtime | HTTP 500 on 9 November 2026. Logs show `ERR_MODULE_NOT_FOUND` for `yjs` in the deployed React Router function. The deployment used the Nitro Node preset rather than the Vercel preset and had no production environment variables. |
| Screenshots | No actual product screenshots are currently present in the repository. |

The original sandbox Groq attempt failed DNS resolution before a model response; see [Groq verification](../GROQ-VERIFICATION.md). A successful build does not establish a working hosted workflow. To gather stronger evidence, capture a fresh authenticated transcript showing actual tool names, arguments, results, case ID and revision, plus before/after and approval screens. Redact credentials and unrelated data. All capture counts are synthetic.
