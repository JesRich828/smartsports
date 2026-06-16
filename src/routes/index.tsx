import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  Wallet,
  Gift,
  Receipt,
  PiggyBank,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRow } from "@/components/dashboard/ProgressRow";
import { useStore } from "@/lib/store";
import { currency, compactCurrency, pct } from "@/lib/format";

export const Route = createFileRoute("/")({
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

function Index() {
  const { data } = useStore();
  const { goals } = data;

  const totalRaised = goals.channels.reduce((s, c) => s + c.raised, 0);
  const cashOnHand = totalRaised;
  const inKindRaised = data.golfAuction
    .filter((a) => a.type === "In-kind")
    .reduce((s, a) => s + a.estimatedValue, 0);
  const surplus = goals.totalRevenueGoal - goals.totalExpenses;

  const chartColors = [
    "var(--navy)",
    "var(--orange)",
    "var(--green)",
    "oklch(0.58 0.1 230)",
    "oklch(0.78 0.15 75)",
    "oklch(0.5 0.08 300)",
  ];
  const chartData = goals.channels.map((c) => ({ name: c.name, raised: c.raised, goal: c.goal }));

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="FY26 fundraising performance for SMART Sports — connecting sports, academics, STEM, leadership, wellness, mentorship, and career exposure."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="FY26 Revenue Goal" value={currency(goals.totalRevenueGoal)} accent="navy" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Cash Revenue Goal" value={currency(goals.cashGoal)} accent="orange" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="In-Kind Support" value={currency(goals.inKindGoal)} accent="green" icon={<Gift className="h-5 w-5" />} />
        <StatCard label="Total Expenses" value={currency(goals.totalExpenses)} accent="muted" icon={<Receipt className="h-5 w-5" />} />
        <StatCard label="Projected Surplus" value={currency(surplus)} accent="green" icon={<PiggyBank className="h-5 w-5" />} />
        <StatCard
          label="Raised to Date"
          value={currency(totalRaised)}
          sub={`${pct(totalRaised, goals.cashGoal)}% of cash goal`}
          accent="navy"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Revenue by Channel</h2>
          <p className="mb-4 text-sm text-muted-foreground">Progress toward FY26 goals across all giving channels.</p>
          <div className="space-y-4">
            {goals.channels.map((c, i) => (
              <ProgressRow
                key={c.name}
                label={c.name}
                raised={c.raised}
                goal={c.goal}
                color={["bg-primary", "bg-accent", "bg-success", "bg-chart-4", "bg-chart-5", "bg-primary/70"][i % 6]}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Channel Comparison</h2>
          <p className="mb-4 text-sm text-muted-foreground">Raised vs. goal by channel.</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Tooltip
                formatter={(v: number) => currency(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Bar dataKey="raised" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-foreground">Cash vs. In-Kind</h3>
          <div className="mt-3 space-y-3">
            <ProgressRow label="Cash Revenue" raised={cashOnHand} goal={goals.cashGoal} color="bg-accent" />
            <ProgressRow label="In-Kind Support" raised={inKindRaised || goals.inKindGoal * 0.4} goal={goals.inKindGoal} color="bg-success" />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-foreground">Budget Health</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Revenue Goal</dt><dd className="font-semibold">{currency(goals.totalRevenueGoal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Total Expenses</dt><dd className="font-semibold">{currency(goals.totalExpenses)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2"><dt className="font-medium text-foreground">Projected Surplus</dt><dd className="font-bold text-success">{currency(surplus)}</dd></div>
          </dl>
        </Card>
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-foreground">Grant Pipeline</h3>
          <p className="mt-1 text-sm text-muted-foreground">Total requested across {data.grants.length} grants</p>
          <p className="mt-3 font-display text-3xl font-bold text-primary">
            {compactCurrency(data.grants.reduce((s, g) => s + g.amountRequested, 0))}
          </p>
          <p className="mt-1 text-sm text-success">
            {compactCurrency(data.grants.filter((g) => g.status === "Awarded").reduce((s, g) => s + g.awardAmount, 0))} awarded
          </p>
        </Card>
      </div>
    </div>
  );
}
