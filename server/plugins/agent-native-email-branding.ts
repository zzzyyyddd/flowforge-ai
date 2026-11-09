import { defineAppConfig } from "@agent-native/core/server";

export default defineAppConfig({
  agent: {
    engine: process.env.AGENT_ENGINE?.trim() || "ai-sdk:groq",
    model: process.env.AGENT_MODEL?.trim() || "llama-3.3-70b-versatile",
    // Keep the interactive completion budget within the model's limits.
    mainChatMaxOutputTokens: 4096,
    emptyResponseRetryMaxOutputTokens: 4096,
  },
  app: {
    // This name appears in transactional emails. Change it to your product name.
    name: "FlowForge AI",
    // The source template keeps a renamed app from inheriting first-party email branding.
    sourceTemplate: "chat",
    // Keep the template's authenticated entry explicit after renaming the app.
    homePath: "/studio",
    // Optional: use your own absolute HTTPS logo URL in transactional emails.
    // logoUrl: "https://example.com/logo.png",
  },
});
