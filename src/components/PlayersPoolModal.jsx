import React, { useState } from 'react';
import { formatMoney } from '../utils/rules';
import { X, Trophy, Search, CheckCircle, AlertCircle, Clock, Award } from 'lucide-react';

export default function PlayersPoolModal({ 
  upcomingPlayers, 
  soldPlayers, 
  unsoldPlayers, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filterList = (list) => {
    return list.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.country.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || p.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  // Top Buys Leaderboard
  const sortedLeaderboard = [...soldPlayers].sort((a,b) => (b.soldPrice || 0) - (a.soldPrice || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-black text-white">Player Pool & Auction Leaderboard</h2>
              <p className="text-xs text-slate-400">Track all upcoming stars, sold signings, and unsold reserves</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons & Search */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'upcoming' 
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingPlayers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sold')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'sold' 
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Sold ({soldPlayers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('unsold')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'unsold' 
                  ? 'bg-rose-500 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unsold ({unsoldPlayers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'leaderboard' 
                  ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Top Buys Leaderboard</span>
            </button>
          </div>

          {activeTab !== 'leaderboard' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search player or country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-48 sm:w-56"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="All">All Roles</option>
                <option value="Batter">Batters</option>
                <option value="Bowler">Bowlers</option>
                <option value="All-Rounder">All-Rounders</option>
                <option value="Wicket-Keeper">Wicket-Keepers</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'leaderboard' ? (
            <div className="space-y-3">
              <div className="text-sm font-bold text-slate-300 mb-2">
                Top 20 Most Expensive Player Signings of the Auction
              </div>
              {sortedLeaderboard.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
                  <p>No players sold yet. Start bidding to populate the leaderboard!</p>
                </div>
              ) : (
                sortedLeaderboard.slice(0, 20).map((player, idx) => (
                  <div 
                    key={player.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                        idx === 0 ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.5)]' :
                        idx === 1 ? 'bg-slate-300 text-slate-950' :
                        idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </div>

                      <img 
                        src={player.avatarUrl || player.image} 
                        alt={player.name}
                        className="w-11 h-11 rounded-xl object-cover bg-slate-900 border border-slate-800"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-white">{player.name}</span>
                          <span className="text-xs">{player.flag}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {player.role} • Sold to <span className="font-bold text-amber-400">{player.soldToTeam?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-amber-400">{formatMoney(player.soldPrice)}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Winning Price</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              {(() => {
                const rawList = activeTab === 'upcoming' ? upcomingPlayers : activeTab === 'sold' ? soldPlayers : unsoldPlayers;
                const filtered = filterList(rawList);

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 text-slate-500">
                      <p className="font-semibold">No players found in this category.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(p => (
                      <div 
                        key={p.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.avatarUrl || p.image} 
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold text-white">{p.name}</span>
                              <span className="text-xs">{p.flag}</span>
                            </div>
                            <div className="text-xs text-slate-400">
                              {p.role} • {p.set}
                            </div>
                            <div className="text-[11px] text-amber-400/90 font-medium">
                              Base: {formatMoney(p.basePrice)}
                            </div>
                          </div>
                        </div>

                        {activeTab === 'sold' && (
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-400 block">{formatMoney(p.soldPrice)}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{p.soldToTeam?.shortName}</span>
                          </div>
                        )}

                        {activeTab === 'unsold' && (
                          <div className="text-right">
                            <span className="text-xs font-bold text-rose-400">Unsold</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
