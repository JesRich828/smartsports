import { createFileRoute } from "@tanstack/react-router";
import { Users, Handshake, CalendarCheck, Target, Megaphone, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { ProgressRow } from "@/components/dashboard/ProgressRow";
import { toast } from "sonner";
import { useDashboard } from "@/lib/db";
import { currency, compactCurrency } from "@/lib/format";
import type { BoardMember } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/board")({
  head: () => ({
    meta: [
      { title: "Board Dashboard — SMART Sports" },
      { name: "description", content: "Board giving, introductions, meetings, and outreach progress for SMART Sports." },
    ],
  }),
  component: BoardPage,
});

function BoardPage() {
  const { data, saveRow } = useDashboard();
  const board = data.board;

  const totalGiven = board.reduce((s, b) => s + b.given, 0);
  const totalGoal = data.goals.boardGivingGoal;
  const intros = board.reduce((s, b) => s + b.introductions, 0);
  const meetings = board.reduce((s, b) => s + b.meetingsScheduled, 0);
  const prospects = board.reduce((s, b) => s + b.prospectsAssigned, 0);
  const outreach = board.reduce((s, b) => s + b.sponsorOutreach, 0);
  const pipeline = data.grants
    .filter((g) => !["Declined", "Closed"].includes(g.status))
    .reduce((s, g) => s + g.amountRequested, 0);

  function setMember(id: string, patch: Partial<BoardMember>) {
    saveRow("board_members", id, patch).catch((e) =>
      toast.error(e instanceof Error ? e.message : "Could not update board member"),
    );
  }

  return (
    <div>
      <PageHeader title="Board Dashboard" description="Engagement and giving accountability across the SMART Sports board." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Board Giving" value={compactCurrency(totalGiven)} sub={`Goal ${compactCurrency(totalGoal)}`} accent="green" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Introductions" value={String(intros)} accent="orange" icon={<Handshake className="h-5 w-5" />} />
        <StatCard label="Meetings Scheduled" value={String(meetings)} accent="navy" icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard label="Prospects Assigned" value={String(prospects)} accent="navy" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Sponsor Outreach" value={String(outreach)} accent="orange" icon={<Megaphone className="h-5 w-5" />} />
        <StatCard label="Grant Pipeline" value={compactCurrency(pipeline)} accent="green" icon={<FileText className="h-5 w-5" />} />
      </div>

      <Card className="mb-6 p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Board Giving Goal</h2>
        <ProgressRow label="Total Board Commitments" raised={totalGiven} goal={totalGoal} color="bg-success" />
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Board Member Activity</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Give Goal</TableHead>
                <TableHead className="text-right">Given</TableHead>
                <TableHead className="text-center">Intros</TableHead>
                <TableHead className="text-center">Meetings</TableHead>
                <TableHead className="text-center">Prospects</TableHead>
                <TableHead className="text-center">Outreach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {board.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{currency(b.giveGoal)}</TableCell>
                  <TableCell className="text-right">
                    <Input type="number" value={b.given} onChange={(e) => setMember(b.id, { given: Number(e.target.value) })} className="h-8 w-24 text-right" />
                  </TableCell>
                  {(["introductions", "meetingsScheduled", "prospectsAssigned", "sponsorOutreach"] as const).map((key) => (
                    <TableCell key={key} className="text-center">
                      <Input type="number" value={b[key]} onChange={(e) => setMember(b.id, { [key]: Number(e.target.value) } as Partial<BoardMember>)} className="mx-auto h-8 w-16 text-center" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}