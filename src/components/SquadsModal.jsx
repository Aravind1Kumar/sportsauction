import React, { useState } from 'react';
import { formatMoney } from '../utils/rules';
import { X, Shield, Award, Users, DollarSign, Download } from 'lucide-react';

export default function SquadsModal({ teams, userTeamId, initialTeamId, onClose }) {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || userTeamId || teams[0].id);
  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const totalSpent = activeTeam.startingPurse 
    ? (activeTeam.startingPurse - activeTeam.purse)
    : (120.0 - activeTeam.purse);

  const keepers = activeTeam.squad.filter(p => p.role === 'Wicket-Keeper');
  const batters = activeTeam.squad.filter(p => p.role === 'Batter');
  const allrounders = activeTeam.squad.filter(p => p.role === 'All-Rounder');
  const bowlers = activeTeam.squad.filter(p => p.role === 'Bowler');

  const roleSections = [
    { title: 'Wicket-Keepers', players: keepers, color: 'text-sky-400', badge: '🧤' },
    { title: 'Batters', players: batters, color: 'text-emerald-400', badge: '🏏' },
    { title: 'All-Rounders', players: allrounders, color: 'text-purple-400', badge: '🌟' },
    { title: 'Bowlers', players: bowlers, color: 'text-rose-400', badge: '⚡' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-black text-white">Franchise Squads Directory</h2>
              <p className="text-xs text-slate-400">View roster balance, total spend, and purchased players</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Selector Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 overflow-x-auto bg-slate-950/40">
          {teams.map(t => {
            const isSelected = t.id === activeTeam.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-2 border transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-slate-800 text-white shadow-[0_0_15px_rgba(250,204,21,0.25)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span 
                  className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black"
                  style={{ backgroundColor: t.primaryColor, color: t.textColor }}
                >
                  {t.shortName[0]}
                </span>
                <span>{t.shortName}</span>
                <span className="text-[10px] text-slate-500">({t.squad.length})</span>
              </button>
            );
          })}
        </div>

        {/* Active Team Overview Hero Bar */}
        <div 
          className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${activeTeam.primaryColor}22 0%, #0B0F19 100%)`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl p-2 border border-white/20"
              style={{ backgroundColor: activeTeam.primaryColor, color: activeTeam.textColor }}
            >
              {activeTeam.logo ? (
                <img 
                  src={activeTeam.logo} 
                  alt={activeTeam.shortName} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerText = activeTeam.shortName;
                  }}
                />
              ) : (
                <span>{activeTeam.shortName}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white">{activeTeam.name}</h3>
                {activeTeam.id === userTeamId && (
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    YOUR FRANCHISE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-xl mt-0.5">{activeTeam.personality}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Remaining Purse</span>
              <span className="text-2xl font-black text-amber-400">{formatMoney(activeTeam.purse)}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Total Spent</span>
              <span className="text-xl font-black text-slate-200">{formatMoney(totalSpent)}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Squad Fill</span>
              <span className="text-xl font-black text-white">{activeTeam.squad.length}/25</span>
              <span className="text-xs text-blue-400 block font-semibold">✈️ {activeTeam.overseasCount}/8 OS</span>
            </div>
          </div>
        </div>

        {/* Players List Grouped by Roles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTeam.squad.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-400" />
              <p className="text-base font-semibold">No players bought yet by {activeTeam.shortName}</p>
              <p className="text-xs mt-1">Players bought during the live auction will show up here automatically.</p>
            </div>
          ) : (
            roleSections.map(sec => (
              <div key={sec.title} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sec.badge}</span>
                    <h4 className={`text-base font-black ${sec.color}`}>{sec.title}</h4>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                      {sec.players.length}
                    </span>
                  </div>
                </div>

                {sec.players.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No players in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sec.players.map(p => (
                      <div 
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.avatarUrl || p.image} 
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white">{p.name}</span>
                              {p.isOverseas && <span className="text-[10px] text-blue-400 font-semibold">{p.flag}</span>}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.battingStyle?.split(' ')[0]} • {p.stats.runs ? `${p.stats.runs} runs` : `${p.stats.wickets} wkts`}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-amber-400">{formatMoney(p.soldPrice)}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">Bought</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
