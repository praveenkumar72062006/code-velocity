import React from 'react';
import { Bug, Flame, ShieldAlert, Award, Terminal } from 'lucide-react';

interface BossRaidArenaProps {
  bossHp: number;
  maxBossHp: number;
  comboMultiplier: number;
  totalDamageDealt: number;
  activeRaidersCount: number;
  bossName?: string;
}

export const BossRaidArena: React.FC<BossRaidArenaProps> = ({
  bossHp,
  maxBossHp,
  comboMultiplier,
  totalDamageDealt,
  activeRaidersCount,
  bossName = 'THE PRODUCTION MEMORY LEAK (OOM EXCEPTION)',
}) => {
  const hpPercent = Math.max(0, Math.min(100, Math.round((bossHp / maxBossHp) * 100)));
  const isEnraged = hpPercent < 25;

  return (
    <div className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden border border-rose-500/30 text-slate-100">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <Bug className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono">
                CRITICAL SYSTEM ALERT: SEV-1
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                {activeRaidersCount} Engineers Debugging Live
              </span>
            </div>
            <h2 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-sky-400 font-mono">
              {bossName}
            </h2>
          </div>
        </div>

        {/* Combo Multiplier Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Flame className="w-5 h-5 text-amber-400 fill-current animate-bounce" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Clean Code Combo</div>
            <div className="text-lg font-black leading-tight text-amber-400">{comboMultiplier.toFixed(1)}x DPS</div>
          </div>
        </div>
      </div>

      {/* Boss Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-1.5 font-mono">
          <span className={isEnraged ? 'text-rose-400 animate-pulse' : 'text-slate-300'}>
            {isEnraged ? '🔥 CRITICAL CPU SPIKE: 99% SYSTEM LOAD!' : 'MEMORY LEAK SIZE'}
          </span>
          <span className="text-rose-300">
            {bossHp.toLocaleString()} / {maxBossHp.toLocaleString()} MB ({hpPercent}%)
          </span>
        </div>
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-rose-500/40 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isEnraged
                ? 'bg-gradient-to-r from-rose-600 to-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-rose-600 via-orange-500 to-emerald-400'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Raid Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Your Code Fix DPS</div>
          <div className="text-base font-black text-emerald-400 font-mono">
            {totalDamageDealt.toLocaleString()} HP Resolved
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Debug Metric</div>
          <div className="text-base font-black text-sky-400 font-mono">
            1 Syntax Line = Instant WPM
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium">Top Debuggers get +500 VC</span>
        </div>
      </div>
    </div>
  );
};
