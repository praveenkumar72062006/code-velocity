import { UserAccount } from '../components/AuthModal';
import { SupportedLanguage } from '../data/codeSnippets';

export interface LeaderboardRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  avatar?: string;
  language: string;
  snippetTitle: string;
  wpm: number;
  accuracy: number;
  timestamp: string;
  isMe?: boolean;
}

const ADMIN_EMAILS = new Set([
  'praveenkumar21092006@gmail.com',
  'praveenkumar72062006@gmail.com',
  'admin@codevelocity.dev',
]);

const SEED_LEADERBOARD: LeaderboardRecord[] = [
  { id: 'lb-1', userId: 'u1', userName: 'Alex Rivera', language: 'rust', snippetTitle: 'Concurrency Worker', wpm: 124, accuracy: 99.2, timestamp: '10m ago' },
  { id: 'lb-2', userId: 'u2', userName: 'Sarah Chen', language: 'python', snippetTitle: 'Two Sum Algorithm', wpm: 108, accuracy: 98.6, timestamp: '35m ago' },
  { id: 'lb-3', userId: 'u3', userName: 'Marcus Vance', language: 'cpp', snippetTitle: 'Safe Queue', wpm: 101, accuracy: 97.4, timestamp: '1h ago' },
  { id: 'lb-4', userId: 'u4', userName: 'Elena Rostova', language: 'typescript', snippetTitle: 'React Custom Hook', wpm: 94, accuracy: 99.0, timestamp: '3h ago' },
  { id: 'lb-5', userId: 'u5', userName: 'David Kim', language: 'java', snippetTitle: 'Thread-Safe Singleton', wpm: 90, accuracy: 98.1, timestamp: '5h ago' },
  { id: 'lb-6', userId: 'u6', userName: 'Priya Sharma', language: 'go', snippetTitle: 'Goroutine Channel Pipeline', wpm: 87, accuracy: 99.4, timestamp: '6h ago' },
  { id: 'lb-7', userId: 'u7', userName: 'Liam O\'Connor', language: 'javascript', snippetTitle: 'Async Promise Retry', wpm: 84, accuracy: 96.8, timestamp: '8h ago' },
  { id: 'lb-8', userId: 'u8', userName: 'Zoe Martinez', language: 'sql', snippetTitle: 'Multi-Table Join with Window Function', wpm: 81, accuracy: 98.9, timestamp: '12h ago' },
];

class StorageService {
  private leaderboardKey = 'vt_global_leaderboard';
  private userKey = 'vt_user_session';
  private racesKey = 'vt_races_history';

  // Check if an email has Master Admin status
  public isAdminEmail(email?: string): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.has(email.trim().toLowerCase());
  }

  // Load current session or null
  public getUser(): UserAccount | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      if (!raw) return null;
      const user = JSON.parse(raw);
      // Ensure admin status is updated if user matches whitelist
      if (this.isAdminEmail(user.email)) {
        user.role = 'ADMIN';
        user.title = 'Lead Platform Architect';
      }
      return user;
    } catch {
      return null;
    }
  }

  // Save or update user account
  public saveUser(user: UserAccount) {
    if (this.isAdminEmail(user.email)) {
      user.role = 'ADMIN';
      user.title = 'Lead Platform Architect';
    }
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  public logoutUser() {
    localStorage.removeItem(this.userKey);
  }

  // Record a finished race
  public recordRace(
    user: UserAccount,
    language: SupportedLanguage,
    snippetTitle: string,
    wpm: number,
    accuracy: number
  ): { updatedUser: UserAccount; isNewBest: boolean } {
    const isNewBest = wpm > (user.bestWpm || 0);
    const earnedCoins = 50 + Math.floor(wpm / 2) + (accuracy >= 98 ? 30 : 0);
    const earnedXp = 100 + Math.floor(wpm * 1.5);

    const nextXp = (user.xp || 0) + earnedXp;
    const nextLevel = Math.max(user.level || 1, Math.floor(nextXp / 500) + 1);
    const nextRuns = (user.totalCodeRuns || 0) + 1;
    const nextCoins = (user.coins || 0) + earnedCoins;
    const nextBest = Math.max(user.bestWpm || 0, Math.round(wpm));

    const languages = Array.from(new Set([...(user.languagesPracticed || []), language]));

    const updatedUser: UserAccount = {
      ...user,
      xp: nextXp,
      level: user.role === 'ADMIN' ? 99 : nextLevel,
      coins: nextCoins,
      bestWpm: nextBest,
      totalCodeRuns: nextRuns,
      languagesPracticed: languages,
    };

    this.saveUser(updatedUser);

    // Save race to history
    const raceRecord = {
      id: `race_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      language,
      snippetTitle,
      wpm: Math.round(wpm),
      accuracy,
      timestamp: new Date().toISOString(),
    };

    try {
      const historyRaw = localStorage.getItem(this.racesKey);
      const history: any[] = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(raceRecord);
      localStorage.setItem(this.racesKey, JSON.stringify(history.slice(0, 100)));
    } catch (_) {}

    // Update Global Leaderboard with this user's best score
    this.updateLeaderboard({
      id: `lb_${user.id}_${language}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      avatar: user.avatar,
      language,
      snippetTitle,
      wpm: Math.round(wpm),
      accuracy,
      timestamp: 'Just now',
      isMe: true,
    });

    return { updatedUser, isNewBest };
  }

  // Get Leaderboard filtered by language
  public getLeaderboard(language?: string): LeaderboardRecord[] {
    let list: LeaderboardRecord[] = [];
    try {
      const raw = localStorage.getItem(this.leaderboardKey);
      if (raw) {
        list = JSON.parse(raw);
      } else {
        list = [...SEED_LEADERBOARD];
        localStorage.setItem(this.leaderboardKey, JSON.stringify(list));
      }
    } catch {
      list = [...SEED_LEADERBOARD];
    }

    if (!language || language === 'all') {
      return list.sort((a, b) => b.wpm - a.wpm);
    }

    return list
      .filter((r) => r.language.toLowerCase() === language.toLowerCase())
      .sort((a, b) => b.wpm - a.wpm);
  }

  // Update or insert a leaderboard record
  public updateLeaderboard(record: LeaderboardRecord) {
    const list = this.getLeaderboard('all');
    const existingIndex = list.findIndex(
      (r) => r.userId === record.userId && r.language.toLowerCase() === record.language.toLowerCase()
    );

    if (existingIndex >= 0) {
      if (record.wpm >= list[existingIndex].wpm) {
        list[existingIndex] = record;
      }
    } else {
      list.push(record);
    }

    list.sort((a, b) => b.wpm - a.wpm);
    localStorage.setItem(this.leaderboardKey, JSON.stringify(list.slice(0, 50)));
  }
}

export const storageService = new StorageService();
