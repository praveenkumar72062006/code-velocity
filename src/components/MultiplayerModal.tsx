import React, { useState } from 'react';
import { X, Users, Play, Copy, Check, Radio } from 'lucide-react';

export interface RoomPlayer {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
  isHost: boolean;
}

export interface RoomData {
  id: string;
  hostId: string;
  status: 'LOBBY' | 'COUNTDOWN' | 'RACING' | 'FINISHED';
  targetText: string;
  mode: string;
  countdownSeconds: number;
  players: RoomPlayer[];
}

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerColor: string;
  roomData: RoomData | null;
  onCreateRoom: (mode: string) => void;
  onJoinRoom: (roomId: string) => void;
  onToggleReady: () => void;
  onStartRace: () => void;
  currentUserId: string;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  playerName,
  roomData,
  onCreateRoom,
  onJoinRoom,
  onToggleReady,
  onStartRace,
  currentUserId,
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedMode, setSelectedMode] = useState('sprint');

  if (!isOpen) return null;

  const copyRoomLink = () => {
    if (!roomData) return;
    navigator.clipboard.writeText(`${window.location.origin}?room=${roomData.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = roomData?.hostId === currentUserId;
  const currentPlayer = roomData?.players.find(p => p.id === currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700 p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide">MULTIPLAYER RACING</h2>
              <p className="text-xs text-slate-400">Low-latency live competition for 2 to 50 typists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Not in Room: Show Create / Join Form */}
        {!roomData ? (
          <div className="flex flex-col gap-6">
            {/* Create Room */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Create Private Lobby
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Host a heat with instant room code generation and custom rule presets.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Game Mode Preset</label>
                <select
                  value={selectedMode}
                  onChange={e => setSelectedMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="sprint">🏎️ Sprint Grand Prix (Standard)</option>
                  <option value="equalizer">⚖️ The Equalizer (% of Personal Best)</option>
                  <option value="code">💻 Developer Code Syntax</option>
                  <option value="boss_raid">🐉 Co-op World Boss</option>
                </select>
              </div>

              <button
                onClick={() => onCreateRoom(selectedMode)}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch New Room as Host
              </button>
            </div>

            {/* Join Room */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Join with Room Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VEL-42"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-100 uppercase tracking-widest focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => onJoinRoom(joinCode)}
                  disabled={!joinCode.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Join Lobby
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* If Inside Room: Show Lobby Roster & Ready Controls */
          <div className="flex flex-col gap-6">
            {/* Room Banner */}
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">ROOM CODE</span>
                <div className="text-2xl font-black text-slate-100 font-mono tracking-widest">{roomData.id}</div>
              </div>
              <button
                onClick={copyRoomLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold border border-sky-500/40 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied URL!' : 'Share Invite Link'}
              </button>
            </div>

            {/* Player Roster */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Racers in Lobby ({roomData.players.length})</span>
                <span className="text-[11px] text-sky-400 font-mono">Mode: {roomData.mode.toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {roomData.players.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-bold text-xs text-slate-200">
                        {p.name} {p.id === currentUserId && <span className="text-sky-400">(You)</span>}
                      </span>
                      {p.isHost && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          HOST
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        p.isReady ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {p.isReady ? '🟢 Ready' : '⚪ Waiting'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countdown Banner if Active */}
            {roomData.status === 'COUNTDOWN' && (
              <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center animate-pulse">
                <div className="text-xs uppercase font-bold text-amber-400">RACE STARTING IN</div>
                <div className="text-3xl font-black text-amber-300 font-mono">
                  {roomData.countdownSeconds}s
                </div>
              </div>
            )}

            {/* Lobby Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onToggleReady}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentPlayer?.isReady
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {currentPlayer?.isReady ? 'Cancel Ready' : 'Ready Up'}
              </button>

              {isHost && (
                <button
                  onClick={onStartRace}
                  disabled={roomData.status === 'COUNTDOWN'}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Race Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
