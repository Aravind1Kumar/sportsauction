import React, { useState, useEffect, useRef } from 'react';
import { TEAMS } from './data/teams';
import { PLAYERS } from './data/players';
import { sounds } from './utils/audio';
import { decideBotBid, getNextBidIncrement, formatMoney } from './utils/rules';
import { multiplayer } from './utils/multiplayer';

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

  // Parse room code from URL parameters (?room=8AB3SC or #/room/8AB3SC)
  const [initialRoomCode, setInitialRoomCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('room');
      if (code) return code.toUpperCase().trim();
      if (window.location.hash) {
        const match = window.location.hash.match(/room[=/]([A-Za-z0-9]+)/);
        if (match) return match[1].toUpperCase().trim();
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
    return '';
  });

  // Room Info
  const [room, setRoom] = useState({
    code: initialRoomCode || '8AB3SC',
    startingPurse: 120.0,
    bidTimer: 10,
    gameMode: 'mega',
    modeName: 'IPL 2026 Mega Auction',
    claimedTeams: {}
  });

  const [userTeamId, setUserTeamId] = useState('CSK');
  const [userName, setUserName] = useState('Captain');
  const [isHost, setIsHost] = useState(!initialRoomCode); // If invited via link, default to guest
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

  // Modals, Navigation & Chat
  const [activeTab, setActiveTab] = useState('arena');
  const [soldCelebration, setSoldCelebration] = useState(null);
  const [muted, setMuted] = useState(false);
  const [selectedSquadTeamId, setSelectedSquadTeamId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: 'Welcome to Sports Auction! Claim your team and invite friends.', time: 'Just now' }
  ]);

  const currentPlayer = pool[currentIndex] || null;
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;
  const roomRef = useRef(room);
  roomRef.current = room;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // On initial mount, if room code exists in URL, check for saved snapshot
  useEffect(() => {
    if (initialRoomCode) {
      const snapshot = multiplayer.getRoomSnapshot(initialRoomCode);
      if (snapshot) {
        setRoom(snapshot);
      } else {
        setRoom(prev => ({ ...prev, code: initialRoomCode }));
      }
    }
  }, [initialRoomCode]);

  // Keep URL updated with room code when in waiting or auction
  useEffect(() => {
    if (room?.code && screen !== 'lobby' && typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('room') !== room.code) {
          url.searchParams.set('room', room.code);
          window.history.replaceState({}, '', url.toString());
        }
      } catch (e) {}
    }
  }, [room?.code, screen]);

  // Handle Multiplayer Incoming Messages
  useEffect(() => {
    const unsubscribe = multiplayer.subscribe((action) => {
      if (!action || !action.type) return;

      switch (action.type) {
        case 'PLAYER_JOINED': {
          const { teamId, ownerName } = action;
          const team = TEAMS.find(t => t.id === teamId);
          const teamLabel = team ? team.shortName : teamId;

          setRoom(prev => {
            const updated = {
              ...prev,
              claimedTeams: {
                ...(prev.claimedTeams || {}),
                [teamId]: { name: ownerName, isHost: false }
              }
            };
            if (isHostRef.current) {
              multiplayer.saveRoomSnapshot(updated);
              // Host broadcasts authoritative state back to new guest
              multiplayer.broadcast({
                type: 'SYNC_ROOM_STATE',
                room: updated
              });
            }
            return updated;
          });

          setChatMessages(prev => [
            ...prev,
            { sender: 'System', text: `🎉 ${ownerName} joined the room as ${teamLabel}!`, time: 'Now' }
          ]);
          sounds.playBidSound();
          break;
        }

        case 'SYNC_ROOM_STATE': {
          if (action.room) {
            setRoom(action.room);
            if (action.room.bidTimer) {
              setMaxTimer(action.room.bidTimer);
              setTimer(action.room.bidTimer);
            }
          }
          break;
        }

        case 'HEARTBEAT_SYNC': {
          if (action.room && action.room.claimedTeams) {
            setRoom(prev => {
              const currentCount = Object.keys(prev.claimedTeams || {}).length;
              const incomingCount = Object.keys(action.room.claimedTeams || {}).length;
              if (incomingCount > currentCount) {
                sounds.playBidSound();
                return {
                  ...prev,
                  claimedTeams: {
                    ...prev.claimedTeams,
                    ...action.room.claimedTeams
                  }
                };
              }
              return prev;
            });
          }
          break;
        }

        case 'REQUEST_ROOM_SYNC': {
          if (isHostRef.current) {
            multiplayer.broadcast({
              type: 'SYNC_ROOM_STATE',
              room: roomRef.current
            });
          }
          break;
        }

        case 'SWITCH_TEAM': {
          const { oldTeamId, newTeamId, ownerName } = action;
          setRoom(prev => {
            const updated = { ...prev.claimedTeams };
            delete updated[oldTeamId];
            updated[newTeamId] = { name: ownerName, isHost: false };
            const nextRoom = { ...prev, claimedTeams: updated };
            if (isHostRef.current) {
              multiplayer.saveRoomSnapshot(nextRoom);
              multiplayer.broadcast({ type: 'SYNC_ROOM_STATE', room: nextRoom });
            }
            return nextRoom;
          });
          break;
        }

        case 'CHAT_MESSAGE': {
          if (action.message) {
            setChatMessages(prev => [...prev, action.message]);
          }
          break;
        }

        case 'START_AUCTION': {
          setTeams(action.teams);
          setPool(action.pool || [...PLAYERS]);
          setCurrentIndex(0);
          setCurrentPrice(0);
          setHighestBidder(null);
          setBidHistory([]);
          setScreen('auction');
          setIsPaused(false);
          sounds.playGavelStrike();
          break;
        }

        case 'PLACE_BID': {
          // Process remote bid
          placeBid(action.teamId, true);
          break;
        }

        case 'ROUND_RESULT': {
          if (!isHostRef.current) {
            if (action.wasSold && action.winner) {
              sounds.playSoldFanfare();
              setSoldCelebration({
                player: pool[action.playerIndex] || currentPlayer,
                winningTeam: action.winner,
                soldPrice: action.soldPrice
              });
              moveToNextPlayer(true, action.soldPrice, action.winner);
            } else {
              sounds.playUnsoldTone();
              moveToNextPlayer(false);
            }
          }
          break;
        }

        case 'SET_PAUSE': {
          setIsPaused(action.isPaused);
          break;
        }

        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [pool, currentPlayer]);

  // Handle Create Room
  const handleCreateRoom = ({ code, teamId, ownerName, visibility, startingPurse, bidTimer, gameMode, modeName }) => {
    setUserTeamId(teamId);
    setUserName(ownerName);
    setIsHost(true);
    setMaxTimer(bidTimer);
    setTimer(bidTimer);

    const initialClaimed = {
      [teamId]: { name: ownerName, isHost: true }
    };

    const newRoom = {
      code,
      startingPurse,
      bidTimer,
      gameMode,
      modeName,
      claimedTeams: initialClaimed
    };

    setRoom(newRoom);
    multiplayer.init(code, true, teamId, ownerName);
    multiplayer.saveRoomSnapshot(newRoom);

    setChatMessages([
      { sender: 'System', text: `Room ${code} created! Share the link with friends to play together.`, time: 'Just now' }
    ]);

    setScreen('waiting');
  };

  // Handle Join Room
  const handleJoinRoom = ({ code, teamId, ownerName }) => {
    setUserTeamId(teamId);
    setUserName(ownerName);
    setIsHost(false);
    setMaxTimer(10);
    setTimer(10);

    const snapshot = multiplayer.getRoomSnapshot(code);
    const updatedClaimed = {
      ...(snapshot?.claimedTeams || {}),
      [teamId]: { name: ownerName, isHost: false }
    };

    const updatedRoom = {
      code,
      startingPurse: snapshot?.startingPurse || 120.0,
      bidTimer: snapshot?.bidTimer || 10,
      gameMode: snapshot?.gameMode || 'mega',
      modeName: snapshot?.modeName || 'IPL 2026 Mega Auction',
      claimedTeams: updatedClaimed
    };

    setRoom(updatedRoom);
    multiplayer.init(code, false, teamId, ownerName);
    multiplayer.saveRoomSnapshot(updatedRoom);

    // Broadcast join to Host
    multiplayer.broadcast({
      type: 'PLAYER_JOINED',
      teamId,
      ownerName
    });

    setChatMessages([
      { sender: 'System', text: `Joined Room ${code} as ${ownerName}! Waiting for host to launch.`, time: 'Just now' }
    ]);

    setScreen('waiting');
  };

  // Switch Team in Waiting Room
  const handleSwitchTeam = (newTeamId) => {
    const currentClaimed = { ...room.claimedTeams };
    const myInfo = currentClaimed[userTeamId] || { name: userName, isHost };
    delete currentClaimed[userTeamId];
    currentClaimed[newTeamId] = myInfo;

    const nextRoom = { ...prevRoom => ({ ...prevRoom, claimedTeams: currentClaimed }) };
    setRoom(prev => ({ ...prev, claimedTeams: currentClaimed }));
    setUserTeamId(newTeamId);

    multiplayer.broadcast({
      type: 'SWITCH_TEAM',
      oldTeamId: userTeamId,
      newTeamId,
      ownerName: myInfo.name
    });
  };

  // Send Chat Message
  const handleSendChatMessage = (newMsg) => {
    setChatMessages(prev => [...prev, newMsg]);
    multiplayer.broadcast({
      type: 'CHAT_MESSAGE',
      message: newMsg
    });
  };

  // Start Auction from Waiting Room
  const handleStartAuctionFromWaiting = ({ fillBots }) => {
    const isMini = room.gameMode === 'mini';

    const initializedTeams = TEAMS.map(t => {
      const claimed = room.claimedTeams ? room.claimedTeams[t.id] : null;
      const teamPurse = isMini ? t.mini2026Purse : room.startingPurse;
      const initialRetained = isMini ? t.mini2026Retained : 0;
      const initialOverseas = isMini ? t.mini2026Overseas : 0;

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

    // Broadcast to guests so they join the arena together!
    multiplayer.broadcast({
      type: 'START_AUCTION',
      teams: initializedTeams,
      pool: PLAYERS,
      gameMode: room.gameMode
    });
  };

  // Leave room & clear URL
  const handleLeaveRoom = () => {
    multiplayer.cleanup();
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
    setScreen('lobby');
    setInitialRoomCode('');
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

  // Place a Bid (Human or Bot, Local or Remote)
  const placeBid = (teamId, isRemote = false) => {
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

    // Broadcast bid if placed locally
    if (!isRemote) {
      multiplayer.broadcast({
        type: 'PLACE_BID',
        teamId,
        nextPrice
      });
    }
  };

  // Skip or Pass current player (Host only)
  const handlePassPlayer = () => {
    if (!currentPlayer || !isHost) return;
    sounds.playUnsoldTone();
    moveToNextPlayer(false);
    multiplayer.broadcast({
      type: 'ROUND_RESULT',
      wasSold: false,
      soldPrice: 0,
      winner: null,
      playerIndex: currentIndex
    });
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

  // Pause / Resume toggle
  const handleTogglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    multiplayer.broadcast({
      type: 'SET_PAUSE',
      isPaused: nextState
    });
  };

  // Timer Tick Hook (Authoritative on Host)
  useEffect(() => {
    if (screen !== 'auction' || isPaused || !currentPlayer || soldCelebration) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          
          if (isHost) {
            if (highestBidder) {
              sounds.playSoldFanfare();
              setSoldCelebration({
                player: currentPlayer,
                winningTeam: highestBidder,
                soldPrice: currentPrice
              });
              moveToNextPlayer(true, currentPrice, highestBidder);
              multiplayer.broadcast({
                type: 'ROUND_RESULT',
                wasSold: true,
                soldPrice: currentPrice,
                winner: highestBidder,
                playerIndex: currentIndex
              });
            } else {
              sounds.playUnsoldTone();
              moveToNextPlayer(false);
              multiplayer.broadcast({
                type: 'ROUND_RESULT',
                wasSold: false,
                soldPrice: 0,
                winner: null,
                playerIndex: currentIndex
              });
            }
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
  }, [screen, isHost, isPaused, currentPlayer, currentPrice, highestBidder, soldCelebration, maxTimer, currentIndex]);

  // AI Franchise Bots Simulation Hook (Authoritative: Only Host simulates bots!)
  useEffect(() => {
    if (screen !== 'auction' || !isHost || isPaused || !currentPlayer || soldCelebration) return;

    const delay = Math.random() * 1400 + 800;
    const timeout = setTimeout(() => {
      const eligibleBots = teams.filter(t => {
        const isHuman = room.claimedTeams && room.claimedTeams[t.id];
        return !isHuman && t.id !== highestBidder?.id;
      });
      if (eligibleBots.length === 0) return;

      const randomBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
      const shouldBid = decideBotBid(randomBot, currentPlayer, currentPrice, highestBidder?.id);

      if (shouldBid) {
        placeBid(randomBot.id);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [screen, isHost, isPaused, currentPlayer, currentPrice, highestBidder, soldCelebration, teams, room.claimedTeams]);

  // SCREEN 1: ROOM CREATION & LOBBY
  if (screen === 'lobby') {
    return (
      <RoomLobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        initialRoomCode={initialRoomCode}
        existingRoomData={room}
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
        chatMessages={chatMessages}
        onSendMessage={handleSendChatMessage}
        onSwitchTeam={handleSwitchTeam}
        onStartAuction={handleStartAuctionFromWaiting}
        onLeaveRoom={handleLeaveRoom}
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
        userTeam={userTeam}
        room={room}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSquad={() => setSelectedSquadTeamId(userTeamId)}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Main Content Area based on Tab */}
      <main className="max-w-7xl mx-auto w-full p-3 sm:p-5 flex-1 flex flex-col">
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
            onPlaceBid={() => placeBid(userTeamId)}
            onTogglePause={handleTogglePause}
            onPassPlayer={handlePassPlayer}
            muted={muted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activeTab === 'pool' && (
          <div className="py-2">
            <PlayersPoolModal
              pool={pool}
              currentIndex={currentIndex}
              teams={teams}
              onClose={() => setActiveTab('arena')}
            />
          </div>
        )}

        {activeTab === 'squads' && (
          <div className="py-2">
            <SquadsModal
              teams={teams}
              initialTeamId={selectedSquadTeamId || userTeamId}
              onClose={() => setActiveTab('arena')}
            />
          </div>
        )}

        {activeTab === 'xi' && (
          <div className="py-2">
            <PlayingXIAnalyzer
              team={userTeam}
              onClose={() => setActiveTab('arena')}
            />
          </div>
        )}
      </main>

      {/* Bottom Live Teams Ticker */}
      <TeamsTicker
        teams={teams}
        highestBidder={highestBidder}
        userTeamId={userTeamId}
        onSelectTeam={(teamId) => {
          setSelectedSquadTeamId(teamId);
          setActiveTab('squads');
        }}
      />

      {/* Sold Celebration Overlay */}
      {soldCelebration && (
        <SoldCelebrationModal
          player={soldCelebration.player}
          winningTeam={soldCelebration.winningTeam}
          soldPrice={soldCelebration.soldPrice}
          onClose={() => setSoldCelebration(null)}
        />
      )}

    </div>
  );
}
