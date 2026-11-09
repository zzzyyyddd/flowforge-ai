import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

import actionsRegistry from "../../.generated/actions-registry.js";
import {
  searchConversationReferences,
  validateConversationReferences,
} from "../lib/composer-references.js";

const INITIAL_TOOL_NAMES = [
  "inspect-recovery",
  "propose-recovery",
];

export default createAgentChatPlugin({
  appId: "flowforge-app",
  mentionProviders: {
    chats: {
      label: "composerSources.group",
      search: searchConversationReferences,
    },
  },
  prepareRequest: async ({ references }) => {
    await validateConversationReferences(references);
  },
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  mcp: { connectorCatalog: [], appApprovalPage: true },
  leanPrompt: true,
  frameworkTools: "minimal",
  corpusTools: "lazy",
  initialToolNames: INITIAL_TOOL_NAMES,
  // The scope also prevents development mode from adding its coding tools to
  // this request. Studio's HTTP actions remain available to the signed-in UI.
  resolveActionSurface: () => ({
    allowedActionNames: INITIAL_TOOL_NAMES,
    actionScope: { workflow: "recovery-investigation" },
  }),
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: `Investigate synthetic recovery cases. Call inspect-recovery with the case ID before diagnosing, then call propose-recovery with an evidence-based patch that preserves idempotency. Report tool failures honestly. Never approve or apply a patch; a human must review and approve a passing simulation in Studio.`,
});
