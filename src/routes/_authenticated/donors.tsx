import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DONOR_TYPES, DONOR_STAGES, type Donor } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/donors")({
  head: () => ({
    meta: [
      { title: "Donor & Prospect CRM — SMART Sports" },
      { name: "description", content: "Manage individual donors, major gift prospects, corporate sponsors, and partners." },
    ],
  }),
  component: DonorsPage,
});

function emptyDonor(): Donor {
  return {
    id: newId(),
    name: "",
    organization: "",
    type: DONOR_TYPES[0],
    givingCapacity: "",
    interestArea: "",
    connection: "",
    lastContact: "",
    nextStep: "",
    askAmount: 0,
    stage: DONOR_STAGES[0],
    notes: "",
  };
}

function DonorsPage() {
  const { data, addRow, saveRow, removeRow } = useDashboard();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editing, setEditing] = useState<Donor | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return data.donors.filter((d) => {
      const q = !query || [d.name, d.organization, d.interestArea].join(" ").toLowerCase().includes(query.toLowerCase());
      const t = typeFilter === "all" || d.type === typeFilter;
      return q && t;
    });
  }, [data.donors, query, typeFilter]);

  const totalAsk = data.donors.reduce((s, d) => s + d.askAmount, 0);
  const majorPipeline = data.donors
    .filter((d) => d.type === "Major Gift Prospect")
    .reduce((s, d) => s + d.askAmount, 0);
  const corporatePipeline = data.donors
    .filter((d) => d.type === "Corporate Sponsor")
    .reduce((s, d) => s + d.askAmount, 0);

  function openNew() { setEditing(emptyDonor()); setOpen(true); }
  function openEdit(d: Donor) { setEditing({ ...d }); setOpen(true); }
  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) { toast.error("Name is required"); return; }
    try {
      const exists = data.donors.some((d) => d.id === editing.id);
      if (exists) await saveRow("donors", editing.id, editing);
      else await addRow("donors", editing);
      toast.success("Contact saved");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save contact");
    }
  }
  async function remove(id: string) {
    try {
      await removeRow("donors", id);
      toast.success("Contact removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove contact");
    }
  }

  const set = (patch: Partial<Donor>) => editing && setEditing({ ...editing, ...patch });

  return (
    <div>
      <PageHeader
        title="Donor & Prospect CRM"
        description="Individuals, major gift prospects, corporate sponsors, board contacts, sports leaders, alumni, foundations, and community partners."
        action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Add Contact</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Contacts" value={String(data.donors.length)} accent="navy" />
        <StatCard label="Total Ask Pipeline" value={compactCurrency(totalAsk)} accent="orange" />
        <StatCard label="Major Gift Pipeline" value={compactCurrency(majorPipeline)} accent="green" />
        <StatCard label="Corporate Pipeline" value={compactCurrency(corporatePipeline)} accent="muted" />
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, org, interest…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DONOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead className="text-right">Ask</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id} className="cursor-pointer" onClick={() => openEdit(d)}>
                  <TableCell>
                    <div className="font-medium text-foreground">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.organization}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.type}</TableCell>
                  <TableCell className="text-sm">{d.givingCapacity || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.interestArea || "—"}</TableCell>
                  <TableCell className="text-right font-medium">{currency(d.askAmount)}</TableCell>
                  <TableCell><StatusBadge status={String(d.stage)} /></TableCell>
                  <TableCell className="text-sm">{formatDate(d.lastContact)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No contacts match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing?.name || "New Contact"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={editing.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Organization</Label><Input value={editing.organization} onChange={(e) => set({ organization: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={String(editing.type)} onValueChange={(v) => set({ type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DONOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Giving Capacity</Label><Input value={editing.givingCapacity} onChange={(e) => set({ givingCapacity: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Interest Area</Label><Input value={editing.interestArea} onChange={(e) => set({ interestArea: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Ask Amount</Label><Input type="number" value={editing.askAmount} onChange={(e) => set({ askAmount: Number(e.target.value) })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stage</Label>
                <Select value={String(editing.stage)} onValueChange={(v) => set({ stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DONOR_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Last Contact</Label><Input type="date" value={editing.lastContact} onChange={(e) => set({ lastContact: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Connection to SMART Sports</Label><Input value={editing.connection} onChange={(e) => set({ connection: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Next Step</Label><Input value={editing.nextStep} onChange={(e) => set({ nextStep: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Notes</Label><Textarea value={editing.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>Save Contact</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}