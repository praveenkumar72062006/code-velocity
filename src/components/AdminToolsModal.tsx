import React, { useState } from 'react';
import { X, Users, Download, PlusCircle, CheckCircle, Send } from 'lucide-react';
import { Passage } from '../data/passages';

interface AdminToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomPassage: (passage: Passage) => void;
  allPassages: Passage[];
}

export const AdminToolsModal: React.FC<AdminToolsModalProps> = ({
  isOpen,
  onClose,
  onAddCustomPassage,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);
  const [webhookSent, setWebhookSent] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customText.trim()) return;

    onAddCustomPassage({
      id: `custom-${Date.now()}`,
      category: 'custom',
      title: customTitle.trim(),
      text: customText.trim(),
    });

    setCustomTitle('');
    setCustomText('');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,RacerName,WPM,Accuracy,Placement', `${new Date().toISOString()},Alex,104,98.5%,1st`, `${new Date().toISOString()},Sarah,92,97.2%,2nd`].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `velocitytype-cohort-results-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const simulateDiscordWebhook = () => {
    setWebhookSent(true);
    setTimeout(() => setWebhookSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-wide">COHORT ADMIN TOOLS</h2>
              <p className="text-xs text-slate-400">Manage 50–100 participants, custom text, and exports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Text Creator */}
        <form onSubmit={handleCreate} className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Custom Passage for Cohort
          </h3>
          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Passage Title</label>
            <input
              type="text"
              placeholder="e.g. Weekly Tech Quiz / Company Values"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Passage Content</label>
            <textarea
              rows={3}
              placeholder="Paste custom sentences or code snippet..."
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {copied ? 'Passage Added to Room!' : 'Inject Passage into Game'}
          </button>
        </form>

        {/* Export & Webhook Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportCsv}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition-all flex items-center gap-3 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-200">Export Cohort CSV</div>
              <div className="text-[10px] text-slate-400">Download speed & accuracy reports</div>
            </div>
          </button>

          <button
            onClick={simulateDiscordWebhook}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition-all flex items-center gap-3 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-200">
                {webhookSent ? '✅ Broadcast Sent!' : 'Send Discord Briefing'}
              </div>
              <div className="text-[10px] text-slate-400">Post daily leaderboard to Discord</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
