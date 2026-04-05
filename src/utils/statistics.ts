import { VisitDataMap, VisitStatus } from '../types';
import { PREFECTURE_CODES } from '../constants/prefectures';

export interface StatsResult {
  total: number;
  visited: number;
  passed: number;
  lived: number;
  unvisited: number;
}

export function computePrefectureStats(data: VisitDataMap): StatsResult {
  const total = PREFECTURE_CODES.length;
  let visited = 0;
  let passed = 0;
  let lived = 0;

  for (const code of PREFECTURE_CODES) {
    const record = data[code];
    if (!record) continue;
    switch (record.status) {
      case 'visited':
        visited++;
        break;
      case 'passed':
        passed++;
        break;
      case 'lived':
        lived++;
        break;
    }
  }

  return {
    total,
    visited,
    passed,
    lived,
    unvisited: total - visited - passed - lived,
  };
}

export function getStatusForCode(data: VisitDataMap, code: string): VisitStatus {
  return data[code]?.status ?? 'unvisited';
}
