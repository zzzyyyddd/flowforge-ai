# FlowForge AI demo script · 2–3 minutes

**Before recording:** Sign in as the case owner, configure the model if demonstrating a new investigation, open case `9cf20a1d-e774-450b-805e-6461fa89612c` in Studio, and verify that revision 2 and its audit are visible. Have the baseline and recovered trace in view. Do not expose credentials, cookies or unrelated data. This is a synthetic workflow throughout.

## 0:00–0:25 · The problem

“Payment timeouts are ambiguous: a gateway may have accepted a capture even though the workflow never received the response. Retrying without protection can charge twice. FlowForge AI gives an operator a controlled way to investigate and rehearse a recovery.”

Show the **Before · baseline** trace. “Here the synthetic capture was accepted, but its response timed out. This is the original evidence, preserved after recovery.”

## 0:25–1:05 · Agent-assisted proposal

Open the existing agent conversation and the proposed patch. “The investigation was generated with Groq, and the saved case attributes revision 2 to the agent. It proposes two retries, a five-second timeout, and an idempotency key to handle an ambiguous outcome safely.”

“The product is agent-native because the assistant is connected to typed case actions and works inside the Studio, where the human can review the same structured state. The individual tool-call execution records for this run have not been independently verified; the audit attribution is not a substitute for those records.”

## 1:05–1:50 · Test and human control

Show **After · applied recovery**, the verification summary, and audit history. “The deterministic simulation passes with one synthetic capture and zero duplicates. The audit records that a person approved revision 2, then applied that same revision to the simulated workflow. Approval is reserved for the human; changing the proposal invalidates the earlier verification and approval.”

Refresh the page and show the case, revision and audit again if the demo machine confirms they persist. Export the report if time permits. Do not re-run baseline or re-verify the applied case during this walkthrough; those operations reset state.

## 1:50–2:25 · Other failures and close

Show the scenario selector. “FlowForge also models inventory shortages and duplicate webhooks. Its deterministic tests check the safe reservation policy and duplicate suppression, as well as the payment-timeout invariant.”

“FlowForge turns an agent's proposed change into an inspectable recovery workflow: evidence, a structured patch, a simulation, and a human decision. Everything shown here is a simulation, not a real payment or a production recovery.”

If any expected saved state or UI element is unavailable, say so; do not substitute a manually entered proposal or claim a live tool call occurred.
