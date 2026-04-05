import { VisitStatus } from '../types';

export const STATUS_COLORS: Record<VisitStatus, string> = {
  unvisited: '#f0f0f0',
  visited: '#e74c3c',
  passed: '#f1c40f',
  lived: '#3498db',
};

export const STATUS_HOVER_COLORS: Record<VisitStatus, string> = {
  unvisited: '#d9d9d9',
  visited: '#c0392b',
  passed: '#d4ac0d',
  lived: '#2980b9',
};
