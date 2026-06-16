import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useDashboard, newId } from "@/lib/db";
import { currency, formatDate, compactCurrency } from "@/lib/format";
import {
  GRANT_STATUSES,
  LIKELIHOODS,
  PROGRAMS,
  type Grant,
} from "@/lib/types";

export const Route = createFileRoute("/_authenticated/grants")({
  head: () => ({
    meta: [
      { title: "Grant Tracking — SMART Sports FY26" },
      { name: "description", content: "Track the SMART Sports grant pipeline from research through reporting." },
    ],
  }),
  component: GrantsPage,
});

function emptyGrant(): Grant {
  return {
    id: newId(),
    funderName: "",
    fundingType: "",
    priorityArea: "",
    geographicFocus: "",
    programFit: PROGRAMS[0],
    amountRequested: 0,
    likelihood: "Medium",
    deadline: "",
    status: "Researching",
    loiDueDate: "",
    applicationDueDate: "",
    reportDueDate: "",
    contactName: "",
    contactEmail: "",
    relationshipNotes: "",
    nextStep: "",
    assignedOwner: "",
    documentsNeeded: "",
    submittedDate: "",
    decisionDate: "",
    awardAmount: 0,
    declinedReason: "",
    renewalOpportunity: false,
    notes: "",
  };
}

function GrantsPage() {
  const { data, setData } = useStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Grant | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return data.grants.filter((g) => {
      const matchesQuery =
        !query ||
        g.funderName.toLowerCase().includes(query.toLowerCase()) ||
        g.priorityArea.toLowerCase().includes(query.toLowerCase()) ||
        String(g.programFit).toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || g.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [data.grants, query, statusFilter]);

  const requested = data.grants.reduce((s, g) => s + g.amountRequested, 0);
  const awarded = data.grants.filter((g) => g.status === "Awarded").reduce((s, g) => s + g.awardAmount, 0);
  const pending = data.grants
    .filter((g) => !["Awarded", "Declined", "Closed"].includes(g.status))
    .reduce((s, g) => s + g.amountRequested, 0);

  function openNew() {
    setEditing(emptyGrant());
    setOpen(true);
  }
  function openEdit(g: Grant) {
    setEditing({ ...g });
    setOpen(true);
  }
  function save() {
    if (!editing) return;
    if (!editing.funderName.trim()) {
      toast.error("Funder name is required");
      return;
    }
    setData((prev) => {
      const exists = prev.grants.some((g) => g.id === editing.id);
      return {
        ...prev,
        grants: exists
          ? prev.grants.map((g) => (g.id === editing.id ? editing : g))
          : [editing, ...prev.grants],
      };
    });
    toast.success("Grant saved");
    setOpen(false);
  }
  function remove(id: string) {
    setData((prev) => ({ ...prev, grants: prev.grants.filter((g) => g.id !== id) }));
    toast.success("Grant removed");
  }

  return (
    <div>
      <PageHeader
        title="Grant Tracking"
        description="Full grant pipeline from research through reporting and renewal."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Grant
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Requested" value={compactCurrency(requested)} accent="navy" />
        <StatCard label="Awarded" value={compactCurrency(awarded)} accent="green" />
        <StatCard label="In Pipeline" value={compactCurrency(pending)} accent="orange" />
        <StatCard label="Active Grants" value={String(data.grants.length)} accent="muted" />
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search funders, areas, programs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {GRANT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funder</TableHead>
                <TableHead>Program Fit</TableHead>
                <TableHead className="text-right">Requested</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((g) => (
                <TableRow key={g.id} className="cursor-pointer" onClick={() => openEdit(g)}>
                  <TableCell>
                    <div className="font-medium text-foreground">{g.funderName}</div>
                    <div className="text-xs text-muted-foreground">{g.fundingType}</div>
                  </TableCell>
                  <TableCell className="max-w-[180px] text-sm text-muted-foreground">{g.programFit}</TableCell>
                  <TableCell className="text-right font-medium">{currency(g.amountRequested)}</TableCell>
                  <TableCell><StatusBadge status={g.likelihood} /></TableCell>
                  <TableCell><StatusBadge status={g.status} /></TableCell>
                  <TableCell className="text-sm">{formatDate(g.deadline)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{g.assignedOwner || "—"}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(g)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(g.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No grants match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <GrantSheet
        open={open}
        onOpenChange={setOpen}
        grant={editing}
        onChange={setEditing}
        onSave={save}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function GrantSheet({
  open,
  onOpenChange,
  grant,
  onChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  grant: Grant | null;
  onChange: (g: Grant) => void;
  onSave: () => void;
}) {
  if (!grant) return null;
  const set = (patch: Partial<Grant>) => onChange({ ...grant, ...patch });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{grant.funderName || "New Grant"}</SheetTitle>
          <SheetDescription>Track every stage of this funding opportunity.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
          <Field label="Funder Name"><Input value={grant.funderName} onChange={(e) => set({ funderName: e.target.value })} /></Field>
          <Field label="Funding Type"><Input value={grant.fundingType} onChange={(e) => set({ fundingType: e.target.value })} /></Field>
          <Field label="Priority Area"><Input value={grant.priorityArea} onChange={(e) => set({ priorityArea: e.target.value })} /></Field>
          <Field label="Geographic Focus"><Input value={grant.geographicFocus} onChange={(e) => set({ geographicFocus: e.target.value })} /></Field>
          <Field label="SMART Sports Program Fit">
            <Select value={String(grant.programFit)} onValueChange={(v) => set({ programFit: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Amount Requested"><Input type="number" value={grant.amountRequested} onChange={(e) => set({ amountRequested: Number(e.target.value) })} /></Field>
          <Field label="Likelihood">
            <Select value={grant.likelihood} onValueChange={(v) => set({ likelihood: v as Grant["likelihood"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LIKELIHOODS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={grant.status} onValueChange={(v) => set({ status: v as Grant["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GRANT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Deadline"><Input type="date" value={grant.deadline} onChange={(e) => set({ deadline: e.target.value })} /></Field>
          <Field label="LOI Due Date"><Input type="date" value={grant.loiDueDate} onChange={(e) => set({ loiDueDate: e.target.value })} /></Field>
          <Field label="Application Due Date"><Input type="date" value={grant.applicationDueDate} onChange={(e) => set({ applicationDueDate: e.target.value })} /></Field>
          <Field label="Report Due Date"><Input type="date" value={grant.reportDueDate} onChange={(e) => set({ reportDueDate: e.target.value })} /></Field>
          <Field label="Contact Name"><Input value={grant.contactName} onChange={(e) => set({ contactName: e.target.value })} /></Field>
          <Field label="Contact Email"><Input value={grant.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} /></Field>
          <Field label="Assigned Owner"><Input value={grant.assignedOwner} onChange={(e) => set({ assignedOwner: e.target.value })} /></Field>
          <Field label="Submitted Date"><Input type="date" value={grant.submittedDate} onChange={(e) => set({ submittedDate: e.target.value })} /></Field>
          <Field label="Decision Date"><Input type="date" value={grant.decisionDate} onChange={(e) => set({ decisionDate: e.target.value })} /></Field>
          <Field label="Award Amount"><Input type="number" value={grant.awardAmount} onChange={(e) => set({ awardAmount: Number(e.target.value) })} /></Field>
          <div className="sm:col-span-2"><Field label="Documents Needed"><Input value={grant.documentsNeeded} onChange={(e) => set({ documentsNeeded: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Next Step"><Input value={grant.nextStep} onChange={(e) => set({ nextStep: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Relationship Notes"><Textarea value={grant.relationshipNotes} onChange={(e) => set({ relationshipNotes: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Declined Reason"><Input value={grant.declinedReason} onChange={(e) => set({ declinedReason: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Notes"><Textarea value={grant.notes} onChange={(e) => set({ notes: e.target.value })} /></Field></div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch checked={grant.renewalOpportunity} onCheckedChange={(v) => set({ renewalOpportunity: v })} id="renewal" />
            <Label htmlFor="renewal" className="text-sm">Renewal Opportunity</Label>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={onSave}>Save Grant</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}