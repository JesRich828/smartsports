import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ProgressRow } from "@/components/dashboard/ProgressRow";
import { useStore } from "@/lib/store";
import { currency, compactCurrency, formatDate, isThisMonth, pct } from "@/lib/format";
import { PROGRAMS } from "@/lib/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SMART Sports FY26" },
      { name: "description", content: "Filtered fundraising reports: grants due, pipelines, event revenue, and budget progress." },
    ],
  }),
  component: ReportsPage,
});

const REPORTS = [
  "Grants due this month",
  "Open proposals",
  "Awarded grants",
  "Declined grants",
  "Corporate sponsor pipeline",
  "Major gift pipeline",
  "Golf event revenue",
  "Program-specific funding",
  "Cash vs. in-kind revenue",
  "FY26 budget progress",
] as const;

function GrantTable({ rows }: { rows: { funderName: string; programFit: string; amountRequested: number; awardAmount: number; status: string; deadline: string; declinedReason?: string }[] }) {
  if (rows.length === 0) return <p className="py-8 text-center text-muted-foreground">No records found.</p>;
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Funder</TableHead><TableHead>Program</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Key Date</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{r.funderName}{r.declinedReason ? <div className="text-xs text-muted-foreground">{r.declinedReason}</div> : null}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{r.programFit}</TableCell>
            <TableCell className="text-right">{currency(r.awardAmount || r.amountRequested)}</TableCell>
            <TableCell><StatusBadge status={r.status} /></TableCell>
            <TableCell className="text-sm">{formatDate(r.deadline)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ReportsPage() {
  const { data } = useStore();
  const [report, setReport] = useState<string>(REPORTS[0]);
  const { grants, donors, goals } = data;

  const golfRevenue = useMemo(() => {
    const sponsor = data.golfSponsors.filter((s) => s.confirmed).reduce((s, x) => s + x.amount, 0);
    const foursome = data.golfFoursomes.reduce((s, x) => s + x.amount, 0);
    const player = data.golfPlayers.reduce((s, x) => s + x.amount, 0);
    const auction = data.golfAuction.filter((a) => a.type === "Auction").reduce((s, a) => s + a.estimatedValue, 0);
    const inKind = data.golfAuction.filter((a) => a.type === "In-kind").reduce((s, a) => s + a.estimatedValue, 0);
    const expenses = data.golfExpenses.reduce((s, e) => s + e.amount, 0);
    const revenue = sponsor + foursome + player + auction;
    return { sponsor, foursome, player, auction, inKind, expenses, revenue, net: revenue - expenses };
  }, [data]);

  function content() {
    switch (report) {
      case "Grants due this month":
        return <GrantTable rows={grants.filter((g) => isThisMonth(g.deadline) || isThisMonth(g.loiDueDate) || isThisMonth(g.applicationDueDate) || isThisMonth(g.reportDueDate))} />;
      case "Open proposals":
        return <GrantTable rows={grants.filter((g) => ["Submitted", "Pending", "Application Drafting", "LOI Submitted", "Invited to Apply", "LOI Drafting"].includes(g.status))} />;
      case "Awarded grants":
        return <GrantTable rows={grants.filter((g) => g.status === "Awarded")} />;
      case "Declined grants":
        return <GrantTable rows={grants.filter((g) => g.status === "Declined")} />;
      case "Corporate sponsor pipeline":
        return <DonorTable rows={donors.filter((d) => d.type === "Corporate Sponsor")} />;
      case "Major gift pipeline":
        return <DonorTable rows={donors.filter((d) => d.type === "Major Gift Prospect")} />;
      case "Golf event revenue":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Sponsorships (confirmed)" value={currency(golfRevenue.sponsor)} accent="orange" />
            <StatCard label="Foursomes" value={currency(golfRevenue.foursome)} accent="navy" />
            <StatCard label="Individual Players" value={currency(golfRevenue.player)} accent="navy" />
            <StatCard label="Auction" value={currency(golfRevenue.auction)} accent="orange" />
            <StatCard label="In-Kind" value={currency(golfRevenue.inKind)} accent="green" />
            <StatCard label="Expenses" value={currency(golfRevenue.expenses)} accent="muted" />
            <StatCard label="Gross Revenue" value={currency(golfRevenue.revenue)} accent="orange" />
            <StatCard label="Net Revenue" value={currency(golfRevenue.net)} accent="green" />
          </div>
        );
      case "Program-specific funding":
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Program</TableHead><TableHead className="text-right">Requested</TableHead><TableHead className="text-right">Awarded</TableHead><TableHead className="text-center">Grants</TableHead></TableRow></TableHeader>
            <TableBody>
              {PROGRAMS.map((p) => {
                const gr = grants.filter((g) => g.programFit === p);
                return (
                  <TableRow key={p}>
                    <TableCell className="font-medium">{p}</TableCell>
                    <TableCell className="text-right">{currency(gr.reduce((s, g) => s + g.amountRequested, 0))}</TableCell>
                    <TableCell className="text-right text-success">{currency(gr.filter((g) => g.status === "Awarded").reduce((s, g) => s + g.awardAmount, 0))}</TableCell>
                    <TableCell className="text-center">{gr.length}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      case "Cash vs. in-kind revenue": {
        const cash = goals.channels.reduce((s, c) => s + c.raised, 0);
        return (
          <div className="space-y-4">
            <ProgressRow label="Cash Revenue" raised={cash} goal={goals.cashGoal} color="bg-accent" />
            <ProgressRow label="In-Kind Support" raised={golfRevenue.inKind} goal={goals.inKindGoal} color="bg-success" />
          </div>
        );
      }
      case "FY26 budget progress": {
        const raised = goals.channels.reduce((s, c) => s + c.raised, 0);
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Revenue Goal" value={currency(goals.totalRevenueGoal)} accent="navy" />
              <StatCard label="Raised to Date" value={currency(raised)} sub={`${pct(raised, goals.cashGoal)}% of cash goal`} accent="orange" />
              <StatCard label="Projected Surplus" value={currency(goals.totalRevenueGoal - goals.totalExpenses)} accent="green" />
            </div>
            {goals.channels.map((c) => <ProgressRow key={c.name} label={c.name} raised={c.raised} goal={c.goal} color="bg-primary" />)}
          </div>
        );
      }
      default:
        return null;
    }
  }

  return (
    <div>
      <PageHeader title="Reports" description="Filtered views across grants, donors, events, and the FY26 budget." />
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          {REPORTS.map((r) => (
            <button
              key={r}
              onClick={() => setReport(r)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${report === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">{report}</h2>
        {content()}
      </Card>
    </div>
  );
}

function DonorTable({ rows }: { rows: { name: string; organization: string; givingCapacity: string; askAmount: number; stage: string; nextStep: string }[] }) {
  if (rows.length === 0) return <p className="py-8 text-center text-muted-foreground">No records found.</p>;
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Capacity</TableHead><TableHead className="text-right">Ask</TableHead><TableHead>Stage</TableHead><TableHead>Next Step</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.organization}</div></TableCell>
            <TableCell className="text-sm">{r.givingCapacity || "—"}</TableCell>
            <TableCell className="text-right">{currency(r.askAmount)}</TableCell>
            <TableCell><StatusBadge status={String(r.stage)} /></TableCell>
            <TableCell className="text-sm text-muted-foreground">{r.nextStep || "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}