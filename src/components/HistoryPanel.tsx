import React, { useState, useRef } from 'react';
import { HistoryItem, HistoryBackupPayload } from '../types/calculator.ts';
import { validateHistoryImport } from '../utils/calculatorEngine.ts';
import {
  History,
  Trash2,
  Download,
  Upload,
  Copy,
  Check,
  X,
  RotateCcw,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onRestoreHistory: (importedItems: HistoryItem[]) => void;
  onClose?: () => void;
  isDrawer?: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAllHistory,
  onRestoreHistory,
  onClose,
  isDrawer = false,
}) => {
  const [modalMode, setModalMode] = useState<'export' | 'import' | null>(null);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate backup JSON string
  const getBackupJson = (): string => {
    const payload: HistoryBackupPayload = {
      app: 'lunar-calc',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalRecords: history.length,
      history,
    };
    return JSON.stringify(payload, null, 2);
  };

  // Download JSON backup file
  const handleDownloadBackup = () => {
    try {
      const json = getBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.href = url;
      link.download = `lunar-calc-history-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  };

  // Copy JSON to clipboard
  const handleCopyBackup = async () => {
    try {
      const json = getBackupJson();
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  // Handle file input for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        processImportString(content);
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: 'Failed to read file: ' + (err instanceof Error ? err.message : 'Unknown error'),
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Process and validate import payload
  const processImportString = (rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson);
      const validation = validateHistoryImport(parsed);

      if (!validation.isValid) {
        setImportStatus({
          type: 'error',
          message: validation.error || 'Invalid history file format.',
        });
        return;
      }

      const items: HistoryItem[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.history)
        ? parsed.history
        : [];

      // Ensure every item has unique ID & required fields
      const sanitized: HistoryItem[] = items.map((item, idx) => ({
        id: item.id || `restored-${Date.now()}-${idx}`,
        expression: String(item.expression),
        result: String(item.result),
        timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
        createdAt: item.createdAt || new Date().toLocaleString(),
      }));

      onRestoreHistory(sanitized);
      setImportStatus({
        type: 'success',
        message: `Successfully restored ${sanitized.length} calculation record${sanitized.length === 1 ? '' : 's'}!`,
      });
      setTimeout(() => {
        setModalMode(null);
        setImportStatus(null);
        setImportText('');
      }, 1500);
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Syntax error: The provided data is not valid JSON.',
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden select-none">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
            Calculation History
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Export / Backup Button */}
          <button
            onClick={() => setModalMode('export')}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 text-xs transition-colors cursor-pointer"
            title="Backup & Export History"
            aria-label="Backup History"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import / Restore Button */}
          <button
            onClick={() => setModalMode('import')}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 text-xs transition-colors cursor-pointer"
            title="Restore History from Backup"
            aria-label="Restore History"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Clear All */}
          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all calculation history? This action cannot be undone.')) {
                  onClearAllHistory();
                }
              }}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/70 text-xs transition-colors cursor-pointer"
              title="Clear all history entries"
              aria-label="Clear All History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close drawer button on mobile */}
          {isDrawer && onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors ml-1 cursor-pointer"
              aria-label="Close History"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <History className="w-8 h-8 stroke-[1.5] mb-2 text-slate-600/70" />
            <p className="text-sm font-medium text-slate-400">No calculations recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Perform calculations using the keypad or keyboard to automatically record history.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="group relative p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/60 hover:border-cyan-500/30 transition-all duration-150 cursor-pointer"
              onClick={() => onSelectHistoryItem(item)}
              title="Click to load this expression or result into calculator"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400 truncate max-w-[80%]">
                  {item.expression}
                </span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {item.createdAt}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-mono font-semibold text-cyan-200 tracking-tight">
                  = {item.result}
                </span>

                {/* Single entry delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                  title="Delete this entry"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick footer note */}
      {history.length > 0 && (
        <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
          Click any entry to load into calculator
        </div>
      )}

      {/* BACKUP / EXPORT MODAL */}
      {modalMode === 'export' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                <Download className="w-4 h-4" />
                <span>Backup Calculation History</span>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Export your calculation history as a JSON backup file or copy the raw JSON data to
              your clipboard. You can restore this file anytime on any browser.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Total records:</span>
                <span className="text-slate-200">{history.length} items</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Format:</span>
                <span className="text-slate-200">Standard Lunar JSON v1.0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={history.length === 0}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .JSON</span>
              </button>

              <button
                type="button"
                onClick={handleCopyBackup}
                disabled={history.length === 0}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE / IMPORT MODAL */}
      {modalMode === 'import' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Restore Calculation History</span>
              </div>
              <button
                onClick={() => {
                  setModalMode(null);
                  setImportStatus(null);
                  setImportText('');
                }}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a previously exported JSON backup file, or paste raw JSON text below to
              restore your history.
            </p>

            {/* Upload File button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-xl bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
            >
              <FileText className="w-5 h-5 text-slate-400 group-hover:text-cyan-300" />
              <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-200">
                Choose .JSON Backup File
              </span>
              <span className="text-[11px] text-slate-500">Click to browse your device</span>
            </button>

            {/* Or Paste JSON text */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Or paste backup JSON text:
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"app": "lunar-calc", "history": [...]}'
                rows={3}
                className="w-full p-2.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 resize-none"
              />
            </div>

            {/* Status alerts */}
            {importStatus && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalMode(null);
                  setImportStatus(null);
                  setImportText('');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => processImportString(importText.trim())}
                disabled={!importText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
              >
                Restore from Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
