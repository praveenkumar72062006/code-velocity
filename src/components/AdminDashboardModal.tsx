import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  Activity,
  Code,
  Download,
  Ban,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  Crown,
  Search,
} from 'lucide-react';

interface AdminMetrics {
  totalUsers: number;
  totalRaces: number;
  avgWpm: number;
  peakWpm: number;
  customSnippets: number;
  activeSockets: number;
  activeRooms: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'USER' | 'ADMIN';
  level: number;
  best_wpm: number;
  total_runs: number;
  is_banned: number;
  created_at: string;
}

interface RaceRow {
  id: string;
  userName: string;
  userEmail: string;
  language: string;
  snippetTitle: string;
  wpm: number;
  accuracy: number;
  createdAt: string;
}

interface CustomSnippetRow {
  id: string;
  language: string;
  title: string;
  filename: string;
  difficulty: string;
  code: string;
  created_at: string;
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  adminEmail: string;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminName,
  adminEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'races' | 'snippets'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [usersList, setUsersList] = useState<UserRow[]>([]);
  const [racesList, setRacesList] = useState<RaceRow[]>([]);
  const [customSnippets, setCustomSnippets] = useState<CustomSnippetRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Snippet Form
  const [newLang, setNewLang] = useState('python');
  const [newTitle, setNewTitle] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Intermediate');
  const [newCode, setNewCode] = useState('');
  const [snippetSuccess, setSnippetSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllAdminData();
    }
  }, [isOpen, adminEmail]);

  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-admin-email': adminEmail,
  };

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [mRes, uRes, rRes, sRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: { 'x-admin-email': adminEmail } }),
        fetch('/api/admin/users', { headers: { 'x-admin-email': adminEmail } }),
        fetch('/api/admin/races', { headers: { 'x-admin-email': adminEmail } }),
        fetch('/api/admin/snippets'),
      ]);

      const [mData, uData, rData, sData] = await Promise.all([
        mRes.json(),
        uRes.json(),
        rRes.json(),
        sRes.json(),
      ]);

      setMetrics(mData);
      if (uData.users) setUsersList(uData.users);
      if (rData.races) setRacesList(rData.races);
      if (sData.snippets) setCustomSnippets(sData.snippets);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBanUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev =>
          prev.map(u => (u.id === userId ? { ...u, is_banned: data.isBanned ? 1 : 0 } : u))
        );
      }
    } catch (_) {}
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ userId, role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: nextRole as any } : u))
        );
      }
    } catch (_) {}
  };

  const handleCreateSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    try {
      const res = await fetch('/api/admin/snippets', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          language: newLang,
          title: newTitle.trim(),
          filename: newFilename.trim() || `${newTitle.toLowerCase().replace(/\s+/g, '_')}`,
          difficulty: newDifficulty,
          code: newCode.trim(),
          createdBy: adminName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomSnippets(prev => [data.snippet, ...prev]);
        setNewTitle('');
        setNewFilename('');
        setNewCode('');
        setSnippetSuccess(true);
        setTimeout(() => setSnippetSuccess(false), 2500);
      }
    } catch (_) {}
  };

  const exportCsv = () => {
    window.location.href = `/api/admin/export?adminEmail=${encodeURIComponent(adminEmail)}`;
  };

  if (!isOpen) return null;

  const filteredUsers = usersList.filter(
    u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-5xl rounded-2xl border border-amber-500/40 p-6 relative shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-mono tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400">
                  MASTER ADMIN CONSOLE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SUPERUSER
                </span>
              </div>
              <p className="text-xs text-slate-400">Live system telemetry, user management & database inspection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={loadAllAdminData}
              title="Refresh telemetry"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Analytics Metrics Bar */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 font-mono text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Users</div>
              <div className="text-xl font-black text-sky-400">{metrics.totalUsers}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Races</div>
              <div className="text-xl font-black text-emerald-400">{metrics.totalRaces}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Average WPM</div>
              <div className="text-xl font-black text-amber-400">{metrics.avgWpm} WPM</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Peak Speed</div>
              <div className="text-xl font-black text-purple-400">{metrics.peakWpm} WPM</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Live Sockets</div>
              <div className="text-xl font-black text-rose-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {metrics.activeSockets}
              </div>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'metrics' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Live Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'users' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('races')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'races' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Race Stream ({racesList.length})
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'snippets' ? 'bg-purple-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" /> Snippet Manager
          </button>
        </div>

        {/* TAB 1: LIVE DASHBOARD OVERVIEW */}
        {activeTab === 'metrics' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <h4 className="font-bold text-sm text-sky-400 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Cohort Health & System Status
                </h4>
                <div className="flex flex-col gap-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Database Engine:</span>
                    <span className="font-mono text-emerald-400 font-bold">SQLite Persistent (Disk Storage)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Free Tier Keep-Alive:</span>
                    <span className="font-mono text-sky-400">/health Endpoint Active (UptimeRobot)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Active Multiplayer Heats:</span>
                    <span className="font-mono text-amber-400">{metrics?.activeRooms || 0} Rooms</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Total Code Runs Saved:</span>
                    <span className="font-mono text-slate-100 font-bold">{metrics?.totalRaces || 0} Runs</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <h4 className="font-bold text-sm text-emerald-400 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Latest Activity Highlights
                </h4>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto text-xs">
                  {racesList.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-1 border-b border-slate-800/60 font-mono">
                      <span className="text-slate-300 truncate max-w-[180px]">{r.userName}</span>
                      <span className="text-sky-400 font-bold">{r.wpm} WPM</span>
                      <span className="text-slate-500 text-[10px]">{r.language}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT TABLE */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <span className="text-xs text-slate-500">{filteredUsers.length} users found</span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Best WPM</th>
                    <th className="p-3">Total Runs</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-slate-700 bg-slate-950" />
                        <div>
                          <div className="font-bold text-slate-100">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-sky-400 font-bold">{u.best_wpm} WPM</td>
                      <td className="p-3 text-slate-300">{u.total_runs}</td>
                      <td className="p-3">
                        {u.is_banned ? (
                          <span className="text-rose-400 font-bold">⛔ Suspended</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">Active</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleRole(u.id, u.role)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
                          >
                            {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => toggleBanUser(u.id)}
                            className={`px-2 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                              u.is_banned
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            }`}
                          >
                            {u.is_banned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE GLOBAL RACE STREAM */}
        {activeTab === 'races' && (
          <div className="flex flex-col gap-3">
            <div className="text-xs text-slate-400 font-mono">
              Live feed of every code snippet completed by registered developers:
            </div>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {racesList.map(r => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-100">{r.userName}</span>
                      <span className="text-slate-500 ml-2">({r.userEmail})</span>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Completed <strong>{r.snippetTitle}</strong> [{r.language.toUpperCase()}]
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sky-400 text-sm">{r.wpm} WPM</div>
                    <div className="text-[10px] text-emerald-400">{r.accuracy}% Accuracy</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CODE SNIPPET CREATOR */}
        {activeTab === 'snippets' && (
          <div className="flex flex-col gap-6">
            <form onSubmit={handleCreateSnippet} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Inject New Code Snippet to Global Library
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Language</label>
                  <select
                    value={newLang}
                    onChange={e => setNewLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="sql">SQL</option>
                    <option value="html_css">HTML & CSS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Reverse Linked List"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Filename</label>
                  <input
                    type="text"
                    placeholder="e.g. reverse.py"
                    value={newFilename}
                    onChange={e => setNewFilename(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Code (Line by Line)</label>
                <textarea
                  rows={5}
                  placeholder={`def solve(problem):\n    return True`}
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {snippetSuccess ? <CheckCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                {snippetSuccess ? 'Snippet Saved to Database!' : 'Save & Publish Snippet to Platform'}
              </button>
            </form>

            {/* Custom Snippets List */}
            {customSnippets.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 mb-3">Custom Snippets in Database</h4>
                <div className="flex flex-col gap-2">
                  {customSnippets.map(cs => (
                    <div key={cs.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="font-bold text-slate-200">{cs.title}</span>
                        <span className="text-slate-500 ml-2">({cs.filename})</span>
                      </div>
                      <span className="text-sky-400 font-bold uppercase">{cs.language}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
