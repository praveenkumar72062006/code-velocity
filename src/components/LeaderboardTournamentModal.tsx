import React, { useState, useEffect } from 'react';
import { X, Trophy, Swords, Ghost, Medal, Play, RefreshCw, Flame } from 'lucide-react';
import { SupportedLanguage, LANGUAGE_META } from '../data/codeSnippets';

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  language: string;
  snippetTitle: string;
  wpm: number;
  accuracy: number;
  timestamp: string;
}

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      fetchTournament();
    }
  }, [isOpen, selectedLanguage]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?language=${selectedLanguage}`);
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch (_) {
      // Fallback data
      setLeaderboard([
        { id: '1', userId: 'u1', userName: 'Alex Rivera', language: 'rust', snippetTitle: 'Concurrency Worker', wpm: 124, accuracy: 99.2, timestamp: 'Today' },
        { id: '2', userId: 'u2', userName: 'Sarah Chen', language: 'python', snippetTitle: 'Two Sum Algorithm', wpm: 108, accuracy: 98.6, timestamp: 'Today' },
        { id: '3', userId: 'u3', userName: 'Marcus Vance', language: 'cpp', snippetTitle: 'Safe Queue', wpm: 101, accuracy: 97.4, timestamp: 'Yesterday' },
        { id: '4', userId: 'u4', userName: 'Elena Rostova', language: 'typescript', snippetTitle: 'React Custom Hook', wpm: 94, accuracy: 99.0, timestamp: '2 days ago' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTournament = async () => {
    try {
      const res = await fetch('/api/tournaments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentName: 'Weekly Cohort Code Duel Cup' }),
      });
      const data = await res.json();
      if (data.tournament) setTournament(data.tournament);
    } catch (_) {}
  };

  if (!isOpen) return null;

  const currentMeta = LANGUAGE_META[selectedLanguage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 p-6 relative shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono tracking-wide">CODE ARENA ESPORTS</h2>
              <p className="text-xs text-slate-400">Leaderboards, Knockout Brackets & Asynchronous Ghosts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'leaderboard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Medal className="w-4 h-4" />
            {currentMeta.name} Rankings
          </button>

          <button
            onClick={() => setActiveTab('tournament')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tournament' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            Knockout Tournament
          </button>

          <button
            onClick={() => setActiveTab('ghosts')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ghosts' ? 'bg-purple-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ghost className="w-4 h-4" />
            Ghost Duels
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider">Top Typists for {currentMeta.name}</span>
              <button
                onClick={fetchLeaderboard}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">{entry.userName}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{entry.snippetTitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-base font-black text-sky-400">{entry.wpm} WPM</div>
                      <div className="text-[10px] text-emerald-400">{entry.accuracy}% Acc</div>
                    </div>

                    <button
                      onClick={() => {
                        onChallengeGhost?.(entry.wpm, entry.userName);
                        onClose();
                      }}
                      title="Race against this user's ghost run"
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ghost className="w-3.5 h-3.5" /> Race Ghost
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TOURNAMENT BRACKET */}
        {activeTab === 'tournament' && tournament && (
          <div>
            <div className="mb-4 text-center">
              <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">KNOCKOUT BRACKET</span>
              <h3 className="text-lg font-black text-slate-100 font-mono">{tournament.name}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              {tournament.rounds.map(round => (
                <div key={round.roundNumber} className="flex flex-col gap-3">
                  <div className="text-xs uppercase font-bold text-slate-400 border-b border-slate-800 pb-1 text-center">
                    {round.title}
                  </div>

                  <div className="flex flex-col justify-around gap-3 h-full">
                    {round.matches.map(m => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5 text-xs shadow-sm"
                      >
                        <div
                          className={`flex items-center justify-between p-1.5 rounded ${
                            m.winner === m.p1 ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
                          }`}
                        >
                          <span>{m.p1}</span>
                          <span className="font-mono">{m.score1} WPM</span>
                        </div>
                        <div
                          className={`flex items-center justify-between p-1.5 rounded ${
                            m.winner === m.p2 ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
                          }`}
                        >
                          <span>{m.p2}</span>
                          <span className="font-mono">{m.score2} WPM</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ASYNCHRONOUS GHOSTS */}
        {activeTab === 'ghosts' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                  <Ghost className="w-4 h-4" />
                  Asynchronous Peer Challenges
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Not everyone is online at the same time. Race your friends' recorded keystroke telemetry!
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <div className="font-bold text-sm text-slate-100">Alex Rivera (Ghost)</div>
                  <div className="text-[10px] text-slate-400">Two Sum Algorithm • 124 WPM</div>
                </div>
                <button
                  onClick={() => {
                    onChallengeGhost?.(124, 'Alex (Ghost)');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Race Ghost
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <div className="font-bold text-sm text-slate-100">Sarah Chen (Ghost)</div>
                  <div className="text-[10px] text-slate-400">Thread-Safe Singleton • 108 WPM</div>
                </div>
                <button
                  onClick={() => {
                    onChallengeGhost?.(108, 'Sarah (Ghost)');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Race Ghost
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
