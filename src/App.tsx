import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { io, Socket } from 'socket.io-client';
import {
  Code2,
  Terminal,
  Zap,
  RotateCcw,
  Trophy,
  Flame,
  Sparkles,
  ChevronRight,
  Gauge,
  Activity,
  CheckCircle2,
  Radio,
  FileCode,
  Layers,
  Bug,
  Scale,
  CornerDownLeft,
  User,
  Swords,
  Ghost,
  Crown,
  Shuffle,
  LogOut,
} from 'lucide-react';

import { useTypingEngine, TypingStats } from './hooks/useTypingEngine';
import { soundEngine, SwitchSoundProfile } from './services/soundEngine';
import {
  CODE_SNIPPETS,
  CodeSnippet,
  SupportedLanguage,
  LANGUAGE_META,
  getRandomSnippet,
} from './data/codeSnippets';
import { RaceTrack, Racer } from './components/RaceTrack';
import { KeyboardHeatmap } from './components/KeyboardHeatmap';
import { BossRaidArena } from './components/BossRaidArena';
import { GarageModal, VehicleSkin } from './components/GarageModal';
import { AdminToolsModal } from './components/AdminToolsModal';
import { MultiplayerModal, RoomData } from './components/MultiplayerModal';
import { AuthModal, UserAccount } from './components/AuthModal';
import { LeaderboardTournamentModal } from './components/LeaderboardTournamentModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { WS_SERVER_URL, getApiUrl } from './config';
import { storageService } from './services/storageService';
import { p2pEngine, generateRoomCode } from './services/multiplayerEngine';

type GameMode = 'sprint' | 'equalizer' | 'boss_raid';

const INITIAL_SKINS: VehicleSkin[] = [
  { id: 'neon_cyan', name: 'Cyber Terminal', color: '#06b6d4', price: 0, unlocked: true, tag: 'Default IDE' },
  { id: 'f1_red', name: 'Vim Demon', color: '#ef4444', price: 300, unlocked: true, tag: ':wq!' },
  { id: 'stealth_purple', name: 'Matrix Violet', color: '#8b5cf6', price: 600, unlocked: false, tag: 'Dark+ Theme' },
  { id: 'gold_speedster', name: '10x Dev Aura', color: '#f59e0b', price: 1200, unlocked: false, tag: 'Legendary' },
];

export const App: React.FC = () => {
  // Selected Language & Snippets (Randomized on first visit so each user gets unique code)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('vt_last_lang') as SupportedLanguage;
    if (saved && LANGUAGE_META[saved]) return saved;
    const popular: SupportedLanguage[] = ['javascript', 'python', 'typescript', 'java', 'cpp', 'rust', 'go'];
    return popular[Math.floor(Math.random() * popular.length)];
  });

  const [activeSnippetIndex, setActiveSnippetIndex] = useState(() => {
    const savedLang = localStorage.getItem('vt_last_lang') as SupportedLanguage;
    const lang = (savedLang && LANGUAGE_META[savedLang]) ? savedLang : 'javascript';
    const pool = CODE_SNIPPETS.filter(s => s.language === lang);
    return pool.length > 0 ? Math.floor(Math.random() * pool.length) : 0;
  });

  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced (LeetCode)'>('All');
  const [gameMode, setGameMode] = useState<GameMode>('sprint');
  const [isStrict, setIsStrict] = useState(true);

  // User Account & Session (Google Auth / Guest)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return storageService.getUser();
  });

  // Filter snippets by selected language and difficulty
  const languageSnippets = CODE_SNIPPETS.filter(
    s => s.language === selectedLanguage && (difficultyFilter === 'All' || s.difficulty === difficultyFilter)
  );
  const activeSnippet: CodeSnippet = languageSnippets[activeSnippetIndex] || languageSnippets[0] || CODE_SNIPPETS[0];

  // User Profile & Economy (stored in localStorage)
  const [coins, setCoins] = useState(() => {
    return parseInt(localStorage.getItem('vt_coins') || '450', 10);
  });
  const [personalBestWpm, setPersonalBestWpm] = useState(() => {
    return parseInt(localStorage.getItem('vt_pb_wpm') || '65', 10);
  });
  const [totalRaces, setTotalRaces] = useState(() => {
    return parseInt(localStorage.getItem('vt_total_races') || '12', 10);
  });
  const [skins, setSkins] = useState<VehicleSkin[]>(() => {
    const saved = localStorage.getItem('vt_skins');
    return saved ? JSON.parse(saved) : INITIAL_SKINS;
  });
  const [equippedSkinId, setEquippedSkinId] = useState(() => {
    return localStorage.getItem('vt_equipped_skin') || 'neon_cyan';
  });

  // Sound Profile
  const [soundProfile, setSoundProfile] = useState<SwitchSoundProfile>('cherry_blue');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [lastStats, setLastStats] = useState<TypingStats | null>(null);

  // Active Ghost Racer
  const [ghostRacer, setGhostRacer] = useState<{ name: string; wpm: number; progress: number } | null>(null);

  // Socket & Real-Time Multiplayer State
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [multiplayerRacers, setMultiplayerRacers] = useState<Racer[]>([]);

  // AI Bots State
  const [aiRacers, setAiRacers] = useState<{ id: string; name: string; progress: number; wpm: number; color: string }[]>([
    { id: 'ai-1', name: 'AsyncBot (JS)', progress: 0, wpm: 68, color: '#ec4899' },
    { id: 'ai-2', name: 'Pythonista (Py)', progress: 0, wpm: 84, color: '#10b981' },
    { id: 'ai-3', name: 'Rustacean (Rs)', progress: 0, wpm: 60, color: '#f59e0b' },
  ]);

  // Boss Raid State (Bug Hunt)
  const [bossHp, setBossHp] = useState(50000);
  const [userDamageDealt, setUserDamageDealt] = useState(0);

  // Caret Reference
  const activeCharSpanRef = useRef<HTMLSpanElement | null>(null);
  const [caretCoords, setCaretCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Finish Handler
  const handleRaceFinish = useCallback((finalStats: TypingStats) => {
    setLastStats(finalStats);
    setShowSummary(true);

    const defaultUser: UserAccount = {
      id: `guest_${Date.now()}`,
      name: 'Guest Coder',
      email: 'guest@codevelocity.dev',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Guest',
      provider: 'guest',
      title: 'Junior Developer',
      level: 1,
      xp: 0,
      coins: 300,
      bestWpm: 0,
      totalCodeRuns: 0,
      languagesPracticed: [selectedLanguage],
    };

    const targetUser = currentUser || defaultUser;
    const { updatedUser } = storageService.recordRace(
      targetUser,
      selectedLanguage,
      activeSnippet.title,
      finalStats.wpm,
      finalStats.accuracy
    );

    setCurrentUser(updatedUser);
    setCoins(updatedUser.coins);
    setTotalRaces(updatedUser.totalCodeRuns);
    setPersonalBestWpm(updatedUser.bestWpm);

    if (gameMode === 'boss_raid') {
      const dmg = finalStats.wpm * 30;
      setUserDamageDealt(prev => prev + dmg);
      setBossHp(prev => Math.max(0, prev - dmg));
    }

    // Persist race to Backend Database if connected
    if (currentUser) {
      fetch('/api/races/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          language: selectedLanguage,
          snippetTitle: activeSnippet.title,
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
        }),
      }).catch(() => {});
    }

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#3178c6', '#f7df1e', '#10b981'],
      });
    } catch (_) {}
  }, [gameMode, currentUser, selectedLanguage, activeSnippet.title]);

  // Synchronized Target Snippet (P2P multiplayer lobby overrides local code so all players race identically)
  const effectiveSnippetCode = (roomData && roomData.targetText) ? roomData.targetText : activeSnippet.code;
  const effectiveSnippetTitle = (roomData && roomData.snippetTitle) ? roomData.snippetTitle : activeSnippet.title;
  const effectiveFilename = (roomData && roomData.snippetTitle)
    ? `${roomData.snippetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}${LANGUAGE_META[selectedLanguage].ext}`
    : activeSnippet.filename;

  // Typing Engine Hook
  const {
    currentIndex,
    hasError,
    shakeError,
    isStarted,
    isFinished,
    progressPercent,
    stats,
    problemKeys,
    resetEngine,
    deployNitro,
  } = useTypingEngine({
    targetText: effectiveSnippetCode,
    isStrict,
    onFinish: handleRaceFinish,
  });

  const equippedSkin = skins.find(s => s.id === equippedSkinId) || skins[0];

  // Initialize Socket.io Connection
  useEffect(() => {
    const socket = io(WS_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('room:joined', (data: RoomData) => {
      setRoomData(data);
    });

    socket.on('room:updated', (data: RoomData) => {
      setRoomData(data);
    });

    socket.on('race:countdown_tick', ({ seconds }: { seconds: number }) => {
      soundEngine.playCountdown(seconds === 1);
      setRoomData(prev => (prev ? { ...prev, status: 'COUNTDOWN', countdownSeconds: seconds } : null));
    });

    socket.on('race:started', ({ targetText }: { targetText: string }) => {
      soundEngine.playCountdown(true);
      setIsMultiplayerOpen(false);
      resetEngine();
    });

    socket.on('track:sync', ({ players }: { players: any[] }) => {
      const mapped: Racer[] = players.map(p => ({
        id: p.id,
        name: p.name,
        progress: p.progress,
        wpm: p.wpm,
        color: p.color,
        isUser: p.id === socket.id,
      }));
      setMultiplayerRacers(mapped);
    });

    socket.on('error:message', (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [resetEngine]);

  // Throttled Multiplayer Progress Broadcast (Socket.io & P2P WebRTC)
  useEffect(() => {
    if (roomData && isStarted && !isFinished) {
      if (socketConnected && socketRef.current) {
        socketRef.current.emit('race:progress_update', {
          roomId: roomData.id,
          progress: progressPercent,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
        });
      }
      p2pEngine.sendTelemetry(progressPercent, stats.wpm, stats.accuracy);
    }
  }, [roomData, isStarted, isFinished, progressPercent, stats.wpm, stats.accuracy, socketConnected]);

  // Calculate Caret Coordinates
  useEffect(() => {
    if (activeCharSpanRef.current) {
      const span = activeCharSpanRef.current;
      setCaretCoords({
        x: span.offsetLeft,
        y: span.offsetTop,
      });
    }
  }, [currentIndex]);

  // AI Bots Simulation + Ghost Simulation
  useEffect(() => {
    if (!roomData && isStarted && !isFinished) {
      const interval = setInterval(() => {
        setAiRacers(prev =>
          prev.map(bot => {
            if (bot.progress >= 100) return bot;
            const step = (bot.wpm / 60) * 1.5 + (Math.random() * 0.4 - 0.2);
            return {
              ...bot,
              progress: Math.min(100, bot.progress + step),
            };
          })
        );

        if (ghostRacer && ghostRacer.progress < 100) {
          setGhostRacer(g => (g ? { ...g, progress: Math.min(100, g.progress + (g.wpm / 60) * 1.5) } : null));
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [roomData, isStarted, isFinished, ghostRacer]);

  // Auto-join multiplayer room if ?room=XYZ in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setIsMultiplayerOpen(true);
      handleJoinRoom(roomParam);
    }
  }, []);

  // Equalizer vs Standard Progress
  const displayProgress =
    gameMode === 'equalizer'
      ? Math.min(100, (stats.wpm / Math.max(1, personalBestWpm)) * 100)
      : progressPercent;

  // Track Racers
  const allRacers: Racer[] =
    roomData && multiplayerRacers.length > 0
      ? multiplayerRacers
      : [
          {
            id: 'user',
            name: `${currentUser?.name || 'You'} (${LANGUAGE_META[selectedLanguage].name})`,
            progress: displayProgress,
            wpm: stats.wpm,
            color: equippedSkin.color,
            isUser: true,
            isNitro: stats.isNitroReady,
            hasError,
          },
          ...(ghostRacer
            ? [
                {
                  id: 'ghost',
                  name: `👻 ${ghostRacer.name}`,
                  progress: ghostRacer.progress,
                  wpm: ghostRacer.wpm,
                  color: '#a855f7',
                },
              ]
            : []),
          ...aiRacers,
        ];

  // Start Next Snippet (Dynamic & Random across the current language library)
  const startNextRace = (newIndex?: number) => {
    setShowSummary(false);
    let nextIdx: number;
    if (newIndex !== undefined) {
      nextIdx = newIndex;
    } else {
      const currentId = activeSnippet.id;
      const { index } = getRandomSnippet(selectedLanguage, currentId, difficultyFilter);
      nextIdx = index;
      if (nextIdx === activeSnippetIndex && languageSnippets.length > 1) {
        nextIdx = (activeSnippetIndex + 1) % languageSnippets.length;
      }
    }
    setActiveSnippetIndex(nextIdx);
    resetEngine();
    setAiRacers(prev => prev.map(bot => ({ ...bot, progress: 0 })));
    if (ghostRacer) setGhostRacer(g => (g ? { ...g, progress: 0 } : null));
  };

  // Immediate Shuffle / Next Snippet Action
  const handleShuffleSnippet = () => {
    const currentId = activeSnippet.id;
    const { index } = getRandomSnippet(selectedLanguage, currentId, difficultyFilter);
    let nextIdx = index;
    if (nextIdx === activeSnippetIndex && languageSnippets.length > 1) {
      nextIdx = (activeSnippetIndex + 1) % languageSnippets.length;
    }
    setActiveSnippetIndex(nextIdx);
    resetEngine();
  };

  const handleStartProblemDrill = (troublesomeKeys: string[]) => {
    resetEngine();
  };

  const handleStartSymbolDrill = () => {
    const heavySnippet = CODE_SNIPPETS.find(s => s.code.includes('{') && s.code.includes('=>'));
    if (heavySnippet) {
      setSelectedLanguage(heavySnippet.language);
      setActiveSnippetIndex(0);
      resetEngine();
    }
  };

  const handleSelectSkin = (skinId: string) => {
    setEquippedSkinId(skinId);
    localStorage.setItem('vt_equipped_skin', skinId);
  };

  const handleBuySkin = (skin: VehicleSkin) => {
    if (coins >= skin.price) {
      const nextCoins = coins - skin.price;
      setCoins(nextCoins);
      localStorage.setItem('vt_coins', nextCoins.toString());

      const updated = skins.map(s => (s.id === skin.id ? { ...s, unlocked: true } : s));
      setSkins(updated);
      localStorage.setItem('vt_skins', JSON.stringify(updated));
      handleSelectSkin(skin.id);
    }
  };

  const handleSoundChange = (sound: SwitchSoundProfile) => {
    setSoundProfile(sound);
    soundEngine.setProfile(sound);
  };

  const handleCreateRoom = (mode: string) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('room:create', {
        playerName: currentUser?.name || 'Lead Dev',
        color: equippedSkin.color,
        mode,
        language: selectedLanguage,
        codeSnippet: activeSnippet.code,
      });
    } else {
      // P2P WebRTC Zero-Latency Room with clean uppercase code
      const newRoomCode = generateRoomCode();
      p2pEngine.init(
        {
          id: currentUser?.id || `usr_${Date.now()}`,
          name: currentUser?.name || 'Lead Dev',
          color: equippedSkin.color,
          skinId: equippedSkin.id,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          isReady: true,
          isHost: true,
          finished: false,
        },
        (netState) => {
          if (!netState) {
            setRoomData(null);
            setMultiplayerRacers([]);
            return;
          }
          setRoomData({
            id: netState.id,
            hostId: netState.hostId,
            status: netState.status,
            targetText: netState.codeSnippet,
            mode: netState.mode,
            countdownSeconds: netState.countdownSeconds,
            language: netState.language,
            snippetTitle: netState.snippetTitle,
            players: netState.players.map((p) => ({
              id: p.id,
              name: p.name,
              color: p.color,
              isReady: p.isReady,
              isHost: p.isHost,
            })),
          });

          const mapped: Racer[] = netState.players.map((p) => ({
            id: p.id,
            name: p.name,
            progress: p.progress,
            wpm: p.wpm,
            color: p.color,
            isUser: p.id === p2pEngine.getMyId(),
          }));
          setMultiplayerRacers(mapped);

          if (netState.status === 'RACING') {
            setIsMultiplayerOpen(false);
            resetEngine();
          }
        },
        undefined,
        newRoomCode
      ).then((peerId) => {
        p2pEngine.createRoom(peerId, {
          language: selectedLanguage,
          title: activeSnippet.title,
          code: activeSnippet.code,
          mode,
        });
      });
    }
  };

  const handleJoinRoom = (roomId: string) => {
    const cleanRoomId = roomId.trim().toUpperCase();
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('room:join', {
        roomId: cleanRoomId,
        playerName: currentUser?.name || 'Coder',
        color: equippedSkin.color,
      });
    } else {
      // P2P WebRTC Room Join
      p2pEngine.init(
        {
          id: currentUser?.id || `usr_${Date.now()}`,
          name: currentUser?.name || 'Guest Coder',
          color: equippedSkin.color,
          skinId: equippedSkin.id,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          isReady: true,
          isHost: false,
          finished: false,
        },
        (netState) => {
          if (!netState) {
            setRoomData(null);
            setMultiplayerRacers([]);
            return;
          }
          setRoomData({
            id: netState.id,
            hostId: netState.hostId,
            status: netState.status,
            targetText: netState.codeSnippet,
            mode: netState.mode,
            countdownSeconds: netState.countdownSeconds,
            language: netState.language,
            snippetTitle: netState.snippetTitle,
            players: netState.players.map((p) => ({
              id: p.id,
              name: p.name,
              color: p.color,
              isReady: p.isReady,
              isHost: p.isHost,
            })),
          });

          if (netState.language && (Object.keys(LANGUAGE_META) as string[]).includes(netState.language)) {
            setSelectedLanguage(netState.language as SupportedLanguage);
          }

          const mapped: Racer[] = netState.players.map((p) => ({
            id: p.id,
            name: p.name,
            progress: p.progress,
            wpm: p.wpm,
            color: p.color,
            isUser: p.id === p2pEngine.getMyId(),
          }));
          setMultiplayerRacers(mapped);

          if (netState.status === 'RACING') {
            setIsMultiplayerOpen(false);
            resetEngine();
          }
        }
      ).then(() => {
        p2pEngine.joinRoom(cleanRoomId, {
          id: currentUser?.id || `usr_${Date.now()}`,
          name: currentUser?.name || 'Guest Coder',
          color: equippedSkin.color,
          skinId: equippedSkin.id,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          isReady: true,
          isHost: false,
          finished: false,
        });
      });
    }
  };

  const handleLeaveRoom = () => {
    p2pEngine.leaveRoom();
    setRoomData(null);
    setMultiplayerRacers([]);
    setIsMultiplayerOpen(false);
    resetEngine();
  };

  const handleToggleReady = () => {
    if (socketConnected && socketRef.current && roomData) {
      socketRef.current.emit('player:toggle_ready', { roomId: roomData.id });
    } else {
      p2pEngine.toggleReady();
    }
  };

  const handleStartMultiplayerRace = () => {
    if (socketConnected && socketRef.current && roomData) {
      socketRef.current.emit('race:start_request', { roomId: roomData.id });
    } else {
      p2pEngine.startCountdown();
    }
  };

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    storageService.saveUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storageService.logoutUser();
  };

  const handleChallengeGhost = (wpm: number, name: string) => {
    setGhostRacer({ name, wpm, progress: 0 });
    resetEngine();
  };

  const currentMeta = LANGUAGE_META[selectedLanguage];
  const codeLines = effectiveSnippetCode.split('\n');

  // Calculate active line index based on currentIndex
  let runningCharCount = 0;
  let activeLineIndex = 0;
  for (let l = 0; l < codeLines.length; l++) {
    const lineLen = codeLines[l].length + 1;
    if (currentIndex >= runningCharCount && currentIndex < runningCharCount + lineLen) {
      activeLineIndex = l;
      break;
    }
    runningCharCount += lineLen;
  }

  // Pre-calculate line start global indices
  let lineStartIndices: number[] = [];
  let tempCount = 0;
  for (let l = 0; l < codeLines.length; l++) {
    lineStartIndices.push(tempCount);
    tempCount += codeLines[l].length + 1;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-slate-100 font-mono">CODE<span className="text-sky-400">VELOCITY</span></span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  DEV EDITION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Line-by-Line Code Typing & Algorithm Sprint</p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => { setGameMode('sprint'); resetEngine(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                gameMode === 'sprint' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" /> Code Sprint
            </button>
            <button
              onClick={() => { setGameMode('equalizer'); resetEngine(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                gameMode === 'equalizer' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> %PB Equalizer
            </button>
            <button
              onClick={() => { setGameMode('boss_raid'); resetEngine(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                gameMode === 'boss_raid' ? 'bg-rose-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="w-3.5 h-3.5" /> Bug Hunt Raid
            </button>
          </div>

          {/* Quick Actions, Arena, Admin & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Master Admin Console Button (Strictly Visible ONLY for Authorized Admin Gmails) */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Esports Arena Modal */}
            <button
              onClick={() => setIsArenaOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition-all hover:scale-105 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 fill-current" />
              Leaderboard & Cup
            </button>

            {/* Multiplayer Room Pill */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMultiplayerOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all hover:scale-105 cursor-pointer ${
                  roomData
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${roomData ? 'text-emerald-400' : 'text-slate-500'}`} />
                {roomData ? `Room: ${roomData.id}` : 'Multiplayer'}
              </button>

              {roomData && (
                <button
                  onClick={handleLeaveRoom}
                  title="Leave Lobby"
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Google Sign-In or User Profile Badge */}
            {currentUser ? (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500 text-xs font-bold transition-all cursor-pointer"
              >
                <img src={currentUser.avatar} alt="Avatar" className="w-5 h-5 rounded-full" />
                <span className="font-mono text-sky-300">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400">L{currentUser.level}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google
              </button>
            )}

            <button
              onClick={() => setIsGarageOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Garage
            </button>
          </div>
        </div>
      </header>

      {/* LANGUAGE SELECTOR TABS */}
      <section className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2.5 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
            <Terminal className="w-3.5 h-3.5 text-sky-400" /> Language:
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(Object.keys(LANGUAGE_META) as SupportedLanguage[]).map(lang => {
              const meta = LANGUAGE_META[lang];
              const isSelected = selectedLanguage === lang;
              const count = CODE_SNIPPETS.filter(s => s.language === lang).length;

              return (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    localStorage.setItem('vt_last_lang', lang);
                    const langPool = CODE_SNIPPETS.filter(s => s.language === lang);
                    const randIdx = langPool.length > 0 ? Math.floor(Math.random() * langPool.length) : 0;
                    setActiveSnippetIndex(randIdx);
                    resetEngine();
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/60 shadow-lg shadow-sky-500/10 scale-105'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6">
        {/* Boss Raid (Bug Hunt SEV-1) */}
        {gameMode === 'boss_raid' && (
          <BossRaidArena
            bossHp={bossHp}
            maxBossHp={50000}
            comboMultiplier={1.0 + Math.min(3.0, stats.combo * 0.1)}
            totalDamageDealt={userDamageDealt}
            activeRaidersCount={roomData ? roomData.players.length : aiRacers.length + 1}
          />
        )}

        {/* Real-time Multi-Lane Race Track */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {roomData
                ? `Live Code Duel (${roomData.players.length} Devs Connected)`
                : `Active Snippet: ${effectiveFilename} (${currentMeta.name})`}
            </div>
            <span>Personal Best: <strong className="text-sky-400">{personalBestWpm} WPM</strong></span>
          </div>
          <RaceTrack racers={allRacers} />
        </div>

        {/* Snippet Selector Pills & Difficulty */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Snippets:</span>
            <button
              onClick={handleShuffleSnippet}
              title="Shuffle / Randomize snippet"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle</span>
            </button>
            {languageSnippets.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSnippetIndex(idx);
                  resetEngine();
                }}
                className={`px-3 py-1 rounded-lg font-mono text-xs transition-all shrink-0 cursor-pointer ${
                  idx === activeSnippetIndex
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Difficulty:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] font-mono">
              {activeSnippet.difficulty}
            </span>
          </div>
        </div>

        {/* ACTUAL MULTI-LINE IDE CODE EDITOR VIEWPORT */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* IDE Window Title Bar */}
          <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>

              <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-t-lg bg-slate-900 border-t border-x border-slate-700/60 text-xs font-mono text-slate-200">
                <span>{currentMeta.icon}</span>
                <span>{effectiveFilename}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <button
                onClick={handleShuffleSnippet}
                title="Next Random Code Snippet"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-mono text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Code</span>
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isStrict}
                  onChange={e => setIsStrict(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                />
                <span>Strict Mode</span>
              </label>

              <button
                onClick={() => resetEngine()}
                title="Restart snippet"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Typing Area with Real Multi-Line Numbering & Indentation */}
          <div className="p-4 sm:p-6 flex bg-[#0d1117] font-mono select-none overflow-x-auto relative">
            {/* Gutter: Dynamic Line Numbers matching actual code lines */}
            <div className="flex flex-col text-slate-600 select-none text-right text-sm sm:text-base pr-4 border-r border-slate-800/80 leading-7 font-mono shrink-0 select-none">
              {codeLines.map((_, lineIdx) => {
                const isCurrentLine = lineIdx === activeLineIndex;
                return (
                  <div
                    key={lineIdx}
                    className={`transition-colors ${
                      isCurrentLine ? 'text-sky-400 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {String(lineIdx + 1).padStart(2, '0')}
                  </div>
                );
              })}
            </div>

            {/* Code Lines Container */}
            <div
              className={`relative flex-1 pl-4 text-sm sm:text-base leading-7 tracking-wide font-mono ${
                shakeError ? 'shake-error' : ''
              }`}
            >
              {/* Caret */}
              {!isFinished && (
                <div
                  className={`typing-caret ${!isStarted ? 'idle' : ''}`}
                  style={{
                    transform: `translate3d(${caretCoords.x}px, ${caretCoords.y}px, 0)`,
                  }}
                />
              )}

              {/* Render Lines Line-by-Line with Actual Code Formatting */}
              {codeLines.map((lineText, lineIdx) => {
                const lineStart = lineStartIndices[lineIdx];
                const isCurrentLine = lineIdx === activeLineIndex;
                const newlineCharIndex = lineStart + lineText.length;
                const isAtNewline = currentIndex === newlineCharIndex;

                return (
                  <div
                    key={lineIdx}
                    className={`flex items-center min-h-[1.75rem] rounded-md transition-colors ${
                      isCurrentLine ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    {/* Render each character on this specific line */}
                    {lineText.split('').map((char, charOffset) => {
                      const globalIndex = lineStart + charOffset;
                      const isPassed = globalIndex < currentIndex;
                      const isCurrent = globalIndex === currentIndex;
                      const isError = isCurrent && hasError;

                      let charColor = 'text-slate-500';
                      let bgColor = 'transparent';

                      if (isPassed) {
                        charColor = 'text-emerald-400';
                      } else if (isCurrent) {
                        charColor = isError ? 'text-rose-100' : 'text-amber-300';
                        bgColor = isError ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.2)';
                      }

                      return (
                        <span
                          key={globalIndex}
                          ref={isCurrent ? activeCharSpanRef : null}
                          style={{ backgroundColor: bgColor }}
                          className={`relative transition-colors duration-75 whitespace-pre ${charColor}`}
                        >
                          {char}
                        </span>
                      );
                    })}

                    {/* Newline indicator (⏎ Enter) at the end of line */}
                    {lineIdx < codeLines.length - 1 && (
                      <span
                        ref={isAtNewline ? activeCharSpanRef : null}
                        className={`ml-1 px-1 rounded text-[11px] font-mono select-none transition-all ${
                          isAtNewline
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : currentIndex > newlineCharIndex
                            ? 'text-slate-600 opacity-30'
                            : 'text-slate-600 opacity-60'
                        }`}
                        title="Press Enter to move to next line"
                      >
                        ⏎
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* IDE Status Bar */}
          <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>{currentMeta.name}</span>
              <span className="hidden sm:inline text-slate-500">{activeSnippet.description}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3 text-sky-400" />
                Press <strong>Enter (⏎)</strong> at line end
              </span>

              {stats.isNitroReady && (
                <button
                  onClick={deployNitro}
                  className="flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold animate-bounce cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  <Flame className="w-3.5 h-3.5 fill-current" /> CODE NITRO READY!
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Telemetry HUD Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <Gauge className="w-3.5 h-3.5 text-sky-400" /> Speed (WPM)
            </div>
            <div className="text-3xl font-black text-sky-400 font-mono">
              {stats.wpm} <span className="text-xs text-slate-500 font-normal">WPM</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accuracy
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {stats.accuracy}%
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Syntax Streak
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {stats.combo} <span className="text-xs text-slate-500 font-normal">tokens</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> Peak Burst
            </div>
            <div className="text-3xl font-black text-purple-400 font-mono">
              {stats.burstWpm} <span className="text-xs text-slate-500 font-normal">PEAK</span>
            </div>
          </div>
        </div>

        {/* Code Syntax & Keyboard Heatmap */}
        <KeyboardHeatmap
          problemKeys={problemKeys}
          onStartDrill={handleStartProblemDrill}
          onStartSymbolDrill={handleStartSymbolDrill}
        />
      </main>

      {/* Victory / Finish Modal */}
      {showSummary && lastStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
          <div className="glass-panel-glow w-full max-w-lg rounded-2xl border border-sky-500/40 p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Trophy className="w-9 h-9 text-slate-950 fill-current" />
            </div>

            <h2 className="text-2xl font-black text-slate-100 tracking-wide mb-1">
              CODE SNIPPET COMPILED!
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-sans">
              Zero syntax or compilation errors. Telemetry summary:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Speed</div>
                <div className="text-xl font-black text-sky-400">{lastStats.wpm} WPM</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</div>
                <div className="text-xl font-black text-emerald-400">{lastStats.accuracy}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Time</div>
                <div className="text-xl font-black text-amber-400">{lastStats.timeElapsed}s</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Reward</div>
                <div className="text-xl font-black text-purple-400">
                  +{(60 + Math.floor(lastStats.wpm / 2))} VC
                </div>
              </div>
            </div>

            <div className="flex gap-3 font-sans">
              <button
                onClick={() => {
                  setShowSummary(false);
                  resetEngine();
                }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Same Code
              </button>
              <button
                onClick={() => startNextRace()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                Next Random Code <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <LeaderboardTournamentModal
        isOpen={isArenaOpen}
        onClose={() => setIsArenaOpen(false)}
        selectedLanguage={selectedLanguage}
        onChallengeGhost={handleChallengeGhost}
      />

      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        adminName={currentUser?.name || 'Master Admin'}
        adminEmail={currentUser?.email || ''}
      />

      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        playerName={currentUser?.name || 'Dev'}
        playerColor={equippedSkin.color}
        roomData={roomData}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onToggleReady={handleToggleReady}
        onStartRace={handleStartMultiplayerRace}
        onLeaveRoom={handleLeaveRoom}
        currentUserId={p2pEngine.getMyId() || socketRef.current?.id || ''}
      />

      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        coins={coins}
        selectedSkinId={equippedSkinId}
        skins={skins}
        onSelectSkin={handleSelectSkin}
        onBuySkin={handleBuySkin}
        currentSound={soundProfile}
        onSelectSound={handleSoundChange}
      />
    </div>
  );
};
