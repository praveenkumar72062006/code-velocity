import React, { useState } from 'react';
import { X, LogIn, User, ShieldCheck, Trophy, Terminal, Award, LogOut } from 'lucide-react';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: 'google' | 'guest';
  title: string;
  role?: 'USER' | 'ADMIN';
  level: number;
  xp: number;
  coins: number;
  bestWpm: number;
  totalCodeRuns: number;
  languagesPracticed: string[];
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Google Login Simulation / Real Auth
  const handleGoogleSignIn = async (name?: string, email?: string) => {
    setIsSubmitting(true);
    const finalName = name || googleName || 'Google Engineer';
    const finalEmail = email || googleEmail || `${finalName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName,
          email: finalEmail,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${finalName}`,
        }),
      });
      const data = await res.json();
      if (data.user) {
        onLogin(data.user);
        onClose();
      }
    } catch (err) {
      // Offline fallback
      const fallbackUser: UserAccount = {
        id: `google_${Date.now()}`,
        name: finalName,
        email: finalEmail,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${finalName}`,
        provider: 'google',
        title: 'Senior Developer',
        level: 8,
        xp: 2400,
        coins: 900,
        bestWpm: 96,
        totalCodeRuns: 34,
        languagesPracticed: ['javascript', 'python', 'typescript'],
      };
      onLogin(fallbackUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (data.user) {
        onLogin(data.user);
        onClose();
      }
    } catch (_) {
      const guestId = `guest_${Math.floor(1000 + Math.random() * 9000)}`;
      onLogin({
        id: guestId,
        email: `${guestId}@codevelocity.dev`,
        name: `Dev-${guestId.slice(-4)}`,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${guestId}`,
        provider: 'guest',
        title: 'Guest Coder',
        level: 1,
        xp: 0,
        coins: 300,
        bestWpm: 0,
        totalCodeRuns: 0,
        languagesPracticed: [],
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 p-6 relative shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono tracking-wide">
                {currentUser ? 'DEVELOPER PROFILE' : 'SIGN IN TO CODEVELOCITY'}
              </h2>
              <p className="text-xs text-slate-400">Save code snippets, personal bests & leaderboard rank</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In: Show Profile Telemetry */}
        {currentUser ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-xl border border-sky-500/40 bg-slate-950"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-100 font-mono">{currentUser.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    LVL {currentUser.level}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  {currentUser.title}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Best Speed</div>
                <div className="text-lg font-black text-sky-400">{currentUser.bestWpm} WPM</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Code Runs</div>
                <div className="text-lg font-black text-emerald-400">{currentUser.totalCodeRuns}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Balance</div>
                <div className="text-lg font-black text-amber-400">🪙 {currentUser.coins}</div>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Account
            </button>
          </div>
        ) : (
          /* Sign In Form */
          <div className="flex flex-col gap-4">
            {/* Official Google Sign-In Button */}
            <button
              onClick={() => handleGoogleSignIn()}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">or 1-click quick login</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Custom Gmail Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                if (googleEmail.trim()) {
                  handleGoogleSignIn(googleName.trim() || googleEmail.split('@')[0], googleEmail.trim());
                }
              }}
              className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Sign in with your Personal Gmail
              </div>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={googleEmail}
                onChange={e => setGoogleEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
              />
              <input
                type="text"
                placeholder="Display Name (Optional)"
                value={googleName}
                onChange={e => setGoogleName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !googleEmail.trim()}
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 mt-1"
              >
                Sign In with Gmail
              </button>
            </form>

            <button
              onClick={handleGuestSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-slate-400" />
              Play Instantly as Anonymous Guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
