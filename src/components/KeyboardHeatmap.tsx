import React from 'react';
import { ProblemKeyMap } from '../hooks/useTypingEngine';
import { Target, Zap, Code } from 'lucide-react';

interface KeyboardHeatmapProps {
  problemKeys: ProblemKeyMap;
  onStartDrill: (troublesomeKeys: string[]) => void;
  onStartSymbolDrill?: () => void;
}

const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.'],
];
const CODE_SYMBOLS_ROW = ['{', '}', '(', ')', '[', ']', ';', ':', '=', '>', '<', '_', '&', '|', '!'];

export const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({
  problemKeys,
  onStartDrill,
  onStartSymbolDrill,
}) => {
  const getKeyStats = (keyChar: string) => {
    const lower = keyChar.toLowerCase();
    const stats = problemKeys[lower] || problemKeys[keyChar];
    if (!stats || (stats.hits === 0 && stats.misses === 0)) {
      return { total: 0, accuracy: 100, colorClass: 'bg-slate-800/80 text-slate-400 border-slate-700/60' };
    }

    const total = stats.hits + stats.misses;
    const accuracy = Math.round((stats.hits / total) * 100);

    let colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    if (accuracy < 80) {
      colorClass = 'bg-rose-500/30 text-rose-300 border-rose-500/80 animate-pulse';
    } else if (accuracy < 92) {
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/60';
    }

    return { total, accuracy, colorClass };
  };

  const troublesome = Object.entries(problemKeys)
    .filter(([_, stats]) => stats.misses > 0 && stats.hits / (stats.hits + stats.misses) < 0.9)
    .sort((a, b) => b[1].misses - a[1].misses)
    .map(([char]) => char.toUpperCase());

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-sky-400">
            <Target className="w-5 h-5" />
            Code Syntax & Keystroke Accuracy Heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Tracks finger accuracy across alpha keys and critical programming symbols ({'{ } ( ) ; = >'}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onStartSymbolDrill && (
            <button
              onClick={onStartSymbolDrill}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold rounded-lg text-xs border border-sky-500/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Code className="w-4 h-4 text-sky-400" />
              Practice Code Symbols
            </button>
          )}

          {troublesome.length > 0 && (
            <button
              onClick={() => onStartDrill(troublesome)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-rose-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              Drill Problem Keys ({troublesome.slice(0, 4).join(', ')})
            </button>
          )}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> 95-100% (Clean)
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> 80-94% (Struggling)
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span> &lt;80% (Problem Key)
        </span>
      </div>

      {/* Code Syntax Row (Dedicated for Programmers) */}
      <div className="mb-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
        <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-2 self-start flex items-center gap-1">
          <Code className="w-3.5 h-3.5" /> High-Value Programming Syntax Row
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
          {CODE_SYMBOLS_ROW.map(sym => {
            const { accuracy, total, colorClass } = getKeyStats(sym);
            return (
              <div
                key={sym}
                title={total > 0 ? `${sym}: ${accuracy}% Accuracy (${total} hits)` : `${sym}: Untested`}
                className={`w-7 h-8 sm:w-9 sm:h-10 rounded-md border flex flex-col items-center justify-center font-mono font-bold text-xs shadow-sm transition-all duration-200 ${colorClass}`}
              >
                <span>{sym}</span>
                {total > 0 && <span className="text-[8px] opacity-75">{accuracy}%</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Standard QWERTY Layout */}
      <div className="flex flex-col gap-1.5 sm:gap-2 items-center py-2 select-none">
        {/* Number Row */}
        <div className="flex gap-1.5 sm:gap-2">
          {NUMBER_ROW.map(num => {
            const { accuracy, total, colorClass } = getKeyStats(num);
            return (
              <div
                key={num}
                className={`w-7 h-8 sm:w-9 sm:h-10 rounded-md border flex flex-col items-center justify-center font-mono font-bold text-xs shadow-sm ${colorClass}`}
              >
                <span>{num}</span>
              </div>
            );
          })}
        </div>

        {/* Alpha Rows */}
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 sm:gap-2">
            {row.map(key => {
              const { accuracy, total, colorClass } = getKeyStats(key);
              return (
                <div
                  key={key}
                  title={total > 0 ? `${key}: ${accuracy}% Accuracy (${total} keystrokes)` : `${key}: Untested`}
                  className={`w-8 h-9 sm:w-11 sm:h-12 rounded-lg border flex flex-col items-center justify-center font-mono font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 ${colorClass}`}
                >
                  <span>{key}</span>
                  {total > 0 && (
                    <span className="text-[9px] font-normal opacity-75 sm:block hidden">
                      {accuracy}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
