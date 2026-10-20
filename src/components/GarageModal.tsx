import React from 'react';
import { X, Sparkles, Volume2, Shield, Check, Lock } from 'lucide-react';
import { SwitchSoundProfile } from '../services/soundEngine';

export interface VehicleSkin {
  id: string;
  name: string;
  color: string;
  price: number;
  unlocked: boolean;
  tag: string;
}

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  selectedSkinId: string;
  skins: VehicleSkin[];
  onSelectSkin: (skinId: string) => void;
  onBuySkin: (skin: VehicleSkin) => void;
  currentSound: SwitchSoundProfile;
  onSelectSound: (sound: SwitchSoundProfile) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  coins,
  selectedSkinId,
  skins,
  onSelectSkin,
  onBuySkin,
  currentSound,
  onSelectSound,
}) => {
  if (!isOpen) return null;

  const SOUND_OPTIONS: { id: SwitchSoundProfile; label: string; desc: string }[] = [
    { id: 'cherry_blue', label: 'Cherry MX Blue', desc: 'Tactile mechanical click' },
    { id: 'alpaca_linear', label: 'Alpaca Linear', desc: 'Deep, smooth acoustic thud' },
    { id: 'typewriter', label: 'Vintage Typewriter', desc: 'Classic metal typewriter latch' },
    { id: 'lofi_synth', label: 'Lo-Fi Synthesizer', desc: 'Plays musical pentatonic chords' },
    { id: 'off', label: 'Muted', desc: 'Silent mode' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-wide">THE GARAGE</h2>
              <p className="text-xs text-slate-400">Customize your racing machine and tactile acoustics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
              🪙 {coins.toLocaleString()} VC
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section 1: Vehicle Skins */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            Select Your Vehicle Body
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skins.map(skin => {
              const isSelected = skin.id === selectedSkinId;
              return (
                <div
                  key={skin.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-6 rounded-md shadow-md border border-white/20"
                      style={{ backgroundColor: skin.color }}
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-200">{skin.name}</div>
                      <div className="text-[10px] text-slate-400">{skin.tag}</div>
                    </div>
                  </div>

                  <div>
                    {skin.unlocked ? (
                      <button
                        onClick={() => onSelectSkin(skin.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 flex items-center gap-1'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Equipped
                          </>
                        ) : (
                          'Equip'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuySkin(skin)}
                        disabled={coins < skin.price}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          coins >= skin.price
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3 h-3" /> {skin.price} VC
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Switch Sound Profiles */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Tactile Switch Sound Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOUND_OPTIONS.map(sound => {
              const isActive = currentSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => onSelectSound(sound.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{sound.label}</span>
                    {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-400">{sound.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
