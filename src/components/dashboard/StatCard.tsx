import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "navy" | "orange" | "green" | "muted";
}

const accentMap: Record<string, string> = {
  navy: "bg-primary/10 text-primary",
  orange: "bg-accent/15 text-accent",
  green: "bg-success/15 text-success",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({ label, value, sub, icon, accent = "navy" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accentMap[accent])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}