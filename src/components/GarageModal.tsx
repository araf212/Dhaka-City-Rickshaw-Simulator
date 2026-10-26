import React, { useState } from 'react';
import { gameState } from '../game/state/GameState';
import { RickshawCustomization } from '../game/types';
import { X, Wrench, Sparkles, Check, Coins, Palette, Volume2 } from 'lucide-react';
import { soundManager } from '../game/audio/SoundManager';

interface GarageModalProps {
  onClose: () => void;
  onCustomizationChanged: (custom: RickshawCustomization) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({ onClose, onCustomizationChanged }) => {
  const [balance, setBalance] = useState(gameState.stats.moneyTaka);
  const [customization, setCustomization] = useState<RickshawCustomization>({ ...gameState.customization });
  const [upgrades, setUpgrades] = useState([...gameState.upgrades]);
  const [activeTab, setActiveTab] = useState<'hood' | 'frame' | 'mechanics'>('hood');

  const frameColors = [
    { name: 'Dhaka Emerald', hex: '#059669' },
    { name: 'Crimson Red', hex: '#dc2626' },
    { name: 'Royal Navy', hex: '#1e3a8a' },
    { name: 'Saffron Gold', hex: '#d97706' },
    { name: 'Jet Chrome', hex: '#334155' }
  ];

  const handleBuyOrEquip = (upgradeId: string) => {
    const item = upgrades.find((u) => u.id === upgradeId);
    if (!item) return;

    if (item.purchased) {
      // Equip it
      if (item.category === 'hood') {
        gameState.setHoodArt(item.value);
      } else if (item.category === 'bell') {
        gameState.setBellType(item.value);
        soundManager.ringRickshawBell(item.value);
      }
      const updated = { ...gameState.customization };
      setCustomization(updated);
      onCustomizationChanged(updated);
    } else {
      // Buy it
      if (balance >= item.priceTaka) {
        const success = gameState.buyUpgrade(upgradeId);
        if (success) {
          soundManager.playCashEarned();
          setBalance(gameState.stats.moneyTaka);
          setUpgrades([...gameState.upgrades]);
          const updated = { ...gameState.customization };
          setCustomization(updated);
          onCustomizationChanged(updated);
        }
      }
    }
  };

  const handleSelectColor = (colorHex: string) => {
    gameState.setFrameColor(colorHex);
    const updated = { ...gameState.customization, frameColor: colorHex };
    setCustomization(updated);
    onCustomizationChanged(updated);
    soundManager.ringRickshawBell('classic_brass');
  };

  const handleEquipDefaultHood = () => {
    gameState.setHoodArt('peacock');
    const updated: RickshawCustomization = { ...gameState.customization, hoodArt: 'peacock' as const };
    setCustomization(updated);
    onCustomizationChanged(updated);
  };

  const handleEquipDefaultBell = () => {
    gameState.setBellType('classic_brass');
    const updated: RickshawCustomization = { ...gameState.customization, bellType: 'classic_brass' as const };
    setCustomization(updated);
    onCustomizationChanged(updated);
    soundManager.ringRickshawBell('classic_brass');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-slate-900 border border-white/20 rounded-3xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>রিকশা গ্যারেজ ও আর্ট শপ</span>
                <span className="text-slate-400 text-sm font-normal">| Rickshaw Workshop</span>
              </h2>
              <p className="text-xs text-slate-400">Upgrade folk art hoods, brass bells, and speed gears</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>৳ {balance}</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 pt-4 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('hood')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hood' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Folk Art Hoods (হুড আর্ট)</span>
          </button>
          <button
            onClick={() => setActiveTab('frame')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'frame' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Frame Paint Colors (রং)</span>
          </button>
          <button
            onClick={() => setActiveTab('mechanics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mechanics' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Bells & Gears (ঘণ্টা ও গিয়ার)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {activeTab === 'hood' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Default Mayur Pankhi */}
              <div className={`p-4 rounded-2xl border transition ${
                customization.hoodArt === 'peacock' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-800/60 border-white/10'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm">ময়ূর পঙ্খী (Mayur Pankhi)</h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Default</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Authentic green plumage with floral borders and peacock emblem.</p>
                <button
                  onClick={handleEquipDefaultHood}
                  disabled={customization.hoodArt === 'peacock'}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    customization.hoodArt === 'peacock'
                      ? 'bg-emerald-500 text-slate-950 cursor-default'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {customization.hoodArt === 'peacock' ? 'Equipped (যুক্ত আছে)' : 'Equip (যুক্ত করুন)'}
                </button>
              </div>

              {/* Upgradable Hoods */}
              {upgrades.filter((u) => u.category === 'hood').map((item) => {
                const isEquipped = customization.hoodArt === item.value;
                const canAfford = balance >= item.priceTaka;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition ${
                      isEquipped ? 'bg-amber-950/30 border-amber-500' : 'bg-slate-800/60 border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.banglaName}</h4>
                        <span className="text-[11px] text-slate-400">{item.name}</span>
                      </div>
                      {!item.purchased && (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          ৳ {item.priceTaka}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                    <button
                      onClick={() => handleBuyOrEquip(item.id)}
                      disabled={isEquipped || (!item.purchased && !canAfford)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isEquipped
                          ? 'bg-amber-500 text-slate-950 cursor-default'
                          : item.purchased
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped ? 'Equipped (যুক্ত আছে)' : item.purchased ? 'Equip (ব্যবহার করুন)' : `Buy for ৳${item.priceTaka}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'frame' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Select frame finish for your rickshaw steel chassis and rims:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {frameColors.map((c) => {
                  const isSelected = customization.frameColor === c.hex;
                  return (
                    <button
                      key={c.hex}
                      onClick={() => handleSelectColor(c.hex)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        isSelected ? 'bg-slate-800 border-amber-500 shadow-lg' : 'bg-slate-800/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center shrink-0 border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-xs font-bold text-white">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'mechanics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Default Classic Brass Bell */}
              <div className={`p-4 rounded-2xl border transition ${
                customization.bellType === 'classic_brass' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-800/60 border-white/10'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm">Classic Brass Bell (ট্রিং ট্রিং)</h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Default</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Authentic hand-flicked resonant brass chime bell.</p>
                <button
                  onClick={handleEquipDefaultBell}
                  disabled={customization.bellType === 'classic_brass'}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    customization.bellType === 'classic_brass'
                      ? 'bg-emerald-500 text-slate-950 cursor-default'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {customization.bellType === 'classic_brass' ? 'Equipped' : 'Equip'}
                </button>
              </div>

              {/* Other Upgrades */}
              {upgrades.filter((u) => u.category !== 'hood').map((item) => {
                const isEquipped =
                  (item.category === 'bell' && customization.bellType === item.value) ||
                  (item.category === 'gear' && customization.gearEfficiency === item.value) ||
                  (item.category === 'cushion' && customization.comfortLevel === item.value);
                const canAfford = balance >= item.priceTaka;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition ${
                      isEquipped ? 'bg-amber-950/30 border-amber-500' : 'bg-slate-800/60 border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.banglaName}</h4>
                        <span className="text-[11px] text-slate-400">{item.name}</span>
                      </div>
                      {!item.purchased && (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          ৳ {item.priceTaka}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                    <button
                      onClick={() => handleBuyOrEquip(item.id)}
                      disabled={isEquipped || (!item.purchased && !canAfford)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isEquipped
                          ? 'bg-amber-500 text-slate-950 cursor-default'
                          : item.purchased
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped ? 'Installed (সক্রিয়)' : item.purchased ? 'Install' : `Buy for ৳${item.priceTaka}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
