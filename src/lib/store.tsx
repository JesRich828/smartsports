import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedData } from "./seed";
import type { AppData } from "./types";

const STORAGE_KEY = "smart-sports-fundraising-v1";

function loadData(): AppData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    return { ...seedData, ...JSON.parse(raw) } as AppData;
  } catch {
    return seedData;
  }
}

interface StoreContextValue {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
  resetData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(seedData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDataState(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, hydrated]);

  const setData = (updater: (prev: AppData) => AppData) => setDataState(updater);
  const resetData = () => setDataState(seedData);

  const value = useMemo(() => ({ data, setData, resetData }), [data]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}