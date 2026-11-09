# Groq agent verification

The app defaults to Agent-Native's built-in `ai-sdk:groq` engine and its
recommended `llama-3.3-70b-versatile` model. Set `AGENT_ENGINE` and
`AGENT_MODEL` in the server environment to choose another engine or model.
An organization default or an explicit chat selection may take precedence.
The framework resolves scoped provider credentials before the self-hosted
deployment environment fallback; do not use a shared deployment key across
hosted apps or tenants. Keep `GROQ_API_KEY` in the server environment only.

## Earlier sandbox attempt

The production Agent-Native agent loop was attempted on 2026-11-09 with a
request to create a synthetic payment-timeout case, run its baseline, inspect
it, and propose a patch. DNS resolution failed with `EAI_AGAIN` before a model
response. No case ID, successful tool call, or proposal was obtained in that
attempt. The user later reported a successful run; see [AGENT-VERIFICATION.md](AGENT-VERIFICATION.md)
for its evidence status and the remaining transcript checks.

## Local verification

In a regular Ubuntu terminal, stop the old development server and restart it
from this directory with the existing local environment and network access:

```sh
AGENT_MAX_ITERATIONS=8 AGENT_ENGINE=ai-sdk:groq AGENT_MODEL=openai/gpt-oss-120b pnpm exec agent-native dev --no-open
```

The iteration setting is the framework default for a turn; an existing
organization or user loop setting can override it. In Settings → Model,
confirm the chat is actually using Groq and `openai/gpt-oss-120b`, since a
saved default or chat selection may take precedence over environment defaults.
Open `/studio`, create a Payment timeout case, run its baseline, and click
**Investigate failure**. In the agent transcript, expand the actual `inspect-recovery` and
`propose-recovery` tool calls and record their names, matching case IDs, the
returned revision, and the saved proposal. Confirm the proposal is attributed
to the agent and that the case is neither approved nor applied. Record only
synthetic case data; exclude credentials, authorization headers and cookies.

The model must call both tools successfully; narrative alone is not proof.
Check model availability in the provider's model picker if the configured
model is unavailable. Verification and approval remain separate: only a human
in the studio may approve a passing revision, and applying it still requires
that exact approval and zero duplicate simulated captures.
