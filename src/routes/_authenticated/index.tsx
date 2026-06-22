import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  FileText,
  Users,
  Building2,
  Flag,
  Handshake,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboard } from "@/lib/db";
import { currency, compactCurrency, formatDate, daysUntil } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — SMART Sports FY26" },
      { name: "description", content: "FY26 revenue goals, expenses, surplus, and fundraising channel progress for SMART Sports." },
      { property: "og:title", content: "Executive Dashboard — SMART Sports FY26" },
      { property: "og:description", content: "FY26 revenue goals, expenses, surplus, and channel progress." },
    ],
  }),
  component: Index,
});

const CLOSED_GRANT = new Set(["Awarded", "Declined", "Closed"]);
const WON_DONOR = new Set(["Closed - Won", "Closed - Lost"]);
const COMMITTED_SPONSOR = new Set(["Committed", "Declined"]);

function Index() {
  const { data } = useDashboard();

  // Golf event revenue: sponsors + foursomes + players + auction
  const golfSponsorRev = data.golfSponsors.reduce((s, g) => s + (g.amount || 0), 0);
  const golfFoursomeRev = data.golfFoursomes.reduce((s, g) => s + (g.amount || 0), 0);
  const golfPlayerRev = data.golfPlayers.reduce((s, g) => s + (g.amount || 0), 0);
  const golfAuctionRev = data.golfAuction.reduce((s, a) => s + (a.estimatedValue || 0), 0);
  const golfRevenue = golfSponsorRev + golfFoursomeRev + golfPlayerRev + golfAuctionRev;

  // Grant pipeline: open (not closed) requested value
  const grantPipeline = data.grants
    .filter((g) => !CLOSED_GRANT.has(g.status))
    .reduce((s, g) => s + (g.amountRequested || 0), 0);
  const grantsAwarded = data.grants
    .filter((g) => g.status === "Awarded")
    .reduce((s, g) => s + (g.awardAmount || 0), 0);

  // Major donor pipeline: open ask amounts for major gift prospects
  const donorPipeline = data.donors
    .filter((d) => !WON_DONOR.has(d.stage))
    .reduce((s, d) => s + (d.askAmount || 0), 0);

  // Corporate sponsor pipeline: open commitments
  const sponsorPipeline = data.sponsors
    .filter((s) => !COMMITTED_SPONSOR.has(s.status))
    .reduce((sum, s) => sum + (s.commitment || 0), 0);
  const sponsorsCommitted = data.sponsors
    .filter((s) => s.status === "Committed")
    .reduce((sum, s) => sum + (s.commitment || 0), 0);

  // Board introductions
  const boardIntros = data.board.reduce((s, b) => s + (b.introductions || 0), 0);

  // Total revenue raised: awarded grants + committed sponsors + golf revenue + closed-won donors
  const donorsWon = data.donors
    .filter((d) => d.stage === "Closed - Won")
    .reduce((s, d) => s + (d.askAmount || 0), 0);
  const totalRaised = grantsAwarded + sponsorsCommitted + golfRevenue + donorsWon;

  // Upcoming deadlines from grant dates
  type Deadline = { label: string; date: string; kind: string };
  const deadlines: Deadline[] = [];
  for (const g of data.grants) {
    if (g.loiDueDate) deadlines.push({ label: g.funderName, date: g.loiDueDate, kind: "LOI Due" });
    if (g.applicationDueDate) deadlines.push({ label: g.funderName, date: g.applicationDueDate, kind: "Application Due" });
    if (g.reportDueDate) deadlines.push({ label: g.funderName, date: g.reportDueDate, kind: "Report Due" });
    if (!g.loiDueDate && !g.applicationDueDate && g.deadline) deadlines.push({ label: g.funderName, date: g.deadline, kind: "Deadline" });
  }
  const upcoming = deadlines
    .map((d) => ({ ...d, days: daysUntil(d.date) }))
    .filter((d) => d.days !== null && d.days >= 0)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
    .slice(0, 6);

  // Pipeline by source chart
  const pipelineData = [
    { name: "Grants", value: grantPipeline },
    { name: "Major Donors", value: donorPipeline },
    { name: "Corp. Sponsors", value: sponsorPipeline },
    { name: "Golf Event", value: golfRevenue },
  ];

  // Revenue raised vs pipeline (potential)
  const totalPipeline = grantPipeline + donorPipeline + sponsorPipeline;

  const pieColors = ["var(--navy)", "var(--orange)", "var(--green)", "oklch(0.58 0.1 230)"];

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="FY26 fundraising performance for SMART Sports — connecting sports, academics, STEM, leadership, wellness, mentorship, and career exposure."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Revenue Raised"
          value={currency(totalRaised)}
          sub="Awarded + committed + golf"
          accent="green"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Grant Pipeline"
          value={currency(grantPipeline)}
          sub={`${compactCurrency(grantsAwarded)} awarded`}
          accent="navy"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Major Donor Pipeline"
          value={currency(donorPipeline)}
          sub={`${data.donors.length} prospects`}
          accent="orange"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Corporate Sponsor Pipeline"
          value={currency(sponsorPipeline)}
          sub={`${compactCurrency(sponsorsCommitted)} committed`}
          accent="navy"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="Golf Event Revenue"
          value={currency(golfRevenue)}
          sub={`${data.golfSponsors.length + data.golfFoursomes.length} commitments`}
          accent="green"
          icon={<Flag className="h-5 w-5" />}
        />
        <StatCard
          label="Board Introductions"
          value={String(boardIntros)}
          sub={`Across ${data.board.length} members`}
          accent="orange"
          icon={<Handshake className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Pipeline by Source</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Open opportunity value across each fundraising channel.
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipelineData} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={56} />
              <Tooltip
                formatter={(v: number) => currency(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pipelineData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Pipeline Mix</h2>
          <p className="mb-4 text-sm text-muted-foreground">Share of {compactCurrency(totalPipeline + golfRevenue)} total opportunity.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pipelineData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {pipelineData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => currency(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-semibold text-foreground">Upcoming Deadlines</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Next grant LOIs, applications, and reports due.</p>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No upcoming deadlines.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.kind} · {formatDate(d.date)}</p>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " +
                      ((d.days ?? 99) <= 7
                        ? "bg-destructive/10 text-destructive"
                        : (d.days ?? 99) <= 30
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground")
                    }
                  >
                    {d.days === 0 ? "Today" : `${d.days}d`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Revenue Snapshot</h2>
          <p className="mb-4 text-sm text-muted-foreground">Secured revenue by source.</p>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Grants Awarded</dt>
              <dd className="font-semibold text-foreground">{currency(grantsAwarded)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Sponsors Committed</dt>
              <dd className="font-semibold text-foreground">{currency(sponsorsCommitted)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Golf Event</dt>
              <dd className="font-semibold text-foreground">{currency(golfRevenue)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Donor Gifts</dt>
              <dd className="font-semibold text-foreground">{currency(donorsWon)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="font-medium text-foreground">Total Raised</dt>
              <dd className="font-bold text-success">{currency(totalRaised)}</dd>
            </div>
          </dl>
          {totalPipeline > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{compactCurrency(totalPipeline)} in open pipeline could be converted this fiscal year.</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
