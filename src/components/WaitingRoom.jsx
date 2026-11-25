import React, { useState } from 'react';
import { TEAMS } from '../data/teams';
import { formatMoney } from '../utils/rules';
import { 
  Trophy, 
  Copy, 
  Share2, 
  Check, 
  Users, 
  Crown, 
  Play, 
  MessageSquare, 
  Send, 
  Bot, 
  Sparkles,
  ArrowLeft,
  Shield,
  Clock,
  DollarSign
} from 'lucide-react';

export default function WaitingRoom({
  room,
  userTeamId,
  isHost,
  chatMessages: externalChatMessages,
  onSendMessage: externalOnSendMessage,
  onSwitchTeam,
  onStartAuction,
  onLeaveRoom
}) {
  const [copied, setCopied] = useState(false);
  const [localChatMessages, setLocalChatMessages] = useState([
    { sender: 'System', text: `Room ${room.code} created! Share the code or link with friends.`, time: 'Just now' },
    { sender: 'Bot (MI)', text: 'Mumbai Indians are ready for the bidding war!', time: 'Just now' }
  ]);
  const [inputText, setInputText] = useState('');
  const [fillBots, setFillBots] = useState(true);

  const chatMessages = externalChatMessages || localChatMessages;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const inviteLink = `${origin}${pathname}?room=${room.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Join my IPL Sports Auction room on Sports Auction! Room Code: ${room.code} Link: ${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userTeam = TEAMS.find(t => t.id === userTeamId);
    const newMsg = {
      sender: `${userTeam?.shortName || 'You'}`,
      text: inputText.trim(),
      time: 'Now'
    };

    if (externalOnSendMessage) {
      externalOnSendMessage(newMsg);
    } else {
      setLocalChatMessages(prev => [...prev, newMsg]);
    }
    setInputText('');
  };

  const claimedCount = room.claimedTeams ? Object.keys(room.claimedTeams).length : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Leave Room"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white uppercase">
                Room <span className="text-amber-400">{room.code}</span>
              </span>
              <span className="text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                {room.modeName || 'IPL Mega Auction'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Pre-Auction Lobby • Claim your franchise & invite friends</p>
          </div>
        </div>

        {/* Share & Invite Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </header>

      {/* Main Lobby Grid */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (8 cols): 10 Franchise Claim Slots */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Franchise Table ({claimedCount}/10 Claimed)</span>
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span>💰 Purse: {formatMoney(room.startingPurse || 120.0)}</span>
              <span>⏱️ Timer: {room.bidTimer || 10}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {TEAMS.map(team => {
              const claimedBy = room.claimedTeams ? room.claimedTeams[team.id] : null;
              const isUserTeam = team.id === userTeamId;
              const isClaimed = !!claimedBy;

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isUserTeam
                      ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(250,204,21,0.25)]'
                      : isClaimed
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center p-1 shadow"
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
                        <span className="font-black text-xs">{team.shortName}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">{team.name}</span>
                        {isUserTeam && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {isClaimed ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            {claimedBy.isHost && <Crown className="w-3 h-3 text-amber-400" />}
                            {claimedBy.name}
                          </span>
                        ) : fillBots ? (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Bot className="w-3 h-3 text-cyan-400" />
                            <span>AI Franchise Bot</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">Vacant</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {!isUserTeam && (
                      <button
                        onClick={() => onSwitchTeam(team.id)}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors border border-slate-700"
                      >
                        {isClaimed ? 'Take Over' : 'Claim'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT (4 cols): Live Room Chat & Host Start Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Start Auction Control Box */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400" />
              <span>Launch Auction Arena</span>
            </h3>

            {/* Smart Bots Toggle */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">Fill Remaining with AI Bots</div>
                  <div className="text-[10px] text-slate-400">Auto-pilot unassigned franchises</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={fillBots} 
                onChange={(e) => setFillBots(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </div>

            {/* Start Button */}
            {isHost ? (
              <button
                onClick={() => onStartAuction({ fillBots })}
                className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base uppercase rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Start Auction Now 🔨</span>
              </button>
            ) : (
              <div className="text-center py-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
                ⏳ Waiting for room host to start the auction...
              </div>
            )}
          </div>

          {/* Live Room Chat Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex-1 flex flex-col justify-between h-72">
            <div className="text-xs font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Lobby Room Chat</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-xs p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-amber-400">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="text-slate-200">{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Chat in room..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </main>

    </div>
  );
}
