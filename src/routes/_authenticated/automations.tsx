import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  CalendarClock,
  FileWarning,
  UserRoundCheck,
  CalendarDays,
  Presentation,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboard } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { currency, formatDate, daysUntil } from "@/lib/format";
import { generateDocument } from "@/lib/api/assistants.functions";
import type { AppData } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/automations")({
  head: () => ({
    meta: [
      { title: "Automations — SMART Sports FY26" },
      {
        name: "description",
        content:
          "Automated alerts for grant deadlines, reports due, and donor follow-ups, plus one-click weekly and monthly fundraising reports.",
      },
      { property: "og:title", content: "Automations — SMART Sports FY26" },
      {
        property: "og:description",
        content:
          "Automated alerts for grant deadlines, reports due, and donor follow-ups, plus one-click weekly and monthly fundraising reports.",
      },
    ],
  }),
  component: AutomationsPage,
});

const WINDOW_DAYS = 30;
const LAPSED_DAYS = 30;
const FOLLOWUP_DAYS = 7;

function urgency(days: number): "navy" | "orange" | "green" | "muted" {
  if (days < 0) return "orange";
  if (days <= 7) return "orange";
  if (days <= 30) return "navy";
  return "muted";
}

function dueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `${days}d left`;
}

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

  const lines: string[] = [];
  lines.push(`FY26 revenue goal: ${currency(goals.totalRevenueGoal)} (cash ${currency(goals.cashGoal)}, in-kind ${currency(goals.inKindGoal)}).`);
  lines.push(`Cash raised to date: ${currency(cashRaised)}.`);
  lines.push(`Grants: ${awarded.length} awarded (${currency(awarded.reduce((s, g) => s + (g.awardAmount || 0), 0))}); ${openGrants.length} open proposals (${currency(openGrants.reduce((s, g) => s + (g.amountRequested || 0), 0))}).`);
  lines.push(`Major gift pipeline: ${majorGifts.length} prospects, asks ${currency(majorGifts.reduce((s, d) => s + (d.askAmount || 0), 0))}.`);
  lines.push(`Corporate sponsors: ${corp.length} active, commitments ${currency(corp.reduce((s, x) => s + (x.commitment || 0), 0))}.`);
  lines.push(`Golf Invitational revenue: ${currency(golfSponsor + golfFoursome + golfPlayer)}.`);

  const upcoming = grants
    .filter((g) => g.deadline)
    .map((g) => ({ g, d: daysUntil(g.deadline) ?? 999 }))
    .filter((x) => x.d >= 0 && x.d <= 45)
    .sort((a, b) => a.d - b.d)
    .map((x) => `${x.g.funderName} — ${formatDate(x.g.deadline)} (${x.g.status})`);
  if (upcoming.length) lines.push(`Deadlines in next 45 days: ${upcoming.join("; ")}.`);
  return lines.join("\n");
}

function AutomationsPage() {
  const { data } = useDashboard();
  const run = useServerFn(generateDocument);
  const [report, setReport] = useState<{ title: string; text: string } | null>(null);
  const [generating, setGenerating] = useState<"weekly" | "monthly" | null>(null);
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

  const deadlines = useMemo(() => {
    return data.grants
      .filter((g) => g.deadline && !["Awarded", "Declined", "Closed"].includes(g.status))
      .map((g) => ({ g, days: daysUntil(g.deadline)! }))
      .filter((x) => x.days !== null && x.days <= WINDOW_DAYS)
      .sort((a, b) => a.days - b.days);
  }, [data.grants]);

  const reportsDue = useMemo(() => {
    return data.grants
      .filter((g) => g.reportDueDate)
      .map((g) => ({ g, days: daysUntil(g.reportDueDate)! }))
      .filter((x) => x.days !== null && x.days <= WINDOW_DAYS)
      .sort((a, b) => a.days - b.days);
  }, [data.grants]);

  const followUps = useMemo(() => {
    const activeStages = ["Identification", "Qualification", "Cultivation", "Solicitation", "Stewardship"];
    return data.donors
      .filter((d) => activeStages.includes(String(d.stage)))
      .map((d) => {
        const sinceContact = d.lastContact ? -(daysUntil(d.lastContact) ?? 0) : null;
        const lapsed = sinceContact === null || sinceContact >= LAPSED_DAYS;
        return { d, sinceContact, lapsed };
      })
      .filter((x) => x.lapsed || (x.d.nextStep && x.d.nextStep.trim().length > 0))
      .sort((a, b) => (b.sinceContact ?? 9999) - (a.sinceContact ?? 9999));
  }, [data.donors]);

  async function generate(kind: "weekly" | "monthly") {
    setGenerating(kind);
    setReport(null);
    try {
      const snapshot = buildSnapshot(data);
      const isWeekly = kind === "weekly";
      const res = await run({
        data: {
          type: isWeekly ? "activity_summary" : "board_report",
          instructions: isWeekly
            ? "Write this week's internal fundraising activity update for the development team. Highlight wins, in-progress work, at-risk items, and recommended focus for next week."
            : "Write this month's board report. Be candid, concise, and decision-oriented for board members.",
          context: snapshot,
        },
      });
      setReport({ title: isWeekly ? "Weekly Fundraising Report" : "Monthly Board Report", text: res.text });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate the report.");
    } finally {
      setGenerating(null);
    }
  }

  async function copyReport() {
    if (!report) return;
    await navigator.clipboard.writeText(report.text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <PageHeader
        title="Automations"
        description="Live alerts and scheduled reports — surfaced automatically from your fundraising data."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Grant deadlines (30d)"
          value={String(deadlines.length)}
          sub={deadlines.some((x) => x.days < 0) ? `${deadlines.filter((x) => x.days < 0).length} overdue` : "Upcoming"}
          accent="orange"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatCard
          label="Reports due (30d)"
          value={String(reportsDue.length)}
          sub={reportsDue.some((x) => x.days < 0) ? `${reportsDue.filter((x) => x.days < 0).length} overdue` : "Upcoming"}
          accent="navy"
          icon={<FileWarning className="h-5 w-5" />}
        />
        <StatCard
          label="Donor follow-ups"
          value={String(followUps.length)}
          sub="Need attention"
          accent="green"
          icon={<UserRoundCheck className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grant deadline alerts */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-semibold text-foreground">Grant Deadlines</h2>
            <span className="ml-auto text-xs text-muted-foreground">Within {WINDOW_DAYS} days</span>
          </div>
          {deadlines.length === 0 ? (
            <EmptyRow label="No grant deadlines in the next 30 days." />
          ) : (
            <ul className="space-y-2">
              {deadlines.map(({ g, days }) => (
                <li key={g.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{g.funderName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(g.deadline)} · {g.programFit}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={g.status} />
                    <Badge variant={days < 0 ? "destructive" : "secondary"}>{dueLabel(days)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Reports due */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileWarning className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Reports Due</h2>
            <span className="ml-auto text-xs text-muted-foreground">Within {WINDOW_DAYS} days</span>
          </div>
          {reportsDue.length === 0 ? (
            <EmptyRow label="No grant reports due in the next 30 days." />
          ) : (
            <ul className="space-y-2">
              {reportsDue.map(({ g, days }) => (
                <li key={g.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{g.funderName}</p>
                    <p className="text-xs text-muted-foreground">Report due {formatDate(g.reportDueDate)}</p>
                  </div>
                  <Badge variant={days < 0 ? "destructive" : "secondary"} className="shrink-0">
                    {days < 0 ? <AlertTriangle className="mr-1 h-3 w-3" /> : null}
                    {dueLabel(days)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Donor follow-ups */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <UserRoundCheck className="h-4 w-4 text-success" />
            <h2 className="font-display text-lg font-semibold text-foreground">Donor Follow-Ups</h2>
            <span className="ml-auto text-xs text-muted-foreground">Lapsed {LAPSED_DAYS}+ days or with an open next step</span>
          </div>
          {followUps.length === 0 ? (
            <EmptyRow label="No donor follow-ups need attention right now." />
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {followUps.map(({ d, sinceContact }) => (
                <div key={d.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.organization ? `${d.organization} · ` : ""}
                      {String(d.stage)}
                    </p>
                    {d.nextStep ? (
                      <p className="mt-1 text-xs text-foreground/80">Next: {d.nextStep}</p>
                    ) : null}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {sinceContact === null ? "No contact logged" : `${sinceContact}d since contact`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Scheduled reports */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Weekly Fundraising Report</p>
              <p className="text-xs text-muted-foreground">Team activity update from live data</p>
            </div>
          </div>
          <Button onClick={() => generate("weekly")} disabled={generating !== null}>
            {generating === "weekly" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Generate
          </Button>
        </Card>

        <Card className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Presentation className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Monthly Board Report</p>
              <p className="text-xs text-muted-foreground">Board-ready summary from live data</p>
            </div>
          </div>
          <Button onClick={() => generate("monthly")} disabled={generating !== null}>
            {generating === "monthly" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Generate
          </Button>
        </Card>
      </div>

      {(report || generating) && (
        <Card className="mt-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {report?.title ?? (generating === "weekly" ? "Weekly Fundraising Report" : "Monthly Board Report")}
            </h2>
            {report && (
              <Button variant="outline" size="sm" onClick={copyReport}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          {generating && !report ? (
            <div className="flex items-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating report from your latest data…
            </div>
          ) : (
            <article className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{report?.text ?? ""}</ReactMarkdown>
            </article>
          )}
        </Card>
      )}
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{label}</p>;
}