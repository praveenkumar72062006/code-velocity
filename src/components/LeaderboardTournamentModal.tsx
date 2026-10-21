import React, { useState, useEffect } from 'react';
import { X, Trophy, Swords, Ghost, Medal, Play, RefreshCw, Flame, UserCheck } from 'lucide-react';
import { SupportedLanguage, LANGUAGE_META } from '../data/codeSnippets';
import { storageService, LeaderboardRecord } from '../services/storageService';

interface Match {
  id: string;
  p1: string;
  p2: string;
  score1: number;
  score2: number;
  winner: string;
}

interface Round {
  roundNumber: number;
  title: string;
  matches: Match[];
}

interface Tournament {
  id: string;
  name: string;
  rounds: Round[];
}

interface LeaderboardTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
  onChallengeGhost?: (wpm: number, name: string) => void;
}

export const LeaderboardTournamentModal: React.FC<LeaderboardTournamentModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onChallengeGhost,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'tournament' | 'ghosts'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterLang, setFilterLang] = useState<string>(selectedLanguage);

  useEffect(() => {
    if (isOpen) {
      setFilterLang(selectedLanguage);
      loadLeaderboard(selectedLanguage);
      loadTournament();
    }
  }, [isOpen, selectedLanguage]);

  const loadLeaderboard = async (lang: string) => {
    setIsLoading(true);
    try {
      // 1. Try server if available
      const res = await fetch(`/api/leaderboard?language=${lang}`);
      const data = await res.json();
      if (data.leaderboard && data.leaderboard.length > 0) {
        setLeaderboard(data.leaderboard);
        setIsLoading(false);
        return;
      }
    } catch (_) {}

    // 2. Load from storageService with real live updates
    const localRecords = storageService.getLeaderboard(lang);
    setLeaderboard(localRecords);
    setIsLoading(false);
  };

  const loadTournament = async () => {
    try {
      const res = await fetch('/api/tournaments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentName: 'Weekly Cohort Code Duel Cup' }),
      });
      const data = await res.json();
      if (data.tournament) {
        setTournament(data.tournament);
        return;
      }
    } catch (_) {}

    // Local Tournament Generation
    const records = storageService.getLeaderboard('all');
    const p1 = records[0]?.userName || 'Praveen Kumar';
    const p2 = records[1]?.userName || 'Alex Rivera';
    const p3 = records[2]?.userName || 'Sarah Chen';
    const p4 = records[3]?.userName || 'Marcus Vance';

    setTournament({
      id: `tourn_${Date.now()}`,
      name: 'Global Code Velocity Cup',
      rounds: [
        {
          roundNumber: 1,
          title: 'Semifinals',
          matches: [
            { id: 'm1', p1, p2, score1: 118, score2: 104, winner: p1 },
            { id: 'm2', p1: p3, p2: p4, score1: 99, score2: 92, winner: p3 },
          ],
        },
        {
          roundNumber: 2,
          title: 'Grand Finals',
          matches: [
            { id: 'm3', p1, p2: p3, score1: 124, score2: 110, winner: p1 },
          ],
        },
      ],
    });
  };

  if (!isOpen) return null;

  const currentMeta = LANGUAGE_META[selectedLanguage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 p-6 relative shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono tracking-wide">ESPORTS LEADERBOARD & ARENA</h2>
              <p className="text-xs text-slate-400">Real-time global rankings, dynamic brackets & ghost time-trials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Rankings
            </button>
            <button
              onClick={() => setActiveTab('tournament')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tournament'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Tournament Bracket
            </button>
            <button
              onClick={() => setActiveTab('ghosts')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ghosts'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ghost className="w-3.5 h-3.5" />
              Ghost Duels
            </button>
          </div>

          {/* Language Selector for Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div className="flex items-center gap-2">
              <select
                value={filterLang}
                onChange={(e) => {
                  setFilterLang(e.target.value);
                  loadLeaderboard(e.target.value);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-sky-400 font-mono focus:outline-none cursor-pointer"
              >
                <option value="all">🌐 All Languages</option>
                <option value="python">🐍 Python</option>
                <option value="javascript">⚡ JavaScript</option>
                <option value="typescript">🔷 TypeScript</option>
                <option value="java">☕ Java</option>
                <option value="cpp">⚙️ C++</option>
                <option value="rust">🦀 Rust</option>
                <option value="go">🐹 Go</option>
                <option value="sql">🗄️ SQL</option>
                <option value="html">🌐 HTML/CSS</option>
              </select>
              <button
                onClick={() => loadLeaderboard(filterLang)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                title="Refresh rankings"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Leaderboard Table */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-900/60 rounded-lg border border-slate-800/80">
              <span className="col-span-1">Rank</span>
              <span className="col-span-4">Developer</span>
              <span className="col-span-3">Language & Snippet</span>
              <span className="col-span-2 text-right">Speed (WPM)</span>
              <span className="col-span-2 text-right">Action</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No records yet for this language. Complete a race to claim Rank #1!
                </div>
              ) : (
                leaderboard.map((item, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <div
                      key={item.id || idx}
                      className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl border transition-all ${
                        item.isMe
                          ? 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                          : isTop3
                          ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/50'
                          : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex items-center gap-1 font-mono font-black text-sm">
                        {idx === 0 && <Medal className="w-4 h-4 text-amber-400" />}
                        {idx === 1 && <Medal className="w-4 h-4 text-slate-300" />}
                        {idx === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                        {idx > 2 && <span className="text-slate-500">#{idx + 1}</span>}
                      </div>

                      {/* Developer */}
                      <div className="col-span-4 flex items-center gap-2">
                        <img
                          src={item.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.userName}`}
                          alt={item.userName}
                          className="w-7 h-7 rounded-lg border border-slate-700 bg-slate-950"
                        />
                        <div className="truncate">
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span className="truncate">{item.userName}</span>
                            {item.isMe && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500 text-slate-950">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                        </div>
                      </div>

                      {/* Language & Snippet */}
                      <div className="col-span-3 text-xs truncate">
                        <span className="font-mono text-sky-400 text-[11px] uppercase mr-1.5">[{item.language}]</span>
                        <span className="text-slate-300 text-[11px]">{item.snippetTitle}</span>
                      </div>

                      {/* WPM & Accuracy */}
                      <div className="col-span-2 text-right font-mono">
                        <div className="font-black text-sm text-amber-400">{item.wpm} WPM</div>
                        <div className="text-[10px] text-emerald-400">{item.accuracy}% ACC</div>
                      </div>

                      {/* Challenge Button */}
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => {
                            if (onChallengeGhost) onChallengeGhost(item.wpm, item.userName);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Ghost className="w-3 h-3" />
                          Duel Ghost
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Tournament Bracket */}
        {activeTab === 'tournament' && (
          <div className="flex flex-col gap-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-400 font-mono">
                  {tournament?.name || 'Code Duel Bracket'}
                </h3>
                <p className="text-xs text-slate-400">Automated 8-Player Knockout Championship</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ACTIVE COHORT
              </span>
            </div>

            {/* Bracket Visualization */}
            <div className="grid grid-cols-2 gap-4">
              {tournament?.rounds.map((round) => (
                <div key={round.roundNumber} className="flex flex-col gap-3">
                  <div className="text-xs font-bold font-mono text-slate-400 uppercase border-b border-slate-800 pb-1">
                    {round.title}
                  </div>
                  <div className="flex flex-col gap-3">
                    {round.matches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5 text-xs font-mono"
                      >
                        <div
                          className={`flex items-center justify-between p-1.5 rounded ${
                            m.winner === m.p1 ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-slate-400'
                          }`}
                        >
                          <span className="truncate">{m.p1}</span>
                          <span className="text-amber-400 font-bold">{m.score1} WPM</span>
                        </div>
                        <div className="h-px bg-slate-800" />
                        <div
                          className={`flex items-center justify-between p-1.5 rounded ${
                            m.winner === m.p2 ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-slate-400'
                          }`}
                        >
                          <span className="truncate">{m.p2}</span>
                          <span className="text-amber-400 font-bold">{m.score2} WPM</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Ghost Duels */}
        {activeTab === 'ghosts' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs">
              <strong>Asynchronous Ghost Mode:</strong> Race against saved runs from top community developers.
              Their exact typing velocity timeline is replayed live on your track!
            </div>

            <div className="grid grid-cols-2 gap-3">
              {leaderboard.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <Ghost className="w-3.5 h-3.5 text-purple-400" />
                      {item.userName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {item.language.toUpperCase()} • {item.wpm} WPM
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onChallengeGhost) onChallengeGhost(item.wpm, item.userName);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Race Ghost
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
