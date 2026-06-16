import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, FlaskConical, GraduationCap, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboard } from "@/lib/db";
import { currency, compactCurrency } from "@/lib/format";
import { PROGRAMS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/programs")({
  head: () => ({
    meta: [
      { title: "Programs Dashboard — SMART Sports" },
      { name: "description", content: "Fundraising and grants tracked by SMART Sports program." },
    ],
  }),
  component: ProgramsPage,
});

const icons: Record<string, typeof BookOpen> = {
  "Great Lakes Academy Summer Enrichment Program": GraduationCap,
  "Pathways Academic & Leadership Academy": BookOpen,
  "The Kinetic Lab": FlaskConical,
  "General Operating Support": Building2,
};

function ProgramsPage() {
  const { data } = useDashboard();

  const summaries = PROGRAMS.map((program) => {
    const grants = data.grants.filter((g) => g.programFit === program);
    const requested = grants.reduce((s, g) => s + g.amountRequested, 0);
    const awarded = grants.filter((g) => g.status === "Awarded").reduce((s, g) => s + g.awardAmount, 0);
    return { program, grants, requested, awarded };
  });

  return (
    <div>
      <PageHeader
        title="Programs Dashboard"
        description="Fundraising and grant activity broken down by SMART Sports program area."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {summaries.map(({ program, grants, requested, awarded }) => {
          const Icon = icons[program] ?? BookOpen;
          return (
            <Card key={program} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-base font-semibold text-foreground">{program}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Requested: <span className="font-semibold text-foreground">{compactCurrency(requested)}</span></span>
                    <span className="text-muted-foreground">Awarded: <span className="font-semibold text-success">{compactCurrency(awarded)}</span></span>
                    <span className="text-muted-foreground">Grants: <span className="font-semibold text-foreground">{grants.length}</span></span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {grants.length === 0 && <p className="text-sm text-muted-foreground">No grants tagged to this program yet.</p>}
                {grants.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{g.funderName}</p>
                      <p className="text-xs text-muted-foreground">{currency(g.amountRequested)} requested</p>
                    </div>
                    <StatusBadge status={g.status} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}