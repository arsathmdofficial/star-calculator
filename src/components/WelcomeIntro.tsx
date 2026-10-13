import React, { useEffect, useState, useRef } from 'react';
import { GlowingMoon } from './GlowingMoon.tsx';
import { ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeIntroProps {
  onComplete: () => void;
}

export const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onComplete }) => {
  const sentence1Full = 'Welcome to Calculate!';
  const sentence2Full = "Interesting, really? You're studying?";

  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [sentence1Done, setSentence1Done] = useState(false);
  const [sentence2Done, setSentence2Done] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const addTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    let charIndex1 = 0;
    const typeSpeed = 45; // Smooth cinematic typing cadence

    // Start typing Sentence 1
    const interval1 = setInterval(() => {
      charIndex1++;
      setText1(sentence1Full.slice(0, charIndex1));
      if (charIndex1 >= sentence1Full.length) {
        clearInterval(interval1);
        setSentence1Done(true);

        // Pause 600ms before starting Sentence 2
        addTimeout(() => {
          let charIndex2 = 0;
          const interval2 = setInterval(() => {
            charIndex2++;
            setText2(sentence2Full.slice(0, charIndex2));
            if (charIndex2 >= sentence2Full.length) {
              clearInterval(interval2);
              setSentence2Done(true);

              // Sentence 2 is now completely displayed.
              // Requirement: "After both sentences have appeared, wait for exactly 2 seconds, then smoothly transition to the main calculator interface."
              const twoSecStart = Date.now();
              const progressInterval = setInterval(() => {
                const elapsed = Date.now() - twoSecStart;
                const ratio = Math.min(100, (elapsed / 2000) * 100);
                setProgressWidth(ratio);
                if (elapsed >= 2000) {
                  clearInterval(progressInterval);
                }
              }, 20);

              addTimeout(() => {
                setIsFadingOut(true);
                // Allow fade-out animation to complete (400ms)
                addTimeout(() => {
                  onComplete();
                }, 400);
              }, 2000); // EXACTLY 2 seconds
            }
          }, 40);
        }, 600);
      }
    }, typeSpeed);

    return () => {
      clearInterval(interval1);
      timersRef.current.forEach(clearTimeout);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#04060e] text-slate-100 transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial cosmic glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.05) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Skip Button in upper right */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-sm"
        title="Skip intro to open calculator immediately"
      >
        <span>Skip intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Center Cinematic Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-8">
        {/* Glowing Moon centerpiece */}
        <div className="transform transition-transform duration-1000 scale-100 hover:scale-105">
          <GlowingMoon size="lg" />
        </div>

        {/* Text Container with high-contrast cinematic typography */}
        <div className="min-h-[140px] flex flex-col items-center justify-center space-y-4 px-4">
          {/* Sentence 1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-slate-100 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
              {text1}
            </span>
            {!sentence1Done && (
              <span className="inline-block w-2.5 h-8 bg-cyan-400 animate-pulse rounded-sm" />
            )}
          </h1>

          {/* Sentence 2 */}
          <div className="min-h-[48px] flex items-center justify-center">
            {sentence1Done && (
              <p className="text-xl sm:text-2xl md:text-3xl font-medium text-sky-200/90 flex items-center gap-2 tracking-wide font-sans">
                <span className="italic">{text2}</span>
                {sentence1Done && !sentence2Done && (
                  <span className="inline-block w-2 h-6 bg-sky-300 animate-pulse rounded-sm" />
                )}
              </p>
            )}
          </div>
        </div>

        {/* 2-Second Transition Countdown Progress Bar */}
        <div className="w-48 h-1 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40 relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Subtle subtext once typing completes */}
        {sentence2Done && (
          <div className="text-xs text-slate-400/80 flex items-center gap-1.5 tracking-wider uppercase font-mono animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Preparing lunar workspace...</span>
          </div>
        )}
      </div>
    </div>
  );
};
