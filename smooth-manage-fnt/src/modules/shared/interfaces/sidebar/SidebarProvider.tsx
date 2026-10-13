import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ModuleDefinition } from "./types";

interface SidebarState {
  n2Expanded: boolean;
  width: number;
}

interface SidebarContextValue {
  modules: ModuleDefinition[];
  activeModule: ModuleDefinition;
  n2Expanded: boolean;
  width: number;
  toggleN2: () => void;
  setN2Expanded: (expanded: boolean) => void;
  setWidth: (width: number) => void;
  activateModule: (id: string) => void;
}

const STORAGE_KEY = "smoothmanage_sidebar";
const DEFAULT_STATE: SidebarState = { n2Expanded: true, width: 280 };
const MIN_WIDTH = 220;
const MAX_WIDTH = 460;

function loadState(): SidebarState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<SidebarState>;
    return {
      n2Expanded: parsed.n2Expanded ?? DEFAULT_STATE.n2Expanded,
      width:
        typeof parsed.width === "number"
          ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed.width))
          : DEFAULT_STATE.width,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  modules,
  children,
}: {
  modules: ModuleDefinition[];
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<SidebarState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore persistence errors
    }
  }, [state]);

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.order - b.order),
    [modules]
  );

  const activeModule =
    sortedModules.find(
      (m) =>
        location.pathname === m.path ||
        location.pathname.startsWith(`${m.path}/`)
    ) ?? sortedModules[0];

  const toggleN2 = useCallback(() => {
    setState((s) => ({ ...s, n2Expanded: !s.n2Expanded }));
  }, []);

  const setN2Expanded = useCallback((expanded: boolean) => {
    setState((s) => ({ ...s, n2Expanded: expanded }));
  }, []);

  const setWidth = useCallback((width: number) => {
    setState((s) => ({
      ...s,
      width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)),
    }));
  }, []);

  const activateModule = useCallback(
    (id: string) => {
      const target = sortedModules.find((m) => m.id === id);
      if (!target) return;
      if (activeModule && target.id === activeModule.id) {
        toggleN2();
        return;
      }
      navigate(target.path);
      setState((s) => ({ ...s, n2Expanded: true }));
    },
    [sortedModules, activeModule, navigate, toggleN2]
  );

  const value: SidebarContextValue = {
    modules: sortedModules,
    activeModule,
    n2Expanded: state.n2Expanded,
    width: state.width,
    toggleN2,
    setN2Expanded,
    setWidth,
    activateModule,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}