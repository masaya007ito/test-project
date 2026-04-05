export type VisitStatus = 'unvisited' | 'visited' | 'passed' | 'lived';

export interface VisitRecord {
  status: VisitStatus;
  date?: string;
  memo?: string;
}

export type VisitDataMap = Record<string, VisitRecord>;

export const VISIT_STATUS_CYCLE: VisitStatus[] = ['unvisited', 'visited', 'passed', 'lived'];

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  unvisited: '未訪問',
  visited: '訪問済み',
  passed: '通過のみ',
  lived: '居住経験あり',
};
