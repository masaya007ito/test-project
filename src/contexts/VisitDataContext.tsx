import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { VisitDataMap, VisitStatus, VISIT_STATUS_CYCLE } from '../types';
import { loadVisitData, saveVisitData } from '../utils/storage';

interface VisitDataState {
  visitData: VisitDataMap;
  selectedCode: string | null;
  currentView: 'national' | 'prefecture';
  selectedPrefectureCode: string | null;
}

type Action =
  | { type: 'CYCLE_STATUS'; code: string }
  | { type: 'SET_STATUS'; code: string; status: VisitStatus }
  | { type: 'UPDATE_DETAIL'; code: string; date?: string; memo?: string }
  | { type: 'SELECT_LOCATION'; code: string | null }
  | { type: 'DRILL_DOWN'; prefectureCode: string }
  | { type: 'GO_BACK' }
  | { type: 'IMPORT_DATA'; data: VisitDataMap };

function reducer(state: VisitDataState, action: Action): VisitDataState {
  switch (action.type) {
    case 'CYCLE_STATUS': {
      const current = state.visitData[action.code]?.status ?? 'unvisited';
      const idx = VISIT_STATUS_CYCLE.indexOf(current);
      const next = VISIT_STATUS_CYCLE[(idx + 1) % VISIT_STATUS_CYCLE.length];
      const existing = state.visitData[action.code] ?? {};
      if (next === 'unvisited') {
        const newData = { ...state.visitData };
        delete newData[action.code];
        return { ...state, visitData: newData };
      }
      return {
        ...state,
        visitData: {
          ...state.visitData,
          [action.code]: { ...existing, status: next },
        },
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
        visitData: {
          ...state.visitData,
          [action.code]: { ...existing, status: action.status },
        },
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
    case 'DRILL_DOWN':
      return {
        ...state,
        currentView: 'prefecture',
        selectedPrefectureCode: action.prefectureCode,
        selectedCode: null,
      };
    case 'GO_BACK':
      return {
        ...state,
        currentView: 'national',
        selectedPrefectureCode: null,
        selectedCode: null,
      };
    case 'IMPORT_DATA':
      return { ...state, visitData: action.data };
    default:
      return state;
  }
}

interface VisitDataContextType extends VisitDataState {
  cycleStatus: (code: string) => void;
  setStatus: (code: string, status: VisitStatus) => void;
  updateDetail: (code: string, date?: string, memo?: string) => void;
  selectLocation: (code: string | null) => void;
  drillDown: (prefectureCode: string) => void;
  goBack: () => void;
  importData: (data: VisitDataMap) => void;
}

const VisitDataContext = createContext<VisitDataContextType | null>(null);

export function VisitDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    visitData: loadVisitData(),
    selectedCode: null,
    currentView: 'national' as const,
    selectedPrefectureCode: null,
  }));

  useEffect(() => {
    saveVisitData(state.visitData);
  }, [state.visitData]);

  const cycleStatus = useCallback((code: string) => dispatch({ type: 'CYCLE_STATUS', code }), []);
  const setStatus = useCallback((code: string, status: VisitStatus) => dispatch({ type: 'SET_STATUS', code, status }), []);
  const updateDetail = useCallback((code: string, date?: string, memo?: string) => dispatch({ type: 'UPDATE_DETAIL', code, date, memo }), []);
  const selectLocation = useCallback((code: string | null) => dispatch({ type: 'SELECT_LOCATION', code }), []);
  const drillDown = useCallback((prefectureCode: string) => dispatch({ type: 'DRILL_DOWN', prefectureCode }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const importData = useCallback((data: VisitDataMap) => dispatch({ type: 'IMPORT_DATA', data }), []);

  return (
    <VisitDataContext.Provider
      value={{
        ...state,
        cycleStatus,
        setStatus,
        updateDetail,
        selectLocation,
        drillDown,
        goBack,
        importData,
      }}
    >
      {children}
    </VisitDataContext.Provider>
  );
}

export function useVisitData() {
  const ctx = useContext(VisitDataContext);
  if (!ctx) throw new Error('useVisitData must be used within VisitDataProvider');
  return ctx;
}
