import React, { useState } from 'react';
import { TEAMS } from '../data/teams';
import { formatMoney } from '../utils/rules';
import { 
  Trophy, 
  Shield, 
  Zap, 
  Users, 
  Play, 
  Settings, 
  CheckCircle2, 
  PlusCircle, 
  LogIn, 
  Globe, 
  Lock,
  RotateCcw
} from 'lucide-react';

export default function RoomLobby({ onCreateRoom, onJoinRoom, initialRoomCode = '', existingRoomData = null }) {
  const [tab, setTab] = useState(initialRoomCode ? 'join' : 'create'); // 'create' | 'join' | 'browse'
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    if (existingRoomData?.claimedTeams) {
      const unclaimed = TEAMS.find(t => !existingRoomData.claimedTeams[t.id]);
      if (unclaimed) return unclaimed.id;
    }
    return 'MI';
  });
  const [ownerName, setOwnerName] = useState('Challenger');
  const [roomCode, setRoomCode] = useState('8AB3SC');
  const [joinCode, setJoinCode] = useState(initialRoomCode || '');
  const [visibility, setVisibility] = useState('public');
  const [startingPurse, setStartingPurse] = useState(120.0);
  const [bidTimer, setBidTimer] = useState(10);
  const [gameMode, setGameMode] = useState('mega'); // 'mega' | 'legends' | 'mini'

  // Update join code if initialRoomCode changes
  React.useEffect(() => {
    if (initialRoomCode) {
      setJoinCode(initialRoomCode);
      setTab('join');
    }
  }, [initialRoomCode]);

  // Generate random 6-char room code
  const randomizeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(res);
  };

  const activeTeam = TEAMS.find(t => t.id === selectedTeamId) || TEAMS[0];

  const handleCreate = () => {
    onCreateRoom({
      code: roomCode.toUpperCase().trim() || '8AB3SC',
      teamId: selectedTeamId,
      ownerName: ownerName.trim() || 'Host',
      visibility,
      startingPurse,
      bidTimer,
      gameMode,
      modeName: gameMode === 'mega' ? 'IPL 2026 Mega Auction' : gameMode === 'legends' ? 'All-Time Legends' : 'IPL Mini Auction'
    });
  };

  const handleJoin = (targetCode) => {
    const code = (targetCode || joinCode).toUpperCase().trim();
    if (!code) return;

    onJoinRoom({
      code,
      teamId: selectedTeamId,
      ownerName: ownerName.trim() || 'Player'
    });
  };

  // Sample Public Rooms
  const publicRooms = [
    { code: '8AB3SC', title: 'IPL 2026 Mega Auction', host: 'Stun', teamsCount: 4, purse: 120, timer: 10 },
    { code: 'LEGEND', title: 'All-Time IPL Legends', host: 'Thala_07', teamsCount: 6, purse: 120, timer: 12 },
    { code: 'MINI26', title: 'IPL Mini 2026 Auction', host: 'PunjabBoss', teamsCount: 3, purse: 90, timer: 8 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Neon Spotlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 text-center border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="inline-flex items-center gap-3 mb-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Official IPL Simulation Arena
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-lg">
          Sports <span className="text-amber-400">Auction</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
          Create or join multiplayer auction rooms, bid in real-time, and draft your ultimate IPL squad!
        </p>

        {/* Tab Switcher: Create Room / Join Room / Browse Rooms */}
        <div className="mt-6 inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <button
            onClick={() => setTab('create')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              tab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Room</span>
          </button>

          <button
            onClick={() => setTab('join')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              tab === 'join'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Join with Code</span>
          </button>

          <button
            onClick={() => setTab('browse')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              tab === 'browse'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Browse Public Rooms</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-8 flex-1 flex flex-col justify-center">
        
        {/* TAB 1: CREATE ROOM */}
        {tab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Franchise Selection (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span>Select Your Franchise</span>
                  </h2>
                  <p className="text-xs text-slate-400">Choose which IPL franchise you want to manage as Host</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  10 Teams
                </span>
              </div>

              {/* Franchise Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {TEAMS.map((team) => {
                  const isSelected = team.id === selectedTeamId;
                  return (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`relative p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 hover:scale-105 ${
                        isSelected
                          ? 'border-amber-400 bg-slate-800/90 shadow-[0_0_20px_rgba(250,204,21,0.35)] scale-105'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5 shadow-md"
                        style={{ backgroundColor: team.primaryColor, color: team.textColor }}
                      >
                        {team.logo ? (
                          <img 
                            src={team.logo} 
                            alt={team.shortName} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerText = team.shortName;
                            }}
                          />
                        ) : (
                          <span className="font-black text-sm">{team.shortName}</span>
                        )}
                      </div>
                      <span className="text-xs font-black text-white">{team.shortName}</span>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Franchise Detail */}
              <div 
                className="mt-6 p-4 rounded-2xl border border-slate-700 flex items-center gap-4"
                style={{
                  background: `linear-gradient(135deg, ${activeTeam.primaryColor}22 0%, #090D16 100%)`
                }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border border-white/20 p-2"
                  style={{ backgroundColor: activeTeam.primaryColor, color: activeTeam.textColor }}
                >
                  {activeTeam.logo ? (
                    <img src={activeTeam.logo} alt={activeTeam.shortName} className="w-full h-full object-contain" />
                  ) : (
                    <span>{activeTeam.shortName}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeTeam.name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{activeTeam.personality}</p>
                </div>
              </div>
            </div>

            {/* Room Parameters & Creation (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>Create Room Parameters</span>
                </h2>

                {/* Room Code */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Room Code
                    </label>
                    <button 
                      onClick={randomizeCode}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Randomize</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-black text-base uppercase tracking-widest focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Host Name */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Your Name (Host)
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Master Tactician"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Auction Format */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Auction Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGameMode('mega')}
                      className={`py-2 px-3 rounded-xl font-black text-xs border transition-all ${
                        gameMode === 'mega'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      IPL 2026 Mega
                    </button>
                    <button
                      onClick={() => setGameMode('legends')}
                      className={`py-2 px-3 rounded-xl font-black text-xs border transition-all ${
                        gameMode === 'legends'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      All-Time Legends
                    </button>
                  </div>
                </div>

                {/* Starting Purse */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Starting Purse
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStartingPurse(120.0)}
                      className={`py-2 px-3 rounded-xl font-black text-xs border transition-all ${
                        startingPurse === 120.0
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      ₹120.00 Cr
                    </button>
                    <button
                      onClick={() => setStartingPurse(100.0)}
                      className={`py-2 px-3 rounded-xl font-black text-xs border transition-all ${
                        startingPurse === 100.0
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      ₹100.00 Cr
                    </button>
                  </div>
                </div>

                {/* Bid Timer */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Bid Round Timer
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 8, 10, 15].map(sec => (
                      <button
                        key={sec}
                        onClick={() => setBidTimer(sec)}
                        className={`py-2 px-2 rounded-xl font-black text-xs border transition-all ${
                          bidTimer === sec
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Create CTA */}
              <button
                onClick={handleCreate}
                className="mt-4 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg tracking-wide uppercase shadow-[0_10px_30px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                <span>Create Room & Open Lobby</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: JOIN ROOM */}
        {tab === 'join' && (
          <div className="max-w-xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            
            {/* Invite Notice Banner */}
            {initialRoomCode && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">You've Been Invited!</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your friend invited you to join room <strong className="text-amber-400 uppercase tracking-wider">{initialRoomCode}</strong>.
                    Enter your nickname and pick your franchise below to step into the auction arena.
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-black text-white text-center mb-1 flex items-center justify-center gap-2">
              <LogIn className="w-6 h-6 text-amber-400" />
              <span>Join Sports Auction Room</span>
            </h2>
            <p className="text-xs text-slate-400 text-center mb-6">Enter the 6-character room code shared by your friend</p>

            {/* Room Code Input */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. 8AB3SC"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 border-2 border-slate-800 text-amber-400 font-black text-2xl uppercase tracking-widest text-center focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Player Name */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Your Nickname
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Master Strategist"
                className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Preferred Franchise */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Franchise
                </label>
                {existingRoomData?.claimedTeams && (
                  <span className="text-[11px] text-amber-400 font-medium">
                    {Object.keys(existingRoomData.claimedTeams).length} teams already claimed
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TEAMS.map(t => {
                  const isClaimed = existingRoomData?.claimedTeams && existingRoomData.claimedTeams[t.id];
                  const isSelected = selectedTeamId === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isClaimed}
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all relative ${
                        isClaimed
                          ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                          : isSelected
                          ? 'border-amber-400 bg-slate-800 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                        style={{ backgroundColor: t.primaryColor, color: t.textColor }}
                      >
                        {t.shortName}
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-full">
                        {isClaimed ? 'Claimed' : t.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleJoin()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base uppercase shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <LogIn className="w-5 h-5 stroke-[2.5]" />
              <span>Join Room & Enter Waiting Lobby</span>
            </button>
          </div>
        )}

        {/* TAB 3: BROWSE PUBLIC ROOMS */}
        {tab === 'browse' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <span>Active Public Mock Auction Rooms</span>
                </h2>
                <p className="text-xs text-slate-400">Join an ongoing or waiting auction room instantly</p>
              </div>
            </div>

            <div className="space-y-3">
              {publicRooms.map((r) => (
                <div 
                  key={r.code}
                  className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-base">
                      {r.code}
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white flex items-center gap-2">
                        <span>{r.title}</span>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                          Room: {r.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>Host: <b className="text-slate-200">{r.host}</b></span>
                        <span>•</span>
                        <span>{r.teamsCount}/10 Franchises Joined</span>
                        <span>•</span>
                        <span>Purse: {formatMoney(r.purse)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoin(r.code)}
                    className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow"
                  >
                    Join Room
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950">
        Sports Auction Simulation • Real-time IPL Mock Auctions
      </footer>
    </div>
  );
}
