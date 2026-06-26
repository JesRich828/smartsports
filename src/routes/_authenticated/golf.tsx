import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Flag, MapPin, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useDashboard } from "@/lib/db";
import { currency, compactCurrency } from "@/lib/format";
import { SPONSOR_LEVELS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/golf")({
  head: () => ({
    meta: [
      { title: "Events" },
      { name: "description", content: "Track event sponsors, attendees, and revenue." },
      { property: "og:title", content: "Events — SMART Sports FY26" },
      { property: "og:description", content: "Track event sponsors, attendees, and revenue." },
    ],
  }),
  component: GolfPage,
});

function GolfPage() {
  const { data: g, addRow, saveRow, removeRow } = useDashboard();

  const run = (p: Promise<void>) =>
    p.catch((e) => toast.error(e instanceof Error ? e.message : "Action failed"));

  const sponsorRev = g.golfSponsors.filter((s) => s.confirmed).reduce((s, x) => s + x.amount, 0);
  const sponsorPotential = g.golfSponsors.reduce((s, x) => s + x.amount, 0);
  const foursomeRev = g.golfFoursomes.reduce((s, x) => s + x.amount, 0);
  const playerRev = g.golfPlayers.reduce((s, x) => s + x.amount, 0);
  const auctionRev = g.golfAuction.filter((a) => a.type === "Auction").reduce((s, a) => s + a.estimatedValue, 0);
  const inKind = g.golfAuction.filter((a) => a.type === "In-kind").reduce((s, a) => s + a.estimatedValue, 0);
  const revenue = sponsorRev + foursomeRev + playerRev + auctionRev;
  const expenses = g.golfExpenses.reduce((s, e) => s + e.amount, 0);
  const net = revenue - expenses;

  return (
    <div>
      <PageHeader
        title="Events"
        description="Track event sponsors, attendees, and revenue."
      />

      <Card className="brand-gradient mb-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-5 text-primary-foreground">
        <div className="flex items-center gap-2"><Flag className="h-5 w-5 text-accent" /><span className="font-display text-lg font-bold">Monday, October 5, 2026</span></div>
        <div className="flex items-center gap-2 text-primary-foreground/80"><MapPin className="h-4 w-4" /><span>Harborside International Golf Course, Chicago</span></div>
        <div className="flex items-center gap-2 text-primary-foreground/80"><CalendarDays className="h-4 w-4" /><span>Annual Fundraising Invitational</span></div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Event Revenue" value={compactCurrency(revenue)} accent="orange" />
        <StatCard label="Event Expenses" value={compactCurrency(expenses)} accent="muted" />
        <StatCard label="Net Revenue" value={compactCurrency(net)} accent="green" />
        <StatCard label="In-Kind Gifts" value={compactCurrency(inKind)} accent="green" />
        <StatCard label="Sponsor Potential" value={compactCurrency(sponsorPotential)} accent="navy" />
      </div>

      <Tabs defaultValue="sponsors">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="players">Foursomes & Players</TabsTrigger>
          <TabsTrigger value="auction">Auction & In-Kind</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="sponsors">
          <Card className="p-4">
            <h3 className="mb-3 font-display text-sm font-semibold text-muted-foreground">Sponsorship levels: Presenting $25K · Champion $15K · Leadership $10K · Foursome $5K · Hole $1K</h3>
            <Table>
              <TableHeader><TableRow><TableHead>Sponsor</TableHead><TableHead>Level</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Confirmed</TableHead><TableHead>Follow-up</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {g.golfSponsors.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.level}</TableCell>
                    <TableCell className="text-right">{currency(s.amount)}</TableCell>
                    <TableCell>
                      <Switch checked={s.confirmed} onCheckedChange={(v) => run(saveRow("golf_sponsors", s.id, { confirmed: v }))} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.followUp || "—"}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => run(removeRow("golf_sponsors", s.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AddSponsor onAdd={(name, level, amount, followUp) => run(addRow("golf_sponsors", { name, level, amount, confirmed: false, followUp }))} />
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <h3 className="mb-3 font-display font-semibold">Foursomes</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Captain</TableHead><TableHead>Org</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Paid</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>
                  {g.golfFoursomes.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.captain}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{f.organization}</TableCell>
                      <TableCell className="text-right">{currency(f.amount)}</TableCell>
                      <TableCell><Switch checked={f.paid} onCheckedChange={(v) => run(saveRow("golf_foursomes", f.id, { paid: v }))} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => run(removeRow("golf_foursomes", f.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <AddTwo placeholder1="Captain" placeholder2="Organization" onAdd={(a, b, amt) => run(addRow("golf_foursomes", { captain: a, organization: b, players: 4, amount: amt, paid: false }))} />
            </Card>
            <Card className="p-4">
              <h3 className="mb-3 font-display font-semibold">Individual Players</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Org</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Paid</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>
                  {g.golfPlayers.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.organization}</TableCell>
                      <TableCell className="text-right">{currency(p.amount)}</TableCell>
                      <TableCell><Switch checked={p.paid} onCheckedChange={(v) => run(saveRow("golf_players", p.id, { paid: v }))} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => run(removeRow("golf_players", p.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <AddTwo placeholder1="Player name" placeholder2="Organization" onAdd={(a, b, amt) => run(addRow("golf_players", { name: a, organization: b, amount: amt, paid: false }))} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="auction">
          <Card className="p-4">
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Donor</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Est. Value</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {g.golfAuction.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.item}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.donor}</TableCell>
                    <TableCell className="text-sm">{a.type}</TableCell>
                    <TableCell className="text-right">{currency(a.estimatedValue)}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => run(removeRow("golf_auction", a.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AddAuction onAdd={(item, donor, value, type) => run(addRow("golf_auction", { item, donor, estimatedValue: value, type }))} />
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="p-4">
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {g.golfExpenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.item}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.category}</TableCell>
                    <TableCell className="text-right">{currency(e.amount)}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => run(removeRow("golf_expenses", e.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AddTwo placeholder1="Expense item" placeholder2="Category" onAdd={(a, b, amt) => run(addRow("golf_expenses", { item: a, category: b, amount: amt }))} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddSponsor({ onAdd }: { onAdd: (name: string, level: string, amount: number, followUp: string) => void }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<string>(SPONSOR_LEVELS[0].name);
  const [followUp, setFollowUp] = useState("");
  const amount = SPONSOR_LEVELS.find((l) => l.name === level)?.amount ?? 0;
  return (
    <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
      <Input placeholder="Sponsor name" value={name} onChange={(e) => setName(e.target.value)} className="w-44" />
      <Select value={level} onValueChange={setLevel}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>{SPONSOR_LEVELS.map((l) => <SelectItem key={l.name} value={l.name}>{l.name} — {currency(l.amount)}</SelectItem>)}</SelectContent>
      </Select>
      <Input placeholder="Follow-up" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="w-44" />
      <Button onClick={() => { if (!name.trim()) return toast.error("Name required"); onAdd(name, level, amount, followUp); setName(""); setFollowUp(""); }}><Plus className="h-4 w-4" /> Add</Button>
    </div>
  );
}

function AddTwo({ placeholder1, placeholder2, onAdd }: { placeholder1: string; placeholder2: string; onAdd: (a: string, b: string, amount: number) => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [amt, setAmt] = useState("");
  return (
    <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
      <Input placeholder={placeholder1} value={a} onChange={(e) => setA(e.target.value)} className="w-40" />
      <Input placeholder={placeholder2} value={b} onChange={(e) => setB(e.target.value)} className="w-40" />
      <Input placeholder="Amount" type="number" value={amt} onChange={(e) => setAmt(e.target.value)} className="w-28" />
      <Button onClick={() => { if (!a.trim()) return toast.error("Required"); onAdd(a, b, Number(amt) || 0); setA(""); setB(""); setAmt(""); }}><Plus className="h-4 w-4" /> Add</Button>
    </div>
  );
}

function AddAuction({ onAdd }: { onAdd: (item: string, donor: string, value: number, type: "Auction" | "In-kind") => void }) {
  const [item, setItem] = useState("");
  const [donor, setDonor] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<"Auction" | "In-kind">("Auction");
  return (
    <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
      <Input placeholder="Item" value={item} onChange={(e) => setItem(e.target.value)} className="w-40" />
      <Input placeholder="Donor" value={donor} onChange={(e) => setDonor(e.target.value)} className="w-40" />
      <Input placeholder="Est. value" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-28" />
      <Select value={type} onValueChange={(v) => setType(v as "Auction" | "In-kind")}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="Auction">Auction</SelectItem><SelectItem value="In-kind">In-kind</SelectItem></SelectContent>
      </Select>
      <Button onClick={() => { if (!item.trim()) return toast.error("Required"); onAdd(item, donor, Number(value) || 0, type); setItem(""); setDonor(""); setValue(""); }}><Plus className="h-4 w-4" /> Add</Button>
    </div>
  );
}
