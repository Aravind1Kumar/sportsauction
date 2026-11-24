import React from 'react';
import { Shield, Award, Zap, Flame, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { formatMoney } from '../utils/rules';

export default function PlayingXIAnalyzer({ userTeam, onClose }) {
  if (!userTeam) return null;

  const squad = userTeam.squad;

  // Compute Playing XI algorithm respecting max 4 overseas rule
  // 1. Must pick 1 Wicket Keeper (best by strike rate / runs)
  // 2. Must pick at least 3 Batters
  // 3. Must pick at least 1-2 All-Rounders
  // 4. Must pick at least 3-4 Bowlers (at least 1 spinner, at least 2 pacers)
  // 5. Total must be 11 players with <= 4 overseas

  const selectOptimalXI = () => {
    let selected = [];
    let overseasCount = 0;

    const canAdd = (player) => {
      if (selected.find(p => p.id === player.id)) return false;
      if (player.isOverseas && overseasCount >= 4) return false;
      return true;
    };

    const addPlayer = (player) => {
      selected.push(player);
      if (player.isOverseas) overseasCount++;
    };

    // 1. Pick primary keeper
    const keepers = [...squad.filter(p => p.role === 'Wicket-Keeper')].sort((a,b) => (b.stats.runs || 0) - (a.stats.runs || 0));
    for (const k of keepers) {
      if (canAdd(k)) {
        addPlayer(k);
        break;
      }
    }

    // 2. Pick top batters
    const batters = [...squad.filter(p => p.role === 'Batter')].sort((a,b) => (b.stats.runs || 0) - (a.stats.runs || 0));
    for (const b of batters) {
      if (selected.length < 5 && canAdd(b)) {
        addPlayer(b);
      }
    }

    // 3. Pick top all-rounders
    const allrounders = [...squad.filter(p => p.role === 'All-Rounder')].sort((a,b) => ((b.stats.wickets || 0) + (b.stats.runs || 0)/50) - ((a.stats.wickets || 0) + (a.stats.runs || 0)/50));
    for (const ar of allrounders) {
      if (selected.length < 7 && canAdd(ar)) {
        addPlayer(ar);
      }
    }

    // 4. Pick top bowlers
    const bowlers = [...squad.filter(p => p.role === 'Bowler')].sort((a,b) => (b.stats.wickets || 0) - (a.stats.wickets || 0));
    for (const bow of bowlers) {
      if (selected.length < 11 && canAdd(bow)) {
        addPlayer(bow);
      }
    }

    // Fill remaining spots if < 11
    const remaining = squad.filter(p => canAdd(p));
    for (const rem of remaining) {
      if (selected.length < 11 && canAdd(rem)) {
        addPlayer(rem);
      }
    }

    return selected;
  };

  const xi = selectOptimalXI();

  // Ratings calculation
  const totalRuns = squad.reduce((acc, p) => acc + (p.stats.runs || 0), 0);
  const totalWickets = squad.reduce((acc, p) => acc + (p.stats.wickets || 0), 0);
  const battingPower = Math.min(99, Math.round(50 + (totalRuns / 250)));
  const bowlingDepth = Math.min(99, Math.round(50 + (totalWickets / 12)));
  const balanceScore = Math.min(99, Math.round((battingPower + bowlingDepth) / 2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-black text-white">Starting Playing XI & Team Rating</h2>
              <p className="text-xs text-slate-400">Tactical lineup simulator and squad balance metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Close
          </button>
        </div>

        {/* Rating Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 p-6 bg-slate-950/40 border-b border-slate-800">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Batting Firepower</span>
            <div className="text-2xl font-black text-emerald-400">{battingPower} <span className="text-xs text-slate-500">/ 100</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${battingPower}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Bowling Arsenal</span>
            <div className="text-2xl font-black text-rose-400">{bowlingDepth} <span className="text-xs text-slate-500">/ 100</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-rose-400 h-full" style={{ width: `${bowlingDepth}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Squad Synergy</span>
            <div className="text-2xl font-black text-amber-400">{balanceScore} <span className="text-xs text-slate-500">/ 100</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${balanceScore}%` }} />
            </div>
          </div>
        </div>

        {/* Cricket Field Layout with Starting XI */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Recommended Matchday XI ({xi.length}/11)</span>
            </h3>
            <span className="text-xs bg-slate-800 text-blue-300 px-3 py-1 rounded-full font-bold">
              Overseas in XI: {xi.filter(p => p.isOverseas).length}/4 max
            </span>
          </div>

          {xi.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm font-semibold">Buy players in the auction to build your Matchday XI!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {xi.map((player, idx) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <img 
                      src={player.avatarUrl || player.image} 
                      alt={player.name}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{player.name}</span>
                        {player.isOverseas && <span className="text-[10px] text-blue-400">{player.flag} OS</span>}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {player.role} • {player.battingStyle?.split(' ')[0]} {player.bowlingStyle ? `• ${player.bowlingStyle}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block">{formatMoney(player.soldPrice)}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">IPL Auction Buy</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
