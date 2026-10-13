/**
 * Types for Lunar Calculator
 */

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number; // Date.now()
  createdAt: string; // Human readable string, e.g. "Oct 13, 10:24:05"
}

export interface HistoryBackupPayload {
  app: string;
  version: string;
  exportedAt: string;
  totalRecords: number;
  history: HistoryItem[];
}

export type CalcOperator = '+' | '−' | '×' | '÷' | '^' | 'mod' | null;

export interface CalculatorMemory {
  storedValue: number;
  hasMemory: boolean;
}

export interface KeypadButtonDef {
  label: string;
  subLabel?: string;
  action: string;
  type: 'digit' | 'operator' | 'action' | 'scientific' | 'equals';
  keyboardShortcuts?: string[];
  ariaLabel: string;
  span?: number;
}
