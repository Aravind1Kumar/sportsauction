import React, { useState, useEffect } from 'react';
import { TEAMS } from './data/teams';
import { PLAYERS } from './data/players';
import { sounds } from './utils/audio';
import { decideBotBid, getNextBidIncrement, formatMoney } from './utils/rules';

import RoomLobby from './components/RoomLobby';
import WaitingRoom from './components/WaitingRoom';
import Navbar from './components/Navbar';
import AuctionPodium from './components/AuctionPodium';
import TeamsTicker from './components/TeamsTicker';
import SquadsModal from './components/SquadsModal';
import PlayingXIAnalyzer from './components/PlayingXIAnalyzer';
import PlayersPoolModal from './components/PlayersPoolModal';
import SoldCelebrationModal from './components/SoldCelebrationModal';

export default function App() {
  // Navigation Screens: 'lobby' | 'waiting' | 'auction'
  const [screen, setScreen] = useState('lobby');

  // Room Info
  const [room, setRoom] = useState({
    code: '8AB3SC',
    startingPurse: 120.0,
    bidTimer: 10,
    gameMode: 'mega',
    modeName: 'IPL 2026 Mega Auction',
    claimedTeams: {}
  });

  const [userTeamId, setUserTeamId] = useState('CSK');
  const [isHost, setIsHost] = useState(true);
  const [teams, setTeams] = useState([]);
  const [pool, setPool] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auction State
  const [currentPrice, setCurrentPrice] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [timer, setTimer] = useState(10);
  const [maxTimer, setMaxTimer] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [isStriking, setIsStriking] = useState(false);
  const [callOutText, setCallOutText] = useState('');

  // Modals & Navigation
  const [activeTab, setActiveTab] = useState('arena');
  const [soldCelebration, setSoldCelebration] = useState(null);
  const [muted, setMuted] = useState(false);
  const [selectedSquadTeamId, setSelectedSquadTeamId] = useState(null);

  const currentPlayer = pool[currentIndex] || null;

  // Handle Create Room
  const handleCreateRoom = ({ code, teamId, ownerName, visibility, startingPurse, bidTimer, gameMode, modeName }) => {
    setUserTeamId(teamId);
    setIsHost(true);
    setMaxTimer(bidTimer);
    setTimer(bidTimer);

    const initialClaimed = {
      [teamId]: { name: ownerName, isHost: true }
    };

    setRoom({
      code,
      startingPurse,
      bidTimer,
      gameMode,
      modeName,
      claimedTeams: initialClaimed
    });

    setScreen('waiting');
  };

  // Handle Join Room
  const handleJoinRoom = ({ code, teamId, ownerName }) => {
    setUserTeamId(teamId);
    setIsHost(false);
    setMaxTimer(10);
    setTimer(10);

    const initialClaimed = {
      'MI': { name: 'Host (Stun)', isHost: true },
      [teamId]: { name: ownerName, isHost: false }
    };

    setRoom({
      code,
      startingPurse: 120.0,
      bidTimer: 10,
      gameMode: 'mega',
      modeName: 'IPL 2026 Mega Auction',
      claimedTeams: initialClaimed
    });

    setScreen('waiting');
  };

  // Switch Team in Waiting Room
  const handleSwitchTeam = (newTeamId) => {
    const currentClaimed = { ...room.claimedTeams };
    const myInfo = currentClaimed[userTeamId] || { name: 'Player', isHost };
    delete currentClaimed[userTeamId];
    currentClaimed[newTeamId] = myInfo;

    setRoom(prev => ({ ...prev, claimedTeams: currentClaimed }));
    setUserTeamId(newTeamId);
  };

  // Start Auction from Waiting Room
  const handleStartAuctionFromWaiting = ({ fillBots }) => {
    const isMini = room.gameMode === 'mini';

    const initializedTeams = TEAMS.map(t => {
      const claimed = room.claimedTeams[t.id];
      const teamPurse = isMini ? t.mini2026Purse : room.startingPurse;
      const initialRetained = isMini ? t.mini2026Retained : 0;
      const initialOverseas = isMini ? t.mini2026Overseas : 0;

      // Dummy retained placeholders if in Mini mode
      const placeholderSquad = isMini ? Array.from({ length: initialRetained }, (_, i) => ({
        id: `ret_${t.id}_${i}`,
        name: `Retained Player ${i + 1}`,
        role: i % 4 === 0 ? 'Wicket-Keeper' : i % 3 === 0 ? 'All-Rounder' : i % 2 === 0 ? 'Bowler' : 'Batter',
        isOverseas: i < initialOverseas,
        soldPrice: 0,
        stats: { matches: 50, runs: 1200, wickets: 25 }
      })) : [];

      return {
        ...t,
        startingPurse: teamPurse,
        purse: teamPurse,
        squad: placeholderSquad,
        overseasCount: initialOverseas,
        ownerName: claimed ? claimed.name : `Bot (${t.shortName})`
      };
    });

    setTeams(initializedTeams);
    setPool([...PLAYERS]);
    setCurrentIndex(0);
    setCurrentPrice(0);
    setHighestBidder(null);
    setBidHistory([]);
    setScreen('auction');
    setIsPaused(false);
  };

  // Sound Mute Toggle
  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  // Trigger Gavel Animation
  const triggerGavel = (callOut = '') => {
    setIsStriking(true);
    setCallOutText(callOut);
    sounds.playGavelStrike();
    setTimeout(() => {
      setIsStriking(false);
    }, 450);
  };

  // Place a Bid (Human or Bot)
  // Exact playauctiongame rule: on each valid bid, countdown resets to 5s!
  const placeBid = (teamId) => {
    if (isPaused || !currentPlayer) return;

    const biddingTeam = teams.find(t => t.id === teamId);
    if (!biddingTeam) return;

    const nextIncrement = currentPrice === 0 ? currentPlayer.basePrice : getNextBidIncrement(currentPrice);
    const nextPrice = currentPrice === 0 
      ? currentPlayer.basePrice 
      : Math.round((currentPrice + nextIncrement) * 100) / 100;

    setCurrentPrice(nextPrice);
    setHighestBidder(biddingTeam);
    setBidHistory(prev => [{ team: biddingTeam, amount: nextPrice }, ...prev]);
    
    // PlayAuctionGame Rule: resets countdown to 5 seconds upon every bid!
    const resetTime = Math.min(maxTimer, 5);
    setTimer(resetTime);
    setCallOutText('');
    sounds.playBidSound();
    triggerGavel();
  };

  // Skip or Pass current player
  const handlePassPlayer = () => {
    if (!currentPlayer) return;
    sounds.playUnsoldTone();
    moveToNextPlayer(false);
  };

  // Move to next player after SOLD or UNSOLD
  const moveToNextPlayer = (wasSold = false, soldPrice = 0, winner = null) => {
    if (wasSold && winner && currentPlayer) {
      setTeams(prevTeams => prevTeams.map(t => {
        if (t.id === winner.id) {
          const updatedSquad = [...t.squad, { ...currentPlayer, soldPrice, soldToTeam: winner }];
          const updatedOverseas = currentPlayer.isOverseas ? t.overseasCount + 1 : t.overseasCount;
          const updatedPurse = Math.round((t.purse - soldPrice) * 100) / 100;
          return {
            ...t,
            purse: updatedPurse,
            squad: updatedSquad,
            overseasCount: updatedOverseas
          };
        }
        return t;
      }));

      setPool(prevPool => prevPool.map((p, idx) => {
        if (idx === currentIndex) {
          return { ...p, sold: true, soldPrice, soldToTeam: winner };
        }
        return p;
      }));
    } else if (currentPlayer) {
      setPool(prevPool => prevPool.map((p, idx) => {
        if (idx === currentIndex) {
          return { ...p, unsold: true };
        }
        return p;
      }));
    }

    setCurrentPrice(0);
    setHighestBidder(null);
    setBidHistory([]);
    setTimer(maxTimer);
    setCallOutText('');
    setCurrentIndex(prev => prev + 1);
  };

  // Timer Tick Hook
  useEffect(() => {
    if (screen !== 'auction' || isPaused || !currentPlayer || soldCelebration) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (highestBidder) {
            sounds.playSoldFanfare();
            setSoldCelebration({
              player: currentPlayer,
              winningTeam: highestBidder,
              soldPrice: currentPrice
            });
            moveToNextPlayer(true, currentPrice, highestBidder);
          } else {
            sounds.playUnsoldTone();
            moveToNextPlayer(false);
          }
          return 0;
        }

        // Tension Callouts during final countdown
        if (prev === 4) {
          setCallOutText('Going once...');
          sounds.playTimerWarning();
        } else if (prev === 2) {
          setCallOutText('Going twice...');
          sounds.playTimerWarning();
          triggerGavel('Going twice...');
        } else if (prev === 1) {
          setCallOutText('Fair warning!');
          sounds.playTimerWarning();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, isPaused, currentPlayer, currentPrice, highestBidder, soldCelebration, maxTimer]);

  // AI Franchise Bots Simulation Hook
  useEffect(() => {
    if (screen !== 'auction' || isPaused || !currentPlayer || soldCelebration) return;

    const delay = Math.random() * 1400 + 800;
    const timeout = setTimeout(() => {
      const eligibleBots = teams.filter(t => t.id !== userTeamId && t.id !== highestBidder?.id);
      if (eligibleBots.length === 0) return;

      const randomBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
      const shouldBid = decideBotBid(randomBot, currentPlayer, currentPrice, highestBidder?.id);

      if (shouldBid) {
        placeBid(randomBot.id);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [screen, isPaused, currentPlayer, currentPrice, highestBidder, soldCelebration, teams, userTeamId]);

  // SCREEN 1: ROOM CREATION & LOBBY
  if (screen === 'lobby') {
    return (
      <RoomLobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  // SCREEN 2: PRE-AUCTION WAITING ROOM
  if (screen === 'waiting') {
    return (
      <WaitingRoom
        room={room}
        userTeamId={userTeamId}
        isHost={isHost}
        onSwitchTeam={handleSwitchTeam}
        onStartAuction={handleStartAuctionFromWaiting}
        onLeaveRoom={() => setScreen('lobby')}
      />
    );
  }

  // SCREEN 3: LIVE AUCTION ARENA
  const userTeam = teams.find(t => t.id === userTeamId);
  const soldPlayers = pool.filter(p => p.sold);
  const unsoldPlayers = pool.filter(p => p.unsold);
  const upcomingPlayers = pool.slice(currentIndex + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roomCode={room.code}
        userTeam={userTeam}
        muted={muted}
        onToggleMute={handleToggleMute}
        onLeaveRoom={() => setScreen('waiting')}
      />

      {/* Main Auction Presentation Stage */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center">
        {activeTab === 'arena' && (
          <AuctionPodium
            player={currentPlayer}
            currentPrice={currentPrice}
            highestBidder={highestBidder}
            userTeam={userTeam}
            timer={timer}
            maxTimer={maxTimer}
            isPaused={isPaused}
            isStriking={isStriking}
            callOutText={callOutText}
            bidHistory={bidHistory}
            onPlaceBid={placeBid}
            onTogglePause={() => setIsPaused(p => !p)}
            onPassPlayer={handlePassPlayer}
            muted={muted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activeTab === 'squads' && (
          <SquadsModal
            teams={teams}
            userTeamId={userTeamId}
            initialTeamId={selectedSquadTeamId || userTeamId}
            onClose={() => setActiveTab('arena')}
          />
        )}

        {activeTab === 'xi' && (
          <PlayingXIAnalyzer
            userTeam={userTeam}
            onClose={() => setActiveTab('arena')}
          />
        )}

        {activeTab === 'pool' && (
          <PlayersPoolModal
            upcomingPlayers={upcomingPlayers}
            soldPlayers={soldPlayers}
            unsoldPlayers={unsoldPlayers}
            onClose={() => setActiveTab('arena')}
          />
        )}
      </main>

      {/* Role-Specific SOLD Celebration Overlay */}
      {soldCelebration && (
        <SoldCelebrationModal
          player={soldCelebration.player}
          winningTeam={soldCelebration.winningTeam}
          soldPrice={soldCelebration.soldPrice}
          onClose={() => setSoldCelebration(null)}
        />
      )}

      {/* Bottom Teams Ticker */}
      <TeamsTicker
        teams={teams}
        userTeamId={userTeamId}
        onSelectTeam={(teamId) => {
          setSelectedSquadTeamId(teamId);
          setActiveTab('squads');
        }}
      />
    </div>
  );
}
