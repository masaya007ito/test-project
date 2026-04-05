import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { VisitDataMap, VisitStatus, VISIT_STATUS_CYCLE } from '../types';

const STORAGE_KEY = 'world-visit-tracker';

function loadData(): VisitDataMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveData(data: VisitDataMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface WorldVisitState {
  visitData: VisitDataMap;
  selectedCode: string | null;
}

type Action =
  | { type: 'CYCLE_STATUS'; code: string }
  | { type: 'SET_STATUS'; code: string; status: VisitStatus }
  | { type: 'UPDATE_DETAIL'; code: string; date?: string; memo?: string }
  | { type: 'SELECT_LOCATION'; code: string | null }
  | { type: 'IMPORT_DATA'; data: VisitDataMap };

function reducer(state: WorldVisitState, action: Action): WorldVisitState {
  switch (action.type) {
    case 'CYCLE_STATUS': {
      const current = state.visitData[action.code]?.status ?? 'unvisited';
      const idx = VISIT_STATUS_CYCLE.indexOf(current);
      const next = VISIT_STATUS_CYCLE[(idx + 1) % VISIT_STATUS_CYCLE.length];
      if (next === 'unvisited') {
        const newData = { ...state.visitData };
        delete newData[action.code];
        return { ...state, visitData: newData };
      }
      const existing = state.visitData[action.code] ?? {};
      return {
        ...state,
        visitData: { ...state.visitData, [action.code]: { ...existing, status: next } },
      };
    }
    case 'SET_STATUS': {
      if (action.status === 'unvisited') {
        const newData = { ...state.visitData };
        delete newData[action.code];
        return { ...state, visitData: newData };
      }
      const existing = state.visitData[action.code] ?? {};
      return {
        ...state,
        visitData: { ...state.visitData, [action.code]: { ...existing, status: action.status } },
      };
    }
    case 'UPDATE_DETAIL': {
      const existing = state.visitData[action.code];
      if (!existing) return state;
      return {
        ...state,
        visitData: {
          ...state.visitData,
          [action.code]: {
            ...existing,
            date: action.date ?? existing.date,
            memo: action.memo ?? existing.memo,
          },
        },
      };
    }
    case 'SELECT_LOCATION':
      return { ...state, selectedCode: action.code };
    case 'IMPORT_DATA':
      return { ...state, visitData: action.data };
    default:
      return state;
  }
}

interface WorldVisitContextType extends WorldVisitState {
  cycleStatus: (code: string) => void;
  setStatus: (code: string, status: VisitStatus) => void;
  updateDetail: (code: string, date?: string, memo?: string) => void;
  selectLocation: (code: string | null) => void;
  importData: (data: VisitDataMap) => void;
}

const WorldVisitContext = createContext<WorldVisitContextType | null>(null);

export function WorldVisitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    visitData: loadData(),
    selectedCode: null,
  }));

  useEffect(() => {
    saveData(state.visitData);
  }, [state.visitData]);

  const cycleStatus = useCallback((code: string) => dispatch({ type: 'CYCLE_STATUS', code }), []);
  const setStatus = useCallback((code: string, status: VisitStatus) => dispatch({ type: 'SET_STATUS', code, status }), []);
  const updateDetail = useCallback((code: string, date?: string, memo?: string) => dispatch({ type: 'UPDATE_DETAIL', code, date, memo }), []);
  const selectLocation = useCallback((code: string | null) => dispatch({ type: 'SELECT_LOCATION', code }), []);
  const importData = useCallback((data: VisitDataMap) => dispatch({ type: 'IMPORT_DATA', data }), []);

  return (
    <WorldVisitContext.Provider value={{ ...state, cycleStatus, setStatus, updateDetail, selectLocation, importData }}>
      {children}
    </WorldVisitContext.Provider>
  );
}

export function useWorldVisit() {
  const ctx = useContext(WorldVisitContext);
  if (!ctx) throw new Error('useWorldVisit must be used within WorldVisitProvider');
  return ctx;
}
