import React from 'react';
import { Moon, Volume2, VolumeX, History, FlaskConical, RotateCcw, DownloadCloud } from 'lucide-react';

interface TopBarProps {
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  historyCount: number;
  onToggleScientific: () => void;
  isScientificMode: boolean;
  onToggleSound: () => void;
  isSoundEnabled: boolean;
  onReplayIntro: () => void;
  onOpenBackup: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleHistory,
  isHistoryOpen,
  historyCount,
  onToggleScientific,
  isScientificMode,
  onToggleSound,
  isSoundEnabled,
  onReplayIntro,
  onOpenBackup,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3.5 z-20 relative select-none">
      {/* Zone 1: Brand wordmark (single element) */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-300 shadow-sm shadow-cyan-500/20">
          <Moon className="w-4 h-4" />
        </div>
        <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
          Lunar Calc
        </span>
      </div>

      {/* Zone 2: Nav Controls (single-line, clean subtle buttons) */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-slate-300 overflow-x-auto no-scrollbar">
        {/* History Toggle */}
        <button
          onClick={onToggleHistory}
          type="button"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isHistoryOpen
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
          title="Toggle Calculation History"
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="font-mono text-[10px] text-slate-400">
              ({historyCount})
            </span>
          )}
        </button>

        {/* Scientific Mode Toggle */}
        <button
          onClick={onToggleScientific}
          type="button"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isScientificMode
              ? 'bg-sky-500/20 text-sky-200 border border-sky-500/30'
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
          title="Toggle Scientific keypad extensions"
        >
          <FlaskConical className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Scientific</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          type="button"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isSoundEnabled
              ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/40'
          }`}
          title={isSoundEnabled ? 'Audio clicks enabled' : 'Audio muted'}
          aria-label="Toggle Sound"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="hidden md:inline">{isSoundEnabled ? 'Sound' : 'Muted'}</span>
        </button>

        {/* Replay Intro */}
        <button
          onClick={onReplayIntro}
          type="button"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Replay cinematic welcome intro"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Intro</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          onClick={onOpenBackup}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 hover:border-cyan-500/40 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer shadow-sm shadow-slate-900/50"
          title="Backup and Restore History"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Backup</span>
        </button>
      </div>
    </header>
  );
};
