import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  // Grant statuses
  Researching: "bg-muted text-muted-foreground",
  Qualified: "bg-primary/10 text-primary",
  "Relationship Building": "bg-primary/10 text-primary",
  "LOI Drafting": "bg-warning/15 text-warning-foreground",
  "LOI Submitted": "bg-warning/15 text-warning-foreground",
  "Invited to Apply": "bg-accent/15 text-accent",
  "Application Drafting": "bg-warning/15 text-warning-foreground",
  Submitted: "bg-accent/15 text-accent",
  Pending: "bg-accent/15 text-accent",
  Awarded: "bg-success/15 text-success",
  Declined: "bg-destructive/12 text-destructive",
  "Reporting Due": "bg-warning/20 text-warning-foreground",
  Closed: "bg-muted text-muted-foreground",
  // Donor stages
  Identification: "bg-muted text-muted-foreground",
  Qualification: "bg-primary/10 text-primary",
  Cultivation: "bg-accent/15 text-accent",
  Solicitation: "bg-warning/15 text-warning-foreground",
  Stewardship: "bg-success/15 text-success",
  "Closed - Won": "bg-success/15 text-success",
  "Closed - Lost": "bg-destructive/12 text-destructive",
  // Likelihood
  High: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning-foreground",
  Low: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}