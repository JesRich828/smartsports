import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  FileText,
  Mail,
  Handshake,
  ClipboardList,
  Presentation,
  Activity,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDashboard } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { currency, formatDate } from "@/lib/format";
import { generateDocument, type AssistantType } from "@/lib/api/assistants.functions";
import type { AppData } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/assistants")({
  head: () => ({
    meta: [
      { title: "AI Assistants — SMART Sports FY26" },
      {
        name: "description",
        content:
          "AI assistants that draft grant proposals, donor emails, sponsorship letters, meeting briefs, board reports, and activity summaries.",
      },
    ],
  }),
  component: AssistantsPage,
});

type RecordSource = "grant" | "donor" | "sponsor" | "none";

interface AssistantDef {
  type: AssistantType;
  label: string;
  blurb: string;
  icon: typeof FileText;
  source: RecordSource;
  placeholder: string;
  usesSnapshot?: boolean;
}

const ASSISTANTS: AssistantDef[] = [
  {
    type: "grant_proposal",
    label: "Grant Proposal",
    blurb: "Draft a full, fundable proposal tailored to a funder.",
    icon: FileText,
    source: "grant",
    placeholder:
      "e.g. Emphasize summer enrichment outcomes and request $25,000 for the Great Lakes Academy program.",
  },
  {
    type: "donor_email",
    label: "Donor Email",
    blurb: "Personalized cultivation, solicitation, or thank-you emails.",
    icon: Mail,
    source: "donor",
    placeholder:
      "e.g. Warm cultivation email inviting them to a program tour; no ask yet.",
  },
  {
    type: "sponsorship_letter",
    label: "Sponsorship Letter",
    blurb: "Corporate sponsorship letters tied to benefits and impact.",
    icon: Handshake,
    source: "sponsor",
    placeholder:
      "e.g. Invite them to be the Presenting Sponsor of the FY26 Golf Invitational.",
  },
  {
    type: "meeting_brief",
    label: "Meeting Brief",
    blurb: "Prep brief with background, talking points, and the ask.",
    icon: ClipboardList,
    source: "donor",
    placeholder: "e.g. 30-minute coffee meeting to discuss a possible $10,000 gift.",
  },
  {
    type: "board_report",
    label: "Board Report",
    blurb: "Data-driven report for the board using current numbers.",
    icon: Presentation,
    source: "none",
    placeholder: "e.g. Cover Q2 FY26 and highlight grant wins and golf event progress.",
    usesSnapshot: true,
  },
  {
    type: "activity_summary",
    label: "Activity Summary",
    blurb: "Summarize recent fundraising activity into a crisp update.",
    icon: Activity,
    source: "none",
    placeholder: "e.g. Weekly internal update for the development team.",
    usesSnapshot: true,
  },
];

function buildSnapshot(data: AppData): string {
  const { grants, donors, sponsors, goals } = data;
  const awarded = grants.filter((g) => g.status === "Awarded");
  const openGrants = grants.filter((g) =>
    ["Submitted", "Pending", "Application Drafting", "LOI Submitted", "Invited to Apply", "LOI Drafting"].includes(g.status),
  );
  const majorGifts = donors.filter((d) => d.type === "Major Gift Prospect");
  const corp = sponsors.filter((s) => s.status !== "Declined");
  const cashRaised = goals.channels.reduce((s, c) => s + c.raised, 0);

  const golfSponsor = data.golfSponsors.filter((s) => s.confirmed).reduce((s, x) => s + x.amount, 0);
  const golfFoursome = data.golfFoursomes.reduce((s, x) => s + x.amount, 0);
  const golfPlayer = data.golfPlayers.reduce((s, x) => s + x.amount, 0);
  const golfRevenue = golfSponsor + golfFoursome + golfPlayer;

  const lines: string[] = [];
  lines.push(`FY26 revenue goal: ${currency(goals.totalRevenueGoal)} (cash goal ${currency(goals.cashGoal)}, in-kind goal ${currency(goals.inKindGoal)}).`);
  lines.push(`Cash raised to date: ${currency(cashRaised)}.`);
  lines.push(`Grants: ${awarded.length} awarded totaling ${currency(awarded.reduce((s, g) => s + (g.awardAmount || 0), 0))}; ${openGrants.length} open proposals totaling ${currency(openGrants.reduce((s, g) => s + (g.amountRequested || 0), 0))}.`);
  lines.push(`Major gift pipeline: ${majorGifts.length} prospects, asks totaling ${currency(majorGifts.reduce((s, d) => s + (d.askAmount || 0), 0))}.`);
  lines.push(`Corporate sponsors: ${corp.length} active, commitments totaling ${currency(corp.reduce((s, s2) => s + (s2.commitment || 0), 0))}.`);
  lines.push(`Golf Invitational revenue so far: ${currency(golfRevenue)} (sponsors ${currency(golfSponsor)}, foursomes ${currency(golfFoursome)}, players ${currency(golfPlayer)}).`);

  const upcoming = grants
    .filter((g) => g.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 6)
    .map((g) => `${g.funderName} — ${formatDate(g.deadline)} (${g.status})`);
  if (upcoming.length) lines.push(`Upcoming grant deadlines: ${upcoming.join("; ")}.`);

  return lines.join("\n");
}

function AssistantsPage() {
  const { data } = useDashboard();
  const [activeType, setActiveType] = useState<AssistantType>("grant_proposal");
  const [recordId, setRecordId] = useState<string>("");
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orgName, setOrgName] = useState("SMART Sports");

  useEffect(() => {
    supabase
      .from("organization_settings")
      .select("org_name")
      .single()
      .then(({ data: settings, error }) => {
        if (settings && !error && settings.org_name) setOrgName(settings.org_name);
      });
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.title.includes("SMART Sports")) {
      document.title = document.title.replace(/SMART Sports/g, orgName);
    }
    document.querySelectorAll("meta").forEach((m) => {
      const c = m.getAttribute("content");
      if (c && c.includes("SMART Sports")) {
        m.setAttribute("content", c.replace(/SMART Sports/g, orgName));
      }
    });
  }, [orgName]);

  const run = useServerFn(generateDocument);
  const active = ASSISTANTS.find((a) => a.type === activeType)!;

  const records = useMemo(() => {
    if (active.source === "grant")
      return data.grants.map((g) => ({ id: g.id, label: `${g.funderName} — ${g.programFit}` }));
    if (active.source === "donor")
      return data.donors.map((d) => ({ id: d.id, label: `${d.name}${d.organization ? ` (${d.organization})` : ""}` }));
    if (active.source === "sponsor")
      return data.sponsors.map((s) => ({ id: s.id, label: `${s.company} — ${s.sponsorship_level || "—"}` }));
    return [];
  }, [active.source, data]);

  function selectAssistant(type: AssistantType) {
    setActiveType(type);
    setRecordId("");
    setInstructions("");
    setResult("");
  }

  function buildRecordContext(): string {
    if (active.source === "grant") {
      const g = data.grants.find((x) => x.id === recordId);
      if (!g) return "";
      return [
        `Funder: ${g.funderName}`,
        `Program fit: ${g.programFit}`,
        `Priority area: ${g.priorityArea}`,
        `Amount requested: ${currency(g.amountRequested)}`,
        `Deadline: ${formatDate(g.deadline)}`,
        `Status: ${g.status}`,
        g.contactName ? `Funder contact: ${g.contactName}` : "",
        g.relationshipNotes ? `Relationship notes: ${g.relationshipNotes}` : "",
        g.notes ? `Notes: ${g.notes}` : "",
      ].filter(Boolean).join("\n");
    }
    if (active.source === "donor") {
      const d = data.donors.find((x) => x.id === recordId);
      if (!d) return "";
      return [
        `Name: ${d.name}`,
        d.organization ? `Organization: ${d.organization}` : "",
        `Type: ${d.type}`,
        d.givingCapacity ? `Giving capacity: ${d.givingCapacity}` : "",
        d.interestArea ? `Interest area: ${d.interestArea}` : "",
        d.connection ? `Connection: ${d.connection}` : "",
        `Stage: ${d.stage}`,
        d.askAmount ? `Ask amount: ${currency(d.askAmount)}` : "",
        d.lastContact ? `Last contact: ${formatDate(d.lastContact)}` : "",
        d.nextStep ? `Next step: ${d.nextStep}` : "",
        d.notes ? `Notes: ${d.notes}` : "",
      ].filter(Boolean).join("\n");
    }
    if (active.source === "sponsor") {
      const s = data.sponsors.find((x) => x.id === recordId);
      if (!s) return "";
      return [
        `Company: ${s.company}`,
        `Sponsorship level: ${s.sponsorship_level}`,
        s.commitment ? `Commitment: ${currency(s.commitment)}` : "",
        `Status: ${s.status}`,
        s.contact ? `Contact: ${s.contact}` : "",
      ].filter(Boolean).join("\n");
    }
    return "";
  }

  async function handleGenerate() {
    setLoading(true);
    setResult("");
    try {
      const parts = [buildRecordContext()];
      if (active.usesSnapshot) parts.push(buildSnapshot(data));
      const context = parts.filter(Boolean).join("\n\n");
      const res = await run({ data: { type: activeType, instructions, context } });
      setResult(res.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <PageHeader
        title="AI Assistants"
        description="Draft proposals, emails, letters, briefs, and reports in seconds — grounded in your fundraising data."
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {ASSISTANTS.map((a) => {
            const Icon = a.icon;
            const isActive = a.type === activeType;
            return (
              <button
                key={a.type}
                onClick={() => selectAssistant(a.type)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-secondary/50"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-semibold text-foreground">{a.label}</span>
                  <span className="text-xs text-muted-foreground">{a.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            {active.source !== "none" && (
              <div className="space-y-1.5">
                <Label>
                  {active.source === "grant"
                    ? "Base on grant (optional)"
                    : active.source === "donor"
                      ? "Base on contact (optional)"
                      : "Base on sponsor (optional)"}
                </Label>
                <Select value={recordId} onValueChange={setRecordId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start from scratch" />
                  </SelectTrigger>
                  <SelectContent>
                    {records.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        No records yet
                      </SelectItem>
                    ) : (
                      records.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {active.usesSnapshot && (
              <p className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                This assistant automatically includes a live snapshot of your current grants, donors,
                sponsors, golf event, and FY26 goals.
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={active.placeholder}
                rows={5}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? "Generating…" : `Generate ${active.label}`}
              </Button>
            </div>
          </Card>

          {(result || loading) && (
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">{active.label}</h2>
                {result && (
                  <Button variant="outline" size="sm" onClick={copyResult}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
              {loading && !result ? (
                <div className="flex items-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Drafting your {active.label.toLowerCase()}…
                </div>
              ) : (
                <article className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </article>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}