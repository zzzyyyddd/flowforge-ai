# Submission checklist

- [x] Describe the agent-native workflow, human approval boundary and synthetic-only scope in [README.md](README.md) and [SUBMISSION.md](SUBMISSION.md).
- [x] Prepare a timed 2–3 minute [demo script](DEMO.md) using the saved case.
- [x] Verify the saved case's agent attribution, revision 2, successful zero-duplicate simulation, human approval and simulated application via an authenticated case read.
- [x] Clearly mark the reported Groq origin and individual tool-call execution records according to their evidence in [AGENT-VERIFICATION.md](AGENT-VERIFICATION.md).
- [x] Exercise the three synthetic scenarios with deterministic tests and check human approval boundaries.
- [x] Run tests, typecheck, Agent-Native doctor and the production build; see the readiness report for actual results and production configuration warnings.
- [x] Check candidate repository files for common key patterns and confirm local environment, database and runtime files are ignored. Review the final staged diff again before committing; pattern scanning cannot guarantee absence of every secret.
- [ ] Record the demo on the intended machine, verify the saved case and refresh display, and prepare any required video or screenshots.
- [ ] If the hackathon requires proof of actual tool execution, capture the persisted `inspect-recovery` and `propose-recovery` records through the authorized signed-in session. These calls are currently unverified.
- [ ] Review the final candidate files and submission requirements; obtain approval before committing, pushing, deploying or submitting.

A hosted deployment, if later authorized, needs persistent Postgres and production authentication configuration. The local build does not establish hosted readiness.
