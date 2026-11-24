import React from 'react';
import { Trophy, Users, Award, Database, Volume2, VolumeX, LogOut, Shield } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  roomCode,
  userTeam,
  muted,
  onToggleMute,
  onLeaveRoom
}) {
  return (
    <nav className="w-full bg-slate-950/90 border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 backdrop-blur-xl sticky top-0 z-40">
      
      {/* Brand & Room Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white uppercase">
              Sports <span className="text-amber-400">Auction</span>
            </span>
            <span className="text-[10px] font-black bg-slate-800 border border-slate-700 text-amber-400 px-2 py-0.5 rounded-full">
              ROOM: {roomCode}
            </span>
          </div>
          {userTeam && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Managing:</span>
              <span className="font-extrabold text-white flex items-center gap-1">
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: userTeam.primaryColor }}
                />
                {userTeam.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('arena')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'arena'
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Auction Arena</span>
        </button>

        <button
          onClick={() => setActiveTab('squads')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'squads'
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Squads Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('xi')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'xi'
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Matchday XI</span>
        </button>

        <button
          onClick={() => setActiveTab('pool')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'pool'
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Players Pool</span>
        </button>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onLeaveRoom}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          title="Exit to Lobby"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </nav>
  );
}
