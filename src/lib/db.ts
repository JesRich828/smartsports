import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppData, Goals } from "./types";

export type TableName =
  | "grants"
  | "donors"
  | "golf_sponsors"
  | "golf_foursomes"
  | "golf_players"
  | "golf_auction"
  | "golf_expenses"
  | "board_members"
  | "goals";

const QKEY = ["dashboard"] as const;

const defaultGoals: Goals = {
  totalRevenueGoal: 99500,
  cashGoal: 51500,
  inKindGoal: 48000,
  totalExpenses: 69249,
  boardGivingGoal: 25000,
  channels: [],
};

export const emptyData: AppData = {
  grants: [],
  donors: [],
  golfSponsors: [],
  golfFoursomes: [],
  golfPlayers: [],
  golfAuction: [],
  golfExpenses: [],
  board: [],
  goals: defaultGoals,
};

function strip<T extends Record<string, unknown>>(row: T) {
  const clone: Record<string, unknown> = { ...row };
  delete clone.id;
  delete clone.created_at;
  return clone;
}

async function fetchAll(): Promise<AppData> {
  const [grants, donors, gs, gf, gp, ga, ge, board, goals] = await Promise.all([
    supabase.from("grants").select("*").order("created_at", { ascending: true }),
    supabase.from("donors").select("*").order("created_at", { ascending: true }),
    supabase.from("golf_sponsors").select("*").order("created_at", { ascending: true }),
    supabase.from("golf_foursomes").select("*").order("created_at", { ascending: true }),
    supabase.from("golf_players").select("*").order("created_at", { ascending: true }),
    supabase.from("golf_auction").select("*").order("created_at", { ascending: true }),
    supabase.from("golf_expenses").select("*").order("created_at", { ascending: true }),
    supabase.from("board_members").select("*").order("created_at", { ascending: true }),
    supabase.from("goals").select("*").limit(1).maybeSingle(),
  ]);

  const firstError =
    grants.error || donors.error || gs.error || gf.error || gp.error ||
    ga.error || ge.error || board.error || goals.error;
  if (firstError) throw firstError;

  return {
    grants: (grants.data ?? []) as AppData["grants"],
    donors: (donors.data ?? []) as AppData["donors"],
    golfSponsors: (gs.data ?? []) as AppData["golfSponsors"],
    golfFoursomes: (gf.data ?? []) as AppData["golfFoursomes"],
    golfPlayers: (gp.data ?? []) as AppData["golfPlayers"],
    golfAuction: (ga.data ?? []) as AppData["golfAuction"],
    golfExpenses: (ge.data ?? []) as AppData["golfExpenses"],
    board: (board.data ?? []) as AppData["board"],
    goals: (goals.data ? (goals.data as unknown as Goals) : defaultGoals),
  };
}

export function useDashboard() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: QKEY, queryFn: fetchAll });

  const invalidate = () => qc.invalidateQueries({ queryKey: QKEY });

  async function addRow(table: TableName, row: Record<string, unknown>) {
    const { error } = await (supabase.from(table) as any).insert(strip(row));
    if (error) throw error;
    await invalidate();
  }

  async function saveRow(table: TableName, id: string, patch: Record<string, unknown>) {
    const { error } = await (supabase.from(table) as any).update(strip(patch)).eq("id", id);
    if (error) throw error;
    await invalidate();
  }

  async function removeRow(table: TableName, id: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    await invalidate();
  }

  return {
    data: query.data ?? emptyData,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    addRow,
    saveRow,
    removeRow,
  };
}

export function newId() {
  return (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10));
}
