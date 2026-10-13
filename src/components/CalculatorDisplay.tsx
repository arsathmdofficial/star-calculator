import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { formatDisplayValue } from '../utils/calculatorEngine.ts';

interface CalculatorDisplayProps {
  display: string;
  expression: string;
  isError: boolean;
  errorMessage: string | null;
  activeOperator: string | null;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  display,
  expression,
  isError,
  errorMessage,
  activeOperator,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (isError) return;
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const formattedDisplay = isError
    ? (errorMessage || 'Error')
    : formatDisplayValue(display);

  // Dynamic text size based on character count
  const getFontSize = () => {
    if (isError) return 'text-xl sm:text-2xl text-rose-300 font-medium';
    const len = formattedDisplay.length;
    if (len <= 8) return 'text-4xl sm:text-5xl font-bold';
    if (len <= 12) return 'text-3xl sm:text-4xl font-bold';
    if (len <= 16) return 'text-2xl sm:text-3xl font-semibold';
    return 'text-xl sm:text-2xl font-semibold';
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-950/80 border border-slate-700/60 p-4 sm:p-5 shadow-inner backdrop-blur-md transition-all duration-200">
      {/* Top row: expression preview & operator badge & copy action */}
      <div className="flex items-center justify-between gap-2 min-h-[28px] mb-2 text-slate-400">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[85%] font-mono text-xs sm:text-sm tracking-wide text-slate-400 select-all">
          {expression ? (
            <span className="truncate">{expression}</span>
          ) : (
            <span className="text-slate-600 font-sans text-xs">Standard Lunar Engine</span>
          )}
          {activeOperator && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
              {activeOperator}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          type="button"
          disabled={isError}
          title={copied ? 'Copied to clipboard' : 'Copy value to clipboard'}
          className={`p-1.5 rounded-lg text-xs transition-colors duration-200 flex items-center gap-1 cursor-pointer ${
            copied
              ? 'text-emerald-400 bg-emerald-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          aria-label="Copy result"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono hidden sm:inline">Copied</span>
            </>
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Primary Display Readout */}
      <div className="flex items-end justify-end overflow-hidden min-h-[58px] sm:min-h-[68px]">
        {isError && (
          <AlertCircle className="w-5 h-5 text-rose-400 mr-2 shrink-0 self-center" />
        )}
        <div
          data-mono="true"
          className={`font-mono tabular-nums tracking-tight text-right text-slate-100 select-all break-all overflow-x-auto no-scrollbar ${getFontSize()}`}
          style={{ textShadow: isError ? 'none' : '0 0 16px rgba(186, 230, 253, 0.25)' }}
        >
          {formattedDisplay}
        </div>
      </div>
    </div>
  );
};
