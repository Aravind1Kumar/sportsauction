import React, { useState } from 'react';
import { formatMoney, getNextBidIncrement } from '../utils/rules';
import GavelAnimation from './GavelAnimation';
import { 
  Timer, 
  Flame, 
  Shield, 
  Zap, 
  TrendingUp, 
  Award,
  AlertCircle,
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipForward,
  Radio,
  Sparkles
} from 'lucide-react';

export default function AuctionPodium({
  player,
  currentPrice,
  highestBidder,
  userTeam,
  timer,
  maxTimer,
  roundState = 'bidding', // 'ready' | 'bidding' | 'sold'
  onStartRound,
  isHost = true,
  isPaused,
  isStriking,
  callOutText,
  bidHistory,
  onPlaceBid,
  onTogglePause,
  onPassPlayer,
  muted,
  onToggleMute
}) {
  const [statsTab, setStatsTab] = useState('ipl'); // 'ipl' | 'international' | 'domestic'
  const [imgError, setImgError] = useState(false);

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800 rounded-3xl text-center">
        <Award className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white">Auction Finished or Paused</h2>
        <p className="text-slate-400 mt-2">All players in the current pool have been auctioned!</p>
      </div>
    );
  }

  const nextIncrement = currentPrice === 0 ? player.basePrice : getNextBidIncrement(currentPrice);
  const nextPrice = currentPrice === 0 ? player.basePrice : Math.round((currentPrice + nextIncrement) * 100) / 100;
  
  const isUserHighestBidder = highestBidder?.id === userTeam?.id;
  const canUserAfford = userTeam ? (userTeam.purse >= nextPrice) : false;
  const isOverseasBlocked = player.isOverseas && (userTeam?.overseasCount >= 8);
  const isSquadFull = userTeam ? (userTeam.squad.length >= 25) : false;

  const timerPercentage = (timer / maxTimer) * 100;
  const timerColor = timer <= 2 ? 'text-red-500 bg-red-950/60 border-red-500 animate-pulse' : timer <= 4 ? 'text-amber-400 bg-amber-950/40 border-amber-500' : 'text-emerald-400 bg-emerald-950/40 border-emerald-500';

  const roleColors = {
    'Batter': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    'Bowler': 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    'All-Rounder': 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    'Wicket-Keeper': 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  };

  const currentStats = statsTab === 'ipl' 
    ? (player.iplStats || player.stats)
    : statsTab === 'international' 
    ? (player.internationalStats || player.stats)
    : (player.domesticStats || player.stats);

  const leadingColor = highestBidder?.primaryColor || '#EAB308';

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* Broadcast Stage Main Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT/CENTER: Broadcast Official Player Showcase Card */}
        <div 
          className="lg:col-span-8 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl transition-all duration-500"
          style={{
            borderColor: player.tier === 1 ? '#FACC15' : '#334155',
            boxShadow: player.tier === 1 ? '0 0 45px rgba(234,179,8,0.2)' : 'none'
          }}
        >
          {/* Top Marquee Holographic Shimmer Line */}
          {player.tier === 1 && (
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 animate-pulse" />
          )}

          {/* Top Badges & Controls Header */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {player.set}
              </span>
              <span className={`px-3 py-1 border text-xs font-bold uppercase tracking-wider rounded-lg ${roleColors[player.role] || 'bg-slate-800 text-slate-300'}`}>
                {player.role}
              </span>
              {player.isOverseas ? (
                <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-lg flex items-center gap-1">
                  <span>✈️ Overseas</span>
                  <span>{player.flag}</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-bold rounded-lg flex items-center gap-1">
                  <span>🇮🇳 Indian</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={onTogglePause}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
                title={isPaused ? 'Resume Auction' : 'Pause Auction'}
              >
                {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
              </button>
              <button
                onClick={onPassPlayer}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700/50 flex items-center gap-1"
                title="Pass to Next Player"
              >
                <span>Skip</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Player Presentation Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
            
            {/* Official IPL Player Cutout with Halo */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-52 h-64 sm:w-60 sm:h-72 rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-[0_20px_45px_rgba(0,0,0,0.85)] bg-gradient-to-t from-slate-950 via-slate-900 to-slate-850 group flex items-end justify-center">
                
                {/* Dynamic Halo Glow behind the official cutout */}
                <div 
                  className="absolute inset-0 rounded-full blur-3xl opacity-50 scale-90 transition-all duration-700"
                  style={{ backgroundColor: leadingColor }}
                />

                {/* Actual Official IPL Cutout Image */}
                {!imgError ? (
                  <img 
                    src={player.avatarUrl || player.image} 
                    alt={player.name}
                    className="w-full h-full object-contain object-bottom relative z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative z-10 p-4 text-center bg-slate-900">
                    <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center font-black text-2xl text-amber-400 mb-2">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-black text-white">{player.name}</span>
                    <span className="text-xs text-amber-400">{player.role}</span>
                  </div>
                )}

                {/* Player Name Banner Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent z-20 text-center">
                  <div className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1">
                    <span>{player.country}</span>
                    <span>{player.flag}</span>
                  </div>
                  <div className="text-xl font-black text-white leading-tight tracking-tight drop-shadow">
                    {player.name}
                  </div>
                </div>
              </div>

              {/* Styles tags */}
              <div className="mt-3 text-center space-y-1">
                <div className="text-xs text-slate-300 font-semibold flex items-center justify-center gap-1">
                  <span>🏏</span>
                  <span>{player.battingStyle}</span>
                </div>
                {player.bowlingStyle && (
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <span>🎯</span>
                    <span>{player.bowlingStyle}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Real Career Stats & Format Tabs */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Official Career Record</span>
                </div>

                {/* Format Switcher (IPL / International / Domestic) */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 shadow">
                  <button
                    onClick={() => setStatsTab('ipl')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                      statsTab === 'ipl'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    IPL
                  </button>
                  <button
                    onClick={() => setStatsTab('international')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                      statsTab === 'international'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    International
                  </button>
                  <button
                    onClick={() => setStatsTab('domestic')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                      statsTab === 'domestic'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Domestic
                  </button>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {player.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">
                {player.bio}
              </p>

              {/* Dynamic Stats Grid for Selected Format */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-5">
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Matches</div>
                  <div className="text-base sm:text-lg font-black text-white">{currentStats.matches || '-'}</div>
                </div>

                {currentStats.runs !== undefined && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Runs</div>
                    <div className="text-base sm:text-lg font-black text-amber-400">{currentStats.runs}</div>
                  </div>
                )}

                {currentStats.strikeRate !== undefined && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Strike Rate</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400">{currentStats.strikeRate}</div>
                  </div>
                )}

                {currentStats.avg !== undefined && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Average</div>
                    <div className="text-base sm:text-lg font-black text-white">{currentStats.avg}</div>
                  </div>
                )}

                {currentStats.wickets !== undefined && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Wickets</div>
                    <div className="text-base sm:text-lg font-black text-rose-400">{currentStats.wickets}</div>
                  </div>
                )}

                {currentStats.economy !== undefined && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Economy</div>
                    <div className="text-base sm:text-lg font-black text-blue-400">{currentStats.economy}</div>
                  </div>
                )}

                {currentStats.highScore && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Highest</div>
                    <div className="text-base sm:text-lg font-black text-white">{currentStats.highScore}</div>
                  </div>
                )}

                {currentStats.hundreds !== undefined && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-center shadow">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">100s / 50s</div>
                    <div className="text-base sm:text-lg font-black text-cyan-400">
                      {currentStats.hundreds} / {currentStats.fifties || 0}
                    </div>
                  </div>
                )}
              </div>

              {/* Base Price & Pricing Badge */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Base Price</span>
                  <span className="text-xl font-black text-slate-200">{formatMoney(player.basePrice)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Next Raise Increment</span>
                  <span className="text-base font-extrabold text-amber-400">+{formatMoney(nextIncrement)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Auctioneer Gavel, Rapid 5s Countdown Timer & Bidding Stage */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Real-time Bid Display Card */}
          <div 
            className="bg-slate-900 border-2 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300"
            style={{
              borderColor: leadingColor
            }}
          >
            {/* Top Timer Bar & Gavel */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`px-3.5 py-1.5 rounded-2xl border font-black text-xl flex items-center gap-2 ${timerColor}`}>
                  <Timer className="w-5 h-5 animate-pulse" />
                  <span>{timer}s</span>
                </div>
              </div>

              <GavelAnimation isStriking={isStriking} callOutText={callOutText} />
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-5">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${timer <= 2 ? 'bg-red-500' : timer <= 4 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>

            {/* Current Highest Bid */}
            <div className="text-center py-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Bid</div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight drop-shadow-md">
                {currentPrice === 0 ? 'No Bids Yet' : formatMoney(currentPrice)}
              </div>

              {/* Leading Franchise Pill */}
              {highestBidder ? (
                <div 
                  className="mt-3 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl shadow-lg border border-white/20 animate-bounce-short"
                  style={{
                    backgroundColor: highestBidder.primaryColor,
                    color: highestBidder.textColor
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                    {highestBidder.shortName}
                  </div>
                  <div className="text-sm font-extrabold flex items-center gap-1.5">
                    <span>{highestBidder.name}</span>
                    {isUserHighestBidder && <span className="text-[10px] bg-white text-slate-950 font-black px-1.5 py-0.5 rounded">YOU</span>}
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-400 italic">
                  Opening bid starts at {formatMoney(player.basePrice)}
                </div>
              )}
            </div>

            {/* User's Team Purse & Info */}
            {userTeam && (
              <div className="mt-5 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Your Purse ({userTeam.shortName})</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{formatMoney(userTeam.purse)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-semibold">Squad / Overseas</span>
                  <span className="font-bold text-white">{userTeam.squad.length}/25 • OS: {userTeam.overseasCount}/8</span>
                </div>
              </div>
            )}

            {/* Primary BID / Action Button */}
            <div className="mt-5">
              {roundState === 'ready' ? (
                <div className="space-y-2">
                  <button
                    onClick={onStartRound}
                    className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base uppercase rounded-2xl shadow-[0_10px_25px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>Open Bidding for {player.name} 🔨</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Base Price: <strong className="text-amber-400">{formatMoney(player.basePrice)}</strong> • Review stats & open bidding when ready!
                  </p>
                </div>
              ) : isUserHighestBidder ? (
                <div className="w-full py-4 px-4 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 rounded-2xl text-center font-black text-base flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>You Hold the Highest Bid!</span>
                </div>
              ) : !canUserAfford ? (
                <div className="w-full py-3.5 px-4 bg-red-950/40 border border-red-500/40 text-red-300 rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>Insufficient Purse for {formatMoney(nextPrice)}</span>
                </div>
              ) : isOverseasBlocked ? (
                <div className="w-full py-3.5 px-4 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Overseas Player Cap (8/8) Reached</span>
                </div>
              ) : isSquadFull ? (
                <div className="w-full py-3.5 px-4 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Squad Limit (25/25) Reached</span>
                </div>
              ) : (
                <button
                  onClick={() => onPlaceBid(userTeam?.id)}
                  disabled={isPaused}
                  className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black text-lg rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>
                    {currentPrice === 0 
                      ? `OPEN BID • ${formatMoney(player.basePrice)}` 
                      : `BID ${formatMoney(nextPrice)} (+${formatMoney(nextIncrement)})`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Live Auction Feed / Recent Bids Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex-1 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Live Bidding Feed</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="space-y-1.5">
              {bidHistory.length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-4">
                  Waiting for opening bid...
                </div>
              ) : (
                bidHistory.slice(0, 5).map((bid, i) => (
                  <div key={i} className="text-xs flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px]"
                        style={{ backgroundColor: bid.team.primaryColor, color: bid.team.textColor }}
                      >
                        {bid.team.shortName}
                      </span>
                      <span className="font-semibold text-slate-200">{bid.team.name}</span>
                    </div>
                    <span className="font-black text-amber-400">{formatMoney(bid.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Broadcast TV Lower-Third News Ticker */}
      <div className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl py-2 px-4 flex items-center gap-3 overflow-hidden shadow-lg">
        <div className="flex items-center gap-1.5 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap animate-pulse">
          <Radio className="w-3 h-3" />
          <span>AUCTION LIVE</span>
        </div>
        <div className="text-xs text-slate-300 font-semibold whitespace-nowrap overflow-x-auto flex items-center gap-6">
          <span>🏏 Currently on Block: <b className="text-amber-400">{player.name}</b> ({player.role} • {player.country})</span>
          <span>•</span>
          <span>💰 Base Price: <b>{formatMoney(player.basePrice)}</b></span>
          <span>•</span>
          <span>⚡ Leading Bidder: <b className="text-white">{highestBidder ? highestBidder.name : 'Waiting for opening bid'}</b></span>
          <span>•</span>
          <span>🏆 Set: <b>{player.set}</b></span>
        </div>
      </div>

    </div>
  );
}
