import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
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

const CSV_FIELDS = [
  "name",
  "organization",
  "type",
  "givingCapacity",
  "interestArea",
  "connection",
  "lastContact",
  "nextStep",
  "askAmount",
  "stage",
  "notes",
] as const;

// Minimal RFC-4180-ish CSV parser (handles quoted fields, escaped quotes, CRLF).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

type ParsedImport = {
  valid: Donor[];
  skipped: number;
};

function buildImport(text: string): ParsedImport {
  const rows = parseCsv(text);
  if (rows.length === 0) return { valid: [], skipped: 0 };
  const header = rows[0].map((h) => h.trim());
  const lower = header.map((h) => h.toLowerCase());
  const idx = (field: string) => lower.indexOf(field.toLowerCase());
  const get = (cells: string[], field: string) => {
    const i = idx(field);
    return i >= 0 && cells[i] != null ? cells[i].trim() : "";
  };
  const valid: Donor[] = [];
  let skipped = 0;
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const name = get(cells, "name");
    if (!name) { skipped++; continue; }
    const rawType = get(cells, "type");
    const type = (DONOR_TYPES as readonly string[]).includes(rawType) ? rawType : (rawType || DONOR_TYPES[0]);
    const rawStage = get(cells, "stage");
    const stage = (DONOR_STAGES as readonly string[]).includes(rawStage) ? rawStage : (rawStage || DONOR_STAGES[0]);
    const askRaw = get(cells, "askAmount").replace(/[$,]/g, "");
    const ask = Number(askRaw);
    valid.push({
      id: newId(),
      name,
      organization: get(cells, "organization"),
      type,
      givingCapacity: get(cells, "givingCapacity"),
      interestArea: get(cells, "interestArea"),
      connection: get(cells, "connection"),
      lastContact: get(cells, "lastContact"),
      nextStep: get(cells, "nextStep"),
      askAmount: Number.isFinite(ask) && askRaw !== "" ? ask : 0,
      stage,
      notes: get(cells, "notes"),
    });
  }
  return { valid, skipped };
}

function DonorsPage() {
  const { data, addRow, saveRow, removeRow } = useDashboard();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editing, setEditing] = useState<Donor | null>(null);
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("SMART Sports");
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedImport | null>(null);
  const [importing, setImporting] = useState(false);

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

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = buildImport(String(reader.result ?? ""));
        if (result.valid.length === 0 && result.skipped === 0) {
          toast.error("No rows found in the CSV file");
          return;
        }
        setPreview(result);
      } catch {
        toast.error("Could not parse the CSV file");
      }
    };
    reader.onerror = () => toast.error("Could not read the file");
    reader.readAsText(file);
  }

  async function confirmImport() {
    if (!preview) return;
    setImporting(true);
    try {
      for (const row of preview.valid) {
        await addRow("donors", row);
      }
      toast.success(`Imported ${preview.valid.length} contact${preview.valid.length === 1 ? "" : "s"}`);
      setPreview(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not import contacts");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Donor & Prospect CRM"
        description="Individuals, major gift prospects, corporate sponsors, board contacts, sports leaders, alumni, foundations, and community partners."
        action={
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFilePicked} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import CSV</Button>
            <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Contact</Button>
          </div>
        }
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
              <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Connection to {orgName}</Label><Input value={editing.connection} onChange={(e) => set({ connection: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Next Step</Label><Input value={editing.nextStep} onChange={(e) => set({ nextStep: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Notes</Label><Textarea value={editing.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>Save Contact</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={(o) => { if (!o && !importing) setPreview(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Import preview</DialogTitle></DialogHeader>
          {preview && (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium text-foreground">{preview.valid.length}</span> contact{preview.valid.length === 1 ? "" : "s"} ready to import.</p>
              {preview.skipped > 0 && (
                <p className="text-muted-foreground"><span className="font-medium text-destructive">{preview.skipped}</span> row{preview.skipped === 1 ? "" : "s"} skipped (missing name).</p>
              )}
              {preview.valid.length === 0 && (
                <p className="text-muted-foreground">No valid rows to import.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)} disabled={importing}>Cancel</Button>
            <Button onClick={confirmImport} disabled={importing || !preview || preview.valid.length === 0}>
              {importing ? "Importing…" : "Confirm Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}