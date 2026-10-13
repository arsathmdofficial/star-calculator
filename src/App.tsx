/**
 * Lunar Calc - Moon & Night Sky Professional Calculator
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HistoryItem } from './types/calculator.ts';
import {
  cleanNumber,
  executeBinaryOp,
  evaluateSafeExpression,
} from './utils/calculatorEngine.ts';
import { soundEffects } from './utils/audioFeedback.ts';
import { NightSkyCanvas } from './components/NightSkyCanvas.tsx';
import { GlowingMoon } from './components/GlowingMoon.tsx';
import { WelcomeIntro } from './components/WelcomeIntro.tsx';
import { CalculatorDisplay } from './components/CalculatorDisplay.tsx';
import { CalculatorKeypad } from './components/CalculatorKeypad.tsx';
import { HistoryPanel } from './components/HistoryPanel.tsx';
import { TopBar } from './components/TopBar.tsx';
import { Moon, Sparkles, Keyboard } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'lunar_calc_history_v1';
const STORAGE_KEY_INTRO_SEEN = 'lunar_calc_intro_seen';

export default function App() {
  // Intro State
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Check if intro has already run in current session or default to true
    try {
      const seen = sessionStorage.getItem(STORAGE_KEY_INTRO_SEEN);
      return seen !== 'true';
    } catch {
      return true;
    }
  });

  // UI state
  const [isScientificMode, setIsScientificMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundEffects.enabled);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [activeKeyFeedback, setActiveKeyFeedback] = useState<string | null>(null);

  // Calculator State
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<'+' | '−' | '×' | '÷' | '^' | 'mod' | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Flash key feedback
  const triggerKeyFeedback = (key: string) => {
    setActiveKeyFeedback(key);
    setTimeout(() => {
      setActiveKeyFeedback((curr) => (curr === key ? null : curr));
    }, 150);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    soundEffects.setEnabled(next);
  };

  // Complete intro
  const handleCompleteIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem(STORAGE_KEY_INTRO_SEEN, 'true');
    } catch {
      // ignore
    }
  };

  // Replay intro
  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // DIGIT ENTRY
  const handleDigit = useCallback(
    (digit: string) => {
      triggerKeyFeedback(digit);
      soundEffects.playClick('digit');

      if (isError) {
        setDisplay(digit);
        setExpression('');
        setIsError(false);
        setErrorMessage(null);
        setWaitingForOperand(false);
        return;
      }

      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        if (display === '0') {
          setDisplay(digit);
        } else {
          // Limit max length to avoid overflow
          if (display.replace(/[^0-9]/g, '').length < 16) {
            setDisplay(display + digit);
          }
        }
      }
    },
    [display, waitingForOperand, isError]
  );

  // DECIMAL ENTRY
  const handleDecimal = useCallback(() => {
    triggerKeyFeedback('.');
    soundEffects.playClick('digit');

    if (isError) {
      setDisplay('0.');
      setExpression('');
      setIsError(false);
      setErrorMessage(null);
      setWaitingForOperand(false);
      return;
    }

    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand, isError]);

  // OPERATOR ENTRY (+, −, ×, ÷, ^, mod)
  const handleOperator = useCallback(
    (nextOperator: '+' | '−' | '×' | '÷' | '^' | 'mod') => {
      triggerKeyFeedback(nextOperator);
      soundEffects.playClick('operator');

      if (isError) {
        setIsError(false);
        setErrorMessage(null);
      }

      const inputValue = parseFloat(display);

      if (previousValue !== null && !waitingForOperand && operator) {
        // Evaluate running total
        const { result, error } = executeBinaryOp(previousValue, inputValue, operator);
        if (error) {
          setIsError(true);
          setErrorMessage(error);
          soundEffects.playError();
          return;
        }

        setDisplay(String(result));
        setPreviousValue(result);
        setExpression(`${cleanNumber(result)} ${nextOperator}`);
      } else {
        setPreviousValue(inputValue);
        setExpression(`${cleanNumber(inputValue)} ${nextOperator}`);
      }

      setOperator(nextOperator);
      setWaitingForOperand(true);
    },
    [display, previousValue, operator, waitingForOperand, isError]
  );

  // EQUALS / EVALUATE
  const handleEquals = useCallback(() => {
    triggerKeyFeedback('=');

    if (isError) {
      soundEffects.playError();
      return;
    }

    const currentValue = parseFloat(display);

    if (operator && previousValue !== null) {
      const { result, error } = executeBinaryOp(previousValue, currentValue, operator);

      if (error) {
        setIsError(true);
        setErrorMessage(error);
        soundEffects.playError();
        return;
      }

      const formattedResult = String(result);
      const fullExpression = `${cleanNumber(previousValue)} ${operator} ${cleanNumber(currentValue)}`;

      // Save to history
      const newHistoryItem: HistoryItem = {
        id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        expression: fullExpression,
        result: formattedResult,
        timestamp: Date.now(),
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 100)); // Keep up to 100 records
      setDisplay(formattedResult);
      setExpression(`${fullExpression} =`);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      soundEffects.playClick('equals');
    } else if (expression.includes('(') || expression.includes('^')) {
      // Evaluate complex / parenthesis formula
      const fullExpression = `${expression} ${display}`;
      const { result, error } = evaluateSafeExpression(fullExpression);

      if (error) {
        setIsError(true);
        setErrorMessage(error);
        soundEffects.playError();
        return;
      }

      const formattedResult = String(result);
      const newHistoryItem: HistoryItem = {
        id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        expression: fullExpression,
        result: formattedResult,
        timestamp: Date.now(),
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 100));
      setDisplay(formattedResult);
      setExpression(`${fullExpression} =`);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      soundEffects.playClick('equals');
    } else {
      // Just chime if equals hit on a standalone number
      soundEffects.playClick('equals');
    }
  }, [display, previousValue, operator, expression, isError]);

  // ALL CLEAR (AC)
  const handleAllClear = useCallback(() => {
    triggerKeyFeedback('ac');
    soundEffects.playClick('action');
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setIsError(false);
    setErrorMessage(null);
  }, []);

  // CLEAR ENTRY (CE)
  const handleClearEntry = useCallback(() => {
    triggerKeyFeedback('ce');
    soundEffects.playClick('action');
    setDisplay('0');
    setIsError(false);
    setErrorMessage(null);
    // Preserves expression, previousValue, and operator!
  }, []);

  // BACKSPACE
  const handleBackspace = useCallback(() => {
    triggerKeyFeedback('Backspace');
    soundEffects.playClick('action');

    if (isError) {
      setDisplay('0');
      setIsError(false);
      setErrorMessage(null);
      return;
    }

    if (waitingForOperand) {
      return;
    }

    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand, isError]);

  // PERCENTAGE (%)
  const handlePercentage = useCallback(() => {
    triggerKeyFeedback('%');
    soundEffects.playClick('operator');

    if (isError) return;

    const current = parseFloat(display);
    let result: number;

    if (operator && previousValue !== null) {
      // Contextual percentage: e.g. 200 + 10% = 10% of 200 = 20
      result = cleanNumber((previousValue * current) / 100);
    } else {
      // Standalone percentage: 50% = 0.5
      result = cleanNumber(current / 100);
    }

    setDisplay(String(result));
  }, [display, operator, previousValue, isError]);

  // TOGGLE SIGN (±)
  const handleToggleSign = useCallback(() => {
    triggerKeyFeedback('±');
    soundEffects.playClick('action');

    if (isError || display === '0') return;

    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  }, [display, isError]);

  // SCIENTIFIC FUNCTIONS
  const handleScientificFunc = useCallback(
    (func: 'sqrt' | 'sqr' | 'reciprocal' | 'pi' | 'e' | '(' | ')') => {
      soundEffects.playClick('action');

      if (isError) {
        setIsError(false);
        setErrorMessage(null);
      }

      const current = parseFloat(display);

      switch (func) {
        case 'sqrt':
          if (current < 0) {
            setIsError(true);
            setErrorMessage('Invalid Input (Negative Root)');
            soundEffects.playError();
            return;
          }
          {
            const res = cleanNumber(Math.sqrt(current));
            setExpression(`√(${cleanNumber(current)})`);
            setDisplay(String(res));
            setWaitingForOperand(true);
          }
          break;

        case 'sqr':
          {
            const res = cleanNumber(current * current);
            setExpression(`sqr(${cleanNumber(current)})`);
            setDisplay(String(res));
            setWaitingForOperand(true);
          }
          break;

        case 'reciprocal':
          if (current === 0) {
            setIsError(true);
            setErrorMessage('Cannot divide by zero');
            soundEffects.playError();
            return;
          }
          {
            const res = cleanNumber(1 / current);
            setExpression(`1 / (${cleanNumber(current)})`);
            setDisplay(String(res));
            setWaitingForOperand(true);
          }
          break;

        case 'pi':
          setDisplay(String(cleanNumber(Math.PI)));
          setWaitingForOperand(false);
          break;

        case 'e':
          setDisplay(String(cleanNumber(Math.E)));
          setWaitingForOperand(false);
          break;

        case '(':
          setExpression((prev) => (prev ? `${prev} (` : '('));
          setWaitingForOperand(true);
          break;

        case ')':
          setExpression((prev) => `${prev} ${display} )`);
          setWaitingForOperand(true);
          break;
      }
    },
    [display, isError]
  );

  // LOAD FROM HISTORY
  const handleSelectHistoryItem = (item: HistoryItem) => {
    soundEffects.playClick('action');
    setDisplay(item.result);
    setExpression(`${item.expression} =`);
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setIsError(false);
    setErrorMessage(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    soundEffects.playClick('action');
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    soundEffects.playClick('action');
    setHistory([]);
  };

  const handleRestoreHistory = (importedItems: HistoryItem[]) => {
    soundEffects.playSuccessChime();
    setHistory(importedItems);
  };

  // KEYBOARD EVENT LISTENER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or textarea modal
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        handleDigit(key);
      } else if (key === '.' || key === ',') {
        handleDecimal();
      } else if (key === '+') {
        handleOperator('+');
      } else if (key === '-') {
        handleOperator('−');
      } else if (key === '*' || key.toLowerCase() === 'x') {
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === '%') {
        handlePercentage();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        handleAllClear();
      } else if (key === 'Delete') {
        handleClearEntry();
      } else if (key === '(' || key === ')') {
        handleScientificFunc(key);
      } else if (key === '^') {
        handleOperator('^');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handlePercentage,
    handleEquals,
    handleBackspace,
    handleAllClear,
    handleClearEntry,
    handleScientificFunc,
  ]);

  return (
    <div className="relative min-h-screen bg-[#04060e] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Starry Night Sky Canvas */}
      <NightSkyCanvas />

      {/* Welcome Intro Cinematic Screen */}
      {showIntro && <WelcomeIntro onComplete={handleCompleteIntro} />}

      {/* Top Bar Header */}
      <TopBar
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
        historyCount={history.length}
        onToggleScientific={() => setIsScientificMode((prev) => !prev)}
        isScientificMode={isScientificMode}
        onToggleSound={handleToggleSound}
        isSoundEnabled={isSoundEnabled}
        onReplayIntro={handleReplayIntro}
        onOpenBackup={() => setIsHistoryOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 md:py-6 flex flex-col items-center justify-center z-10 relative">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start justify-center">
          {/* Main Calculator Unit Column */}
          <div
            className={`w-full transition-all duration-300 mx-auto ${
              isHistoryOpen ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3 max-w-lg'
            }`}
          >
            {/* Themed Glassmorphic Calculator Enclosure */}
            <div className="relative rounded-3xl bg-slate-900/75 border border-slate-700/60 p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 sm:space-y-5">
              {/* Subtle Celestial Ambient Backdrop Accent inside calculator */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
                aria-hidden="true"
              />

              {/* Calculator Header Ribbon */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium tracking-wider uppercase text-[11px] text-slate-300">
                    Lunar Engine
                  </span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isScientificMode ? 'Scientific 12-Digit' : 'Standard 12-Digit'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowKeyboardHelp((prev) => !prev)}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors cursor-pointer"
                    title="Keyboard shortcuts guide"
                    aria-label="Keyboard guide"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Calculator Display Screen */}
              <CalculatorDisplay
                display={display}
                expression={expression}
                isError={isError}
                errorMessage={errorMessage}
                activeOperator={operator}
              />

              {/* Keypad */}
              <CalculatorKeypad
                onDigit={handleDigit}
                onDecimal={handleDecimal}
                onOperator={handleOperator}
                onEquals={handleEquals}
                onAllClear={handleAllClear}
                onClearEntry={handleClearEntry}
                onBackspace={handleBackspace}
                onPercentage={handlePercentage}
                onToggleSign={handleToggleSign}
                onScientificFunc={handleScientificFunc}
                isScientificMode={isScientificMode}
                activeOperator={operator}
                activeKeyFeedback={activeKeyFeedback}
              />
            </div>
          </div>

          {/* Desktop Side History Column / or Moon Stage */}
          {isHistoryOpen ? (
            <div className="w-full lg:col-span-5 h-[580px] sm:h-[620px] transition-all duration-300 animate-fade-in">
              <HistoryPanel
                history={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onClearAllHistory={handleClearAllHistory}
                onRestoreHistory={handleRestoreHistory}
                onClose={() => setIsHistoryOpen(false)}
                isDrawer={false}
              />
            </div>
          ) : (
            /* When history is closed on desktop: show the gorgeous glowing celestial moon showcase with moon information */
            <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-center p-6 space-y-5 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md self-center">
              <GlowingMoon size="lg" />
              <div className="text-center space-y-1.5 max-w-xs">
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Lunar Precision Core</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineered with floating-point stabilization, local history persistence, and full
                  keyboard support.
                </p>
              </div>

              <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>History: {history.length} records</span>
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  View History →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Overlay Modal */}
        {showKeyboardHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                  <Keyboard className="w-4 h-4" />
                  <span>Keyboard Shortcuts</span>
                </div>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">0 - 9</span>
                  <span className="text-slate-200">Numbers</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">+ − * /</span>
                  <span className="text-slate-200">Operators</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Enter / =</span>
                  <span className="text-slate-200">Calculate</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Backspace</span>
                  <span className="text-slate-200">Delete ⌫</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Esc / C</span>
                  <span className="text-slate-200">All Clear</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Del</span>
                  <span className="text-slate-200">Clear Entry</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">%</span>
                  <span className="text-slate-200">Percent</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">^ / ( )</span>
                  <span className="text-slate-200">Scientific</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowKeyboardHelp(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile History Drawer when open on small screens */}
      {isHistoryOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-md h-[90vh] max-h-[640px]">
            <HistoryPanel
              history={history}
              onSelectHistoryItem={(item) => {
                handleSelectHistoryItem(item);
                setIsHistoryOpen(false);
              }}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearAllHistory={handleClearAllHistory}
              onRestoreHistory={handleRestoreHistory}
              onClose={() => setIsHistoryOpen(false)}
              isDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 z-10 relative border-t border-slate-800/40">
        <div className="flex items-center gap-2">
          <span>Lunar Calc</span>
          <span aria-hidden="true">·</span>
          <span>Night Sky Edition</span>
          <span aria-hidden="true">·</span>
          <span>Persistent Storage</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Offline Ready</span>
          <span aria-hidden="true">·</span>
          <span>Web Audio Synthesis</span>
        </div>
      </footer>
    </div>
  );
}
