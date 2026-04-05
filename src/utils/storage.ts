import { VisitDataMap } from '../types';

const STORAGE_KEY = 'japan-visit-tracker';

export function loadVisitData(): VisitDataMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as VisitDataMap;
    }
  } catch (e) {
    console.error('Failed to load visit data:', e);
  }
  return {};
}

export function saveVisitData(data: VisitDataMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save visit data:', e);
  }
}

export function exportVisitDataAsJSON(data: VisitDataMap): string {
  return JSON.stringify(data, null, 2);
}

export function parseVisitDataJSON(json: string): VisitDataMap | null {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as VisitDataMap;
    }
  } catch (e) {
    console.error('Failed to parse visit data JSON:', e);
  }
  return null;
}
