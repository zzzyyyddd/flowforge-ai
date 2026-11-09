# Submission description

**FlowForge AI** is an Agent-Native recovery studio for synthetic Order-to-Payment failures. When a simulated capture times out, an operator can investigate the evidence with an agent, review a structured recovery patch, and run a deterministic before/after simulation. The studio preserves the original failure, shows the recovered trace and capture counts, and requires human approval of the exact verified revision before simulated application.

FlowForge goes beyond a conventional chatbot: its agent is connected to typed application actions and case context; the UI and agent share persisted workflow state; and safety is enforced by revision-bound approval and a zero-duplicate-capture application gate. The simulator also covers inventory shortages and duplicate webhook delivery.

For the demonstrated payment-timeout case, the saved record confirms an agent-attributed revision 2, a successful simulation with one synthetic capture and zero duplicates, human approval, and simulated application. The user reports Groq generated the proposal. Individual tool-call execution records for that run remain unverified; the case audit does not prove those calls. No real payments or external workflow changes occur.
