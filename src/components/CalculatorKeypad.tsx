import React from 'react';
import { Delete } from 'lucide-react';

interface CalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperator: (op: '+' | '−' | '×' | '÷' | '^' | 'mod') => void;
  onEquals: () => void;
  onAllClear: () => void;
  onClearEntry: () => void;
  onBackspace: () => void;
  onPercentage: () => void;
  onToggleSign: () => void;
  onScientificFunc: (func: 'sqrt' | 'sqr' | 'reciprocal' | 'pi' | 'e' | '(' | ')') => void;
  isScientificMode: boolean;
  activeOperator: string | null;
  activeKeyFeedback: string | null;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  onDigit,
  onDecimal,
  onOperator,
  onEquals,
  onAllClear,
  onClearEntry,
  onBackspace,
  onPercentage,
  onToggleSign,
  onScientificFunc,
  isScientificMode,
  activeOperator,
  activeKeyFeedback,
}) => {
  // Helper for button classes
  const isKeyActive = (keyIdentifier: string) => activeKeyFeedback === keyIdentifier;

  return (
    <div className="w-full space-y-2 sm:space-y-3">
      {/* Scientific Row (Expandable or always visible based on toggle) */}
      {isScientificMode && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 backdrop-blur-md animate-fade-in">
          <button
            onClick={() => onScientificFunc('(')}
            type="button"
            className="h-10 sm:h-11 rounded-lg bg-slate-800/70 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-mono border border-slate-700/40 hover:border-slate-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Open parenthesis"
          >
            (
          </button>
          <button
            onClick={() => onScientificFunc(')')}
            type="button"
            className="h-10 sm:h-11 rounded-lg bg-slate-800/70 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-mono border border-slate-700/40 hover:border-slate-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Close parenthesis"
          >
            )
          </button>
          <button
            onClick={() => onScientificFunc('sqrt')}
            type="button"
            className="h-10 sm:h-11 rounded-lg bg-slate-800/70 hover:bg-slate-750 text-sky-300 text-xs sm:text-sm font-mono border border-slate-700/40 hover:border-sky-500/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Square root (√x)"
          >
            √x
          </button>
          <button
            onClick={() => onScientificFunc('sqr')}
            type="button"
            className="h-10 sm:h-11 rounded-lg bg-slate-800/70 hover:bg-slate-750 text-sky-300 text-xs sm:text-sm font-mono border border-slate-700/40 hover:border-sky-500/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Square (x²)"
          >
            x²
          </button>
          <button
            onClick={() => onOperator('^')}
            type="button"
            className={`h-10 sm:h-11 rounded-lg text-xs sm:text-sm font-mono border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              activeOperator === '^'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-slate-800/70 hover:bg-slate-750 text-sky-300 border-slate-700/40'
            }`}
            title="Power (x^y)"
          >
            xʸ
          </button>
          <button
            onClick={() => onScientificFunc('reciprocal')}
            type="button"
            className="h-10 sm:h-11 rounded-lg bg-slate-800/70 hover:bg-slate-750 text-slate-300 text-xs sm:text-sm font-mono border border-slate-700/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Reciprocal (1/x)"
          >
            1/x
          </button>
          <button
            onClick={() => onScientificFunc('pi')}
            type="button"
            className="h-10 sm:h-11 rounded-lg bg-slate-800/70 hover:bg-slate-750 text-amber-200 text-xs sm:text-sm font-mono border border-slate-700/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Pi (π ≈ 3.14159)"
          >
            π
          </button>
        </div>
      )}

      {/* Main 4x5 Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Row 1: AC, CE, ⌫, ÷ */}
        <button
          onClick={onAllClear}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('Escape') || isKeyActive('ac')
              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/40'
              : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-800/40'
          }`}
          title="All Clear (AC) - Resets all entries"
        >
          AC
        </button>

        <button
          onClick={onClearEntry}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('Delete') || isKeyActive('ce')
              ? 'bg-slate-700 text-white border-slate-500'
              : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700/60'
          }`}
          title="Clear Entry (CE) - Clears current number without resetting calculation"
        >
          CE
        </button>

        <button
          onClick={onBackspace}
          type="button"
          className={`h-12 sm:h-14 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('Backspace')
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700/60'
          }`}
          title="Backspace (⌫)"
          aria-label="Backspace"
        >
          <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() => onOperator('÷')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-lg sm:text-xl font-bold transition-all duration-150 active:scale-95 cursor-pointer border ${
            activeOperator === '÷' || isKeyActive('/')
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
              : 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border-cyan-800/50'
          }`}
          title="Division (÷)"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, × */}
        <button
          onClick={() => onDigit('7')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('7')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          7
        </button>
        <button
          onClick={() => onDigit('8')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('8')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          8
        </button>
        <button
          onClick={() => onDigit('9')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('9')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          9
        </button>
        <button
          onClick={() => onOperator('×')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-lg sm:text-xl font-bold transition-all duration-150 active:scale-95 cursor-pointer border ${
            activeOperator === '×' || isKeyActive('*')
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
              : 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border-cyan-800/50'
          }`}
          title="Multiplication (×)"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, − */}
        <button
          onClick={() => onDigit('4')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('4')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          4
        </button>
        <button
          onClick={() => onDigit('5')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('5')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          5
        </button>
        <button
          onClick={() => onDigit('6')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('6')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          6
        </button>
        <button
          onClick={() => onOperator('−')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-lg sm:text-xl font-bold transition-all duration-150 active:scale-95 cursor-pointer border ${
            activeOperator === '−' || isKeyActive('-')
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
              : 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border-cyan-800/50'
          }`}
          title="Subtraction (−)"
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, + */}
        <button
          onClick={() => onDigit('1')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('1')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          1
        </button>
        <button
          onClick={() => onDigit('2')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('2')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          2
        </button>
        <button
          onClick={() => onDigit('3')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('3')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          3
        </button>
        <button
          onClick={() => onOperator('+')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-lg sm:text-xl font-bold transition-all duration-150 active:scale-95 cursor-pointer border ${
            activeOperator === '+' || isKeyActive('+')
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
              : 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border-cyan-800/50'
          }`}
          title="Addition (+)"
        >
          +
        </button>

        {/* Row 5: ±, 0, ., % */}
        <button
          onClick={onToggleSign}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-sm sm:text-base font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('±')
              ? 'bg-slate-700 text-white border-slate-500'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border-slate-800'
          }`}
          title="Toggle positive/negative (±)"
        >
          ±
        </button>
        <button
          onClick={() => onDigit('0')}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-base sm:text-lg font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('0')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
        >
          0
        </button>
        <button
          onClick={onDecimal}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-lg sm:text-xl font-bold transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('.')
              ? 'bg-slate-700 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800'
          }`}
          title="Decimal point (.)"
        >
          .
        </button>
        <button
          onClick={onPercentage}
          type="button"
          className={`h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold transition-all duration-150 active:scale-95 cursor-pointer border ${
            isKeyActive('%')
              ? 'bg-slate-700 text-amber-300 border-amber-400'
              : 'bg-slate-900/90 hover:bg-slate-800/90 text-amber-300 border-slate-800'
          }`}
          title="Percentage (%)"
        >
          %
        </button>
      </div>

      {/* Primary Equals Action Button (Large Full-Width / Prominent Luminous Bar) */}
      <button
        onClick={onEquals}
        type="button"
        className={`w-full h-12 sm:h-14 rounded-xl text-xl font-bold tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border shadow-lg ${
          isKeyActive('Enter') || isKeyActive('=')
            ? 'bg-cyan-400 text-slate-950 border-white shadow-cyan-400/50'
            : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-450 hover:to-blue-500 text-white border-cyan-400/50 shadow-cyan-500/25'
        }`}
        title="Calculate result (= or Enter)"
      >
        <span>=</span>
      </button>
    </div>
  );
};
