# Security and trust boundaries

- **Synthetic only:** the application does not capture payments or modify real inventory or external workflows. Simulator success does not establish a real processor's idempotency.
- **Human approval:** `approve-recovery` is UI-only, excluded from agent and MCP tools, and rejects delegated and non-frontend contexts. Approval requires a verified current revision. Apply checks the approval and rejects duplicate simulated captures.
- **Access:** case actions scope records by authenticated owner and organization. Hosted isolation depends on correct framework authentication and database configuration; it has not been verified on the current deployment.
- **Agent and credentials:** a configured model can propose a patch, but cannot approve it. Keep Groq credentials server-side. For a hosted demo, restrict signups to invited judges and monitor provider usage; an invitation is not a usage quota.
- **Audit:** events are saved with the case, but the audit is not a tamper-proof or independently audited ledger.
- **Limitations:** tests include mocked database approval boundaries and do not replace hosted authorization, concurrency, or penetration testing. No independent security audit is claimed.

See [deployment preparation](../JUDGE-DEPLOYMENT.md) and [evidence](EVIDENCE.md).
