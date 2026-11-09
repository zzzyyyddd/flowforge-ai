import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import {
  IconActivity,
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconDownload,
  IconGitBranch,
  IconPlayerPlay,
  IconRefresh,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import type { Audit } from "../../server/db/schema";
import {
  baseline,
  type Patch,
  type Scenario,
  type Simulation,
} from "../../server/lib/recovery";

import "../studio.css";

type Case = {
  id: string;
  scenario: Scenario;
  revision: number;
  proposal: Patch | null;
  before: Simulation | null;
  after: Simulation | null;
  approvedRevision: number | null;
  appliedRevision: number | null;
  audit: Audit[];
  createdAt: string;
};
const scenarios: Record<Scenario, { label: string; summary: string }> = {
  payment_timeout: {
    label: "Payment timeout",
    summary: "A capture succeeds but its response is lost.",
  },
  inventory_shortage: {
    label: "Inventory shortage",
    summary: "An order requests more stock than is available.",
  },
  duplicate_webhook: {
    label: "Duplicate webhook",
    summary: "A payment event is delivered more than once.",
  },
};
const stages = [
  "Order received",
  "Inventory check",
  "Capture payment",
  "Recovery",
];
function label(s: Scenario) {
  return scenarios[s].label;
}
function report(c: Case) {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          product: "FlowForge AI",
          notice:
            "Synthetic workflow simulation. No real transactions occurred.",
          exportedAt: new Date().toISOString(),
          case: c,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flowforge-recovery-${c.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function Trace({ simulation }: { simulation: Simulation }) {
  return (
    <div className="ff-events">
      {simulation.events.map((ev, i) => (
        <div className="ff-event" key={`${ev.step}-${i}`}>
          <div className={`ff-event-dot ${ev.status}`}>
            {ev.status === "failed" ? (
              <IconX size={13} />
            ) : ev.status === "passed" ? (
              <IconCheck size={13} />
            ) : (
              <IconClock size={13} />
            )}
          </div>
          <div>
            <strong>{ev.step}</strong>
            <p>{ev.detail}</p>
          </div>
          <time>+{ev.atMs} ms</time>
        </div>
      ))}
    </div>
  );
}
export default function Studio() {
  const [params, setParams] = useSearchParams();
  const id = params.get("case") ?? "";
  const [scenario, setScenario] = useState<Scenario>("payment_timeout");
  const [selected, setSelected] = useState("Capture payment");
  const [draft, setDraft] = useState<Patch>(baseline);
  const list = useActionQuery("list-recoveries", {});
  const detail = useActionQuery("inspect-recovery", { id }, { enabled: !!id });
  const c = detail.data as Case | undefined;
  const error = (e: unknown) =>
    toast.error(actionErrorMessage(e) ?? "The action could not be completed.");
  const create = useActionMutation("create-recovery", {
    onError: error,
    onSuccess: (v) => {
      setParams({ case: v.id });
      toast.success("Simulation case created");
    },
  });
  const run = useActionMutation("run-recovery", {
    onError: error,
    onSuccess: (v) => toast.success(v.message),
  });
  const propose = useActionMutation("propose-recovery", {
    onError: error,
    onSuccess: () =>
      toast.success("Patch saved. Run verification before approval."),
  });
  const approve = useActionMutation("approve-recovery", {
    onError: error,
    onSuccess: () => toast.success("Patch revision approved"),
  });
  useEffect(() => {
    setDraft(c?.proposal ?? baseline);
  }, [c?.id, c?.revision]);
  const busy =
    create.isPending || run.isPending || propose.isPending || approve.isPending;
  const dirty =
    !!c?.proposal && JSON.stringify(draft) !== JSON.stringify(c.proposal);
  const initial = () => create.mutate({ scenario });
  const activeEvent = c?.before?.events.find((e) => e.step === selected);
  const saved = !!c?.proposal && !dirty;
  return (
    <main className="ff-shell">
      <div className="ff-top">
        <div>
          <div className="ff-breadcrumb">
            WORKSPACE <span>/</span> RECOVERY STUDIO
          </div>
          <h1>Workflow recovery</h1>
        </div>
        <div className="ff-top-actions">
          <span className="ff-sim-badge">
            <span /> SIMULATION MODE
          </span>
          {c && (
            <Button variant="outline" size="sm" onClick={() => report(c)}>
              <IconDownload size={16} /> Export report
            </Button>
          )}
        </div>
      </div>
      <div className="ff-intro">
        <div>
          <span className="ff-kicker">ORDER OPERATIONS / 01</span>
          <h2>Order-to-Payment</h2>
          <p>Investigate failures, test a fix, and recover with confidence.</p>
        </div>
        <div className="ff-scenario">
          <label htmlFor="scenario">Failure scenario</label>
          <div>
            <select
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value as Scenario)}
            >
              {Object.entries(scenarios).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label}
                </option>
              ))}
            </select>
            <Button onClick={initial} disabled={busy}>
              <IconPlayerPlay size={16} />{" "}
              {create.isPending ? "Creating…" : "New simulation"}
            </Button>
          </div>
        </div>
      </div>
      <div className="ff-layout">
        <div className="ff-main">
          <section className="ff-panel">
            <div className="ff-panel-head">
              <div>
                <div className="ff-kicker">BASELINE WORKFLOW CANVAS</div>
                <h3>
                  Order-to-Payment <span className="ff-version">v1.0</span>
                </h3>
              </div>
              <span className="ff-muted">Select a step to inspect</span>
            </div>
            <div className="ff-canvas">
              <div className="ff-flow">
                {stages.map((stage, i) => {
                  const ev = c?.before?.events.find((e) => e.step === stage);
                  const failed = ev?.status === "failed";
                  return (
                    <div className="ff-flow-item" key={stage}>
                      <button
                        className={`ff-node ${selected === stage ? "selected" : ""} ${failed ? "failed" : ""}`}
                        onClick={() => setSelected(stage)}
                      >
                        <span className="ff-node-icon">
                          {i === 0 ? (
                            <IconBolt size={18} />
                          ) : i === 1 ? (
                            <IconGitBranch size={18} />
                          ) : i === 2 ? (
                            <IconActivity size={18} />
                          ) : (
                            <IconRefresh size={18} />
                          )}
                        </span>
                        <span>
                          <small>0{i + 1} / STEP</small>
                          <strong>{stage}</strong>
                          <em>{ev?.status ?? "Ready"}</em>
                        </span>
                      </button>
                      {i < stages.length - 1 && (
                        <IconArrowRight className="ff-arrow" size={17} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="ff-canvas-footer">
                <span>
                  <span className="ff-dot" /> Synthetic environment
                </span>
                <span>
                  {c
                    ? `CASE ${c.id.slice(0, 8).toUpperCase()}`
                    : "NO CASE SELECTED"}
                </span>
              </div>
            </div>
          </section>
          <section className="ff-panel ff-timeline">
            <div className="ff-panel-head">
              <div>
                <div className="ff-kicker">EXECUTION TRACE</div>
                <h3>Timeline & diagnostics</h3>
              </div>
              {c && (
                <Button
                  size="sm"
                  onClick={() =>
                    run.mutate({ id: c.id, operation: "baseline" })
                  }
                  disabled={busy}
                >
                  <IconPlayerPlay size={15} />{" "}
                  {run.isPending ? "Running…" : "Run baseline"}
                </Button>
              )}
            </div>
            {!c ? (
              <div className="ff-empty">
                <IconActivity size={22} />
                <strong>Start with a scenario</strong>
                <span>Create a simulation to inspect its execution trace.</span>
              </div>
            ) : !c.before ? (
              <div className="ff-empty">
                <IconPlayerPlay size={22} />
                <strong>Ready to simulate</strong>
                <span>Run the baseline to reveal the failure.</span>
              </div>
            ) : (
              <>
                <div className="ff-trace-label">
                  <strong>Before · baseline</strong>
                  <span>
                    {c.before.success ? "Passed" : "Failed"} · original
                    simulation
                  </span>
                </div>
                <Trace simulation={c.before} />
                {c.after && (
                  <>
                    <div
                      className={`ff-trace-label ${c.after.success ? "ff-trace-after" : ""}`}
                    >
                      <strong>
                        {c.appliedRevision === c.revision
                          ? "After · applied recovery"
                          : "After · verification"}{" "}
                        / rev {c.revision}
                      </strong>
                      <span>
                        {c.after.success ? "Passed" : "Failed"} ·{" "}
                        {c.after.duplicateCaptures} duplicate capture(s)
                      </span>
                    </div>
                    <Trace simulation={c.after} />
                  </>
                )}
              </>
            )}
          </section>
          {c?.proposal && (
            <section className="ff-panel ff-patch">
              <div className="ff-panel-head">
                <div>
                  <div className="ff-kicker">
                    CHANGE REVIEW / REV {c.revision}
                  </div>
                  <h3>Proposed patch</h3>
                </div>
                <span className="ff-state">
                  {c.appliedRevision === c.revision
                    ? "APPLIED"
                    : c.approvedRevision === c.revision
                      ? "APPROVED"
                      : "REVIEW REQUIRED"}
                </span>
              </div>
              <p className="ff-rationale">{c.proposal.rationale}</p>
              <div className="ff-diff">
                <div>
                  <span>BEFORE</span>
                  <pre>
                    {JSON.stringify(
                      { ...baseline, rationale: undefined },
                      null,
                      2,
                    )}
                  </pre>
                </div>
                <div>
                  <span>AFTER · EDITABLE</span>
                  <div className="ff-edit">
                    <label>
                      Retries
                      <Input
                        type="number"
                        min={0}
                        max={5}
                        value={draft.retryCount}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            retryCount: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      Timeout (ms)
                      <Input
                        type="number"
                        min={100}
                        max={30000}
                        value={draft.timeoutMs}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            timeoutMs: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    {(
                      [
                        ["idempotency", "Idempotency key"],
                        ["reserveInventory", "Reserve / backorder"],
                        ["deduplicateWebhook", "Deduplicate webhook"],
                      ] as const
                    ).map(([key, title]) => (
                      <label className="ff-check" key={key}>
                        <input
                          type="checkbox"
                          checked={draft[key]}
                          onChange={(e) =>
                            setDraft({ ...draft, [key]: e.target.checked })
                          }
                        />
                        {title}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <label className="ff-rationale-edit">
                Rationale
                <Input
                  value={draft.rationale}
                  onChange={(e) =>
                    setDraft({ ...draft, rationale: e.target.value })
                  }
                />
              </label>
              <div className="ff-actions">
                {dirty && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => propose.mutate({ id: c.id, patch: draft })}
                  >
                    Save edits
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={busy || !saved || c.appliedRevision === c.revision}
                  onClick={() => run.mutate({ id: c.id, operation: "verify" })}
                >
                  Run before / after
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    busy ||
                    !saved ||
                    !c.after?.success ||
                    c.approvedRevision === c.revision
                  }
                  onClick={() =>
                    approve.mutate({ id: c.id, revision: c.revision })
                  }
                >
                  <IconShieldCheck size={16} /> Approve patch
                </Button>
                <Button
                  disabled={
                    busy ||
                    !saved ||
                    c.approvedRevision !== c.revision ||
                    c.appliedRevision === c.revision
                  }
                  onClick={() => run.mutate({ id: c.id, operation: "apply" })}
                >
                  Apply approved patch
                </Button>
              </div>
              {c.after && (
                <div
                  className={`ff-verification ${c.after.success ? "good" : "bad"}`}
                >
                  <IconCircleCheck size={18} />
                  <div>
                    <strong>
                      {c.after.success
                        ? "Recovery simulation passed"
                        : "Recovery simulation failed"}
                    </strong>
                    <span>
                      Before: {c.before?.captures ?? 0} capture(s) · After:{" "}
                      {c.after.captures} capture(s) · Duplicate captures:{" "}
                      {c.after.duplicateCaptures}
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
        <aside className="ff-rail">
          <section className="ff-panel ff-diagnostic">
            <div className="ff-kicker">BASELINE INSPECTOR</div>
            <h3>{selected}</h3>
            <div className="ff-inspector-state">
              {activeEvent?.status === "failed"
                ? "FAILURE DETECTED"
                : (activeEvent?.status?.toUpperCase() ?? "AWAITING RUN")}
            </div>
            <p>
              {activeEvent?.detail ??
                "Select a workflow step after running a simulation to inspect its result."}
            </p>
            {c?.before && (
              <>
                <div className="ff-divider" />
                <div className="ff-kicker">NEXT STEP</div>
                <h4>Investigate with the agent</h4>
                <p>
                  The agent will inspect the execution and propose a structured
                  fix for your review.
                </p>
                <Button
                  className="ff-agent"
                  onClick={() =>
                    sendToAgentChat({
                      message: `Investigate recovery case ${c.id}. Call inspect-recovery to examine the execution evidence, explain the root cause, then call propose-recovery with a structured fix. Do not approve or apply the patch.`,
                      context: JSON.stringify({ caseId: c.id, view: "studio" }),
                      submit: true,
                      openSidebar: true,
                    })
                  }
                >
                  Investigate failure <IconArrowRight size={16} />
                </Button>
                <small>Requires a configured AI provider.</small>
              </>
            )}
          </section>
          <section className="ff-panel ff-history">
            <div className="ff-kicker">ACTIVITY</div>
            <h3>Audit history</h3>
            {c?.audit.length ? (
              <ol>
                {[...c.audit].reverse().map((a, i) => (
                  <li key={`${a.at}-${i}`}>
                    <strong>{a.action}</strong>
                    <span>{a.detail}</span>
                    <small>
                      {a.actor} · {new Date(a.at).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ol>
            ) : (
              <p>Actions and decisions will appear here.</p>
            )}
          </section>
          <section className="ff-panel ff-recent">
            <div className="ff-kicker">RECENT CASES</div>
            {list.isPending ? (
              <Skeleton className="h-12 w-full" />
            ) : list.data?.cases?.length ? (
              list.data.cases.map(
                (item: { id: string; scenario: Scenario }) => (
                  <button
                    key={item.id}
                    onClick={() => setParams({ case: item.id })}
                  >
                    <span>{label(item.scenario)}</span>
                    <small>
                      {item.id.slice(0, 8)} <IconArrowRight size={13} />
                    </small>
                  </button>
                ),
              )
            ) : (
              <p>No cases yet.</p>
            )}
          </section>
        </aside>
      </div>
      {detail.isError && (
        <p className="ff-error">
          Could not load this case. Select a recent case or create a new one.
        </p>
      )}
    </main>
  );
}
