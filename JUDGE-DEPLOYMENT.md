# Judge demo deployment preparation

The deployment currently fails: on 9 November 2026 its function logs reported
`ERR_MODULE_NOT_FOUND` for `yjs`. Vercel detected React Router and packaged its
function while `pnpm build` emitted Nitro's Node preset, not the framework's
Vercel output. Vercel reported no production environment variables. The local
`vercel.json` selects the framework build command and disables auto-detection;
it has not been deployed or validated on Vercel. The installed
Agent-Native 0.226.0 documentation supports the Nitro Vercel preset. The
application, its authenticated actions and agent chat run in the resulting
server function; browser assets are served by Vercel. Use a dedicated hosted
PostgreSQL database for framework state, chat and recovery cases. The local
PGlite database is not durable on Vercel. The simulations are synthetic.

## Access and secrets

Do not expose a deployment with open registration and a shared Groq key.
Use the framework's invite-only policy, verified email and individually
invited judge accounts. Configure these on the deployment:

```dotenv
AUTH_SIGNUP=invited
ORG_CREATION=closed
AUTO_CREATE_DEFAULT_ORG=0
AUTH_BOOTSTRAP_ADMINS=<verified administrator email>
AUTH_REQUIRE_EMAIL_VERIFICATION=1
```

An email provider and verified sender/domain are needed for verification and
invitations. Bootstrap the administrator, then invite each judge through Team
settings. Do not enable an organization-wide allowed email domain unless all
members of that domain should have access. Keep signup closed, revoke access
after judging, and use a dedicated Groq key with provider-side usage limits or
spend controls where available. Invite-only access limits the audience but is
not a per-user usage quota; monitor usage and disable the key if needed.
Validate the complete admission and invitation flow before sharing the URL.

In Vercel, open **stock-shield → flowforge-ai → Settings → Environment
Variables**, select **Production**, and enter each value privately (do not
paste secrets in issues, source files, or chat). Required deployment secrets:
`DATABASE_URL` (persistent PostgreSQL),
`BETTER_AUTH_SECRET` (stable random signing secret), `GROQ_API_KEY` (dedicated
server-side inference key), `A2A_SECRET` (independent random secret for signed
background handoffs), `CRON_SECRET` (random secret for the framework sweep),
and an email provider's credentials (for example `RESEND_API_KEY`, with a
verified sender). Set `BETTER_AUTH_URL` to the final HTTPS origin and configure
the email provider's required sender settings. Never commit these values.
`AGENT_ENGINE=ai-sdk:groq` and `AGENT_MODEL=llama-3.3-70b-versatile` are the
current defaults. Set `AGENT_CHAT_DURABLE_BACKGROUND=true` and verify background
handoffs on the actual host. A standalone deployment may use its own Groq env
key; do not reuse that key across unrelated hosted apps or tenants.

For `BETTER_AUTH_SECRET`, `A2A_SECRET`, and `CRON_SECRET`, generate three
independent values locally with `openssl rand -hex 32` and enter each directly
in Vercel's secret fields. Copy `DATABASE_URL` from the selected PostgreSQL
provider and `GROQ_API_KEY` from the dedicated Groq project. Obtain the email
provider key and verify the sender domain in that provider's dashboard. Set
`BETTER_AUTH_URL=https://flowforge-ai-seven.vercel.app`, plus the invite-only
variables above. Do not share the generated values in this repository or chat.
Run migrations from a trusted terminal with the production `DATABASE_URL`
provided securely in that process; the migration connects to and changes that
database, so do it only after the user has authorized production setup.

## Release procedure (not performed)

1. Obtain a Vercel account, hosted PostgreSQL (for example Neon), Groq, and an
   email delivery account. Confirm each provider's current free limits, terms,
   verification requirements, and billing controls before creating resources.
2. Configure the variables above in Vercel, with authentication enabled. Run
   `pnpm migrate:production` with the intended database URL in a protected
   shell before the first deployment and before releases needing migrations.
3. Set the project Node.js version to 22.x (22.22 or newer). The currently
   deployed project used Node 26 and React Router auto-detection. Ensure the
   project build settings do not override the checked-in `vercel.json`, or use
   the framework's documented prebuilt workflow. Run `npm run build:vercel`
   and use the framework's documented Vercel prebuilt
   deployment procedure when explicitly authorized. The build uses the daily
   Hobby-compatible cron schedule. Automated sweeps can consequently be delayed
   by up to a day; do not rely on timely scheduled automation for this demo.
4. Before judge access, verify signup rejection for uninvited addresses, email
   verification, invited login, user and organization isolation, a real Groq
   tool call, reload persistence, and the entire Studio baseline / proposal /
   verify / human approval / apply flow. Verify interrupted agent-run recovery
   and the platform's function duration and outbound self-dispatch behavior.
   Check that a changed proposal invalidates approval and that agent or MCP
   callers cannot approve. Confirm costs and usage limits in each dashboard.

The existing Vercel project has no production environment variables as of the
inspection. No hosted database, email, or Groq configuration has been provisioned
or validated as part of this preparation. A successful local build does not prove
hosted auth, networking, cold starts, tool calls or durable continuation.

Reference: the version-matched first-party documentation bundled in
`node_modules/@agent-native/core/docs/content/` includes `vercel.mdx`,
`deployment.mdx`, `administered-deployments.mdx`, and
`durable-background-runs.mdx`.
