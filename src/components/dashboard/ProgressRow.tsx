import { currency, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProgressRowProps {
  label: string;
  raised: number;
  goal: number;
  color?: string;
}

export function ProgressRow({ label, raised, goal, color = "bg-accent" }: ProgressRowProps) {
  const percentage = pct(raised, goal);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {currency(raised)} <span className="text-muted-foreground/60">/ {currency(goal)}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs font-semibold text-muted-foreground">{percentage}%</div>
    </div>
  );
}