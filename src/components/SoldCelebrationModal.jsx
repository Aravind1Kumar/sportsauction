import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { formatMoney } from '../utils/rules';
import { Trophy, CheckCircle, ArrowRight, Shield, Award } from 'lucide-react';

export default function SoldCelebrationModal({ player, winningTeam, soldPrice, onClose }) {
  useEffect(() => {
    if (!winningTeam) return;

    // Trigger double confetti blast with the winning team's primary & secondary colors
    const c1 = winningTeam.primaryColor;
    const c2 = winningTeam.secondaryColor || '#FFD700';

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [c1, c2, '#FFD700', '#FFFFFF']
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [c1, c2, '#FFD700']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [c1, c2, '#FFD700']
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [winningTeam]);

  if (!player || !winningTeam) return null;

  // Render role-specific animated SVG jersey graphic
  const renderRoleGraphic = () => {
    const pColor = winningTeam.primaryColor;
    const sColor = winningTeam.secondaryColor || '#FFFFFF';
    const tColor = winningTeam.textColor || '#FFFFFF';

    if (player.role === 'Batter') {
      return (
        <div className="relative w-44 h-48 mx-auto flex items-center justify-center">
          {/* Animated Glow Aura */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse" 
            style={{ backgroundColor: pColor }}
          />
          {/* Dynamic Batter in Team Jersey */}
          <svg className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={pColor} />
                <stop offset="60%" stopColor={pColor} />
                <stop offset="100%" stopColor={sColor} />
              </linearGradient>
            </defs>

            {/* Helmet */}
            <circle cx="100" cy="45" r="22" fill="#1E293B" />
            <path d="M80 46 C85 30, 115 30, 120 46 Z" fill={pColor} />
            <rect x="85" y="47" width="30" height="4" fill="#94A3B8" rx="2" />
            <path d="M82 48 L76 56" stroke="#94A3B8" strokeWidth="2.5" />

            {/* Team Jersey Body */}
            <path d="M70 70 L130 70 L145 125 L122 130 L115 105 L85 105 L78 130 L55 125 Z" fill="url(#jerseyGrad)" stroke="#111827" strokeWidth="2" />
            {/* Jersey Collar */}
            <polygon points="90,70 100,85 110,70" fill={sColor} />
            {/* Team Crest / Badge on Chest */}
            <circle cx="85" cy="88" r="7" fill="#FFFFFF" stroke={sColor} strokeWidth="1.5" />
            <text x="85" y="91" textAnchor="middle" fontSize="6" fontWeight="bold" fill={pColor}>{winningTeam.shortName}</text>
            {/* Player Jersey Number */}
            <text x="100" y="100" textAnchor="middle" fontSize="13" fontWeight="900" fill={tColor}>18</text>

            {/* Batting Arms & Gloves in Team Colors */}
            <path d="M60 115 L45 130 L55 138" stroke={pColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="56" cy="138" r="6" fill={sColor} stroke="#1E293B" strokeWidth="1.5" />
            
            {/* Power Willow Cricket Bat with Grip */}
            <g transform="rotate(-35 56 138)">
              <rect x="53" y="115" width="6" height="23" fill="#E2E8F0" rx="2" />
              <rect x="49" y="55" width="14" height="65" fill="#D97706" rx="3" stroke="#78350F" strokeWidth="2" />
              <path d="M56 60 L56 115" stroke="#B45309" strokeWidth="1.5" />
              <rect x="52" y="75" width="8" height="25" fill="#FDE68A" />
            </g>

            {/* Motion Speed Lines */}
            <path d="M140 50 Q170 80 160 130" stroke="#FACC15" strokeWidth="3" strokeDasharray="6 4" />
            <path d="M150 40 Q185 75 175 140" stroke={pColor} strokeWidth="2.5" opacity="0.8" />
          </svg>
        </div>
      );
    } else if (player.role === 'Bowler') {
      return (
        <div className="relative w-44 h-48 mx-auto flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse" 
            style={{ backgroundColor: pColor }}
          />
          {/* Dynamic Bowler in Team Jersey */}
          <svg className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bowlerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={pColor} />
                <stop offset="70%" stopColor={sColor} />
              </linearGradient>
            </defs>

            {/* Head & Headband */}
            <circle cx="95" cy="45" r="20" fill="#E2E8F0" />
            <path d="M78 40 C85 28, 110 28, 115 40 Z" fill="#1E293B" />
            <rect x="78" y="42" width="37" height="6" fill={sColor} rx="2" />

            {/* Athletic Team Jersey Body (Delivery Leaping Stride) */}
            <path d="M75 68 L120 68 L135 120 L115 125 L110 100 L85 100 L80 125 L60 120 Z" fill="url(#bowlerGrad)" stroke="#111827" strokeWidth="2" />
            <polygon points="90,68 97,80 105,68" fill={sColor} />
            {/* Team Crest */}
            <circle cx="85" cy="84" r="6" fill="#FFFFFF" />
            <text x="85" y="86.5" textAnchor="middle" fontSize="5" fontWeight="bold" fill={pColor}>{winningTeam.shortName}</text>
            <text x="98" y="96" textAnchor="middle" fontSize="12" fontWeight="900" fill={tColor}>93</text>

            {/* Delivery High Arm with Seam Cricket Ball */}
            <path d="M115 75 L145 40 L160 25" stroke={pColor} strokeWidth="7" strokeLinecap="round" />
            {/* Red Kookaburra Leather Ball */}
            <circle cx="165" cy="22" r="9" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
            <path d="M158 22 C163 17, 167 17, 172 22" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="2 1.5" />

            {/* Fire Speed Trails */}
            <path d="M165 35 L175 75" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
            <path d="M172 26 L190 50" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    } else if (player.role === 'All-Rounder') {
      return (
        <div className="relative w-44 h-48 mx-auto flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse" 
            style={{ backgroundColor: pColor }}
          />
          {/* Dynamic All-Rounder (Crossed Bat & Ball Iconography with Team Jersey) */}
          <svg className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="allroundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={pColor} />
                <stop offset="100%" stopColor={sColor} />
              </linearGradient>
            </defs>

            {/* Crossed Flaming Bat & Ball Emblem */}
            <g transform="rotate(-40 100 100)">
              <rect x="94" y="25" width="12" height="40" fill="#E2E8F0" rx="3" />
              <rect x="88" y="65" width="24" height="95" fill="#D97706" rx="4" stroke="#78350F" strokeWidth="2.5" />
              <rect x="92" y="85" width="16" height="35" fill="#FEF08A" />
            </g>

            {/* Team Jersey Armor Shield */}
            <path d="M70 65 L130 65 Q135 110 100 135 Q65 110 70 65 Z" fill="url(#allroundGrad)" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="100" cy="90" r="14" fill="#FFFFFF" />
            <text x="100" y="94" textAnchor="middle" fontSize="10" fontWeight="900" fill={pColor}>{winningTeam.shortName}</text>
            
            {/* Speeding Ball */}
            <circle cx="145" cy="140" r="14" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M135 140 C143 133, 147 133, 155 140" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />

            {/* Lightning bolts */}
            <polygon points="45,80 65,95 55,100 75,125 55,115" fill="#FACC15" />
            <polygon points="155,70 135,85 145,90 125,115 145,105" fill="#FACC15" />
          </svg>
        </div>
      );
    } else {
      // Wicket-Keeper
      return (
        <div className="relative w-44 h-48 mx-auto flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse" 
            style={{ backgroundColor: pColor }}
          />
          {/* Dynamic Keeper with Gloves & Stumps in Team Jersey */}
          <svg className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="keeperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={pColor} />
                <stop offset="100%" stopColor={sColor} />
              </linearGradient>
            </defs>

            {/* Wicket Stumps flying */}
            <rect x="140" y="50" width="5" height="70" fill="#F59E0B" rx="1.5" transform="rotate(15 140 50)" />
            <rect x="155" y="60" width="5" height="70" fill="#F59E0B" rx="1.5" transform="rotate(30 155 60)" />
            <rect x="130" y="65" width="5" height="70" fill="#F59E0B" rx="1.5" transform="rotate(-5 130 65)" />
            {/* Flying Bails */}
            <rect x="138" y="38" width="12" height="3" fill="#FDE68A" transform="rotate(-25 138 38)" />

            {/* Keeper Jersey Chest */}
            <path d="M65 75 L115 75 L125 125 L105 130 L100 105 L80 105 L75 130 L55 125 Z" fill="url(#keeperGrad)" stroke="#111827" strokeWidth="2" />
            <circle cx="80" cy="90" r="6" fill="#FFFFFF" />
            <text x="80" y="92.5" textAnchor="middle" fontSize="5" fontWeight="bold" fill={pColor}>{winningTeam.shortName}</text>
            <text x="95" y="100" textAnchor="middle" fontSize="12" fontWeight="900" fill={tColor}>07</text>

            {/* Big Webbed Wicketkeeping Gloves */}
            <g transform="translate(30, 85)">
              <rect x="0" y="0" width="22" height="26" fill={sColor} stroke="#1E293B" strokeWidth="2" rx="6" />
              <circle cx="11" cy="13" r="5" fill="#EF4444" />
            </g>
            <g transform="translate(110, 80)">
              <rect x="0" y="0" width="22" height="26" fill={sColor} stroke="#1E293B" strokeWidth="2" rx="6" />
              <circle cx="11" cy="13" r="5" fill="#EF4444" />
            </g>
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Celebration Card with Winning Team Border Gradient */}
      <div 
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] border-2 text-center p-6 sm:p-8"
        style={{
          background: 'linear-gradient(180deg, #090D16 0%, #030712 100%)',
          borderColor: winningTeam.primaryColor,
          boxShadow: `0 0 50px ${winningTeam.primaryColor}55`
        }}
      >
        {/* Top Gold Ribbon Accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-2.5"
          style={{ background: winningTeam.jerseyBg }}
        />

        {/* Big 3D "SOLD" Stamp Ribbon Banner */}
        <div className="relative inline-block mb-3">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-3xl sm:text-4xl tracking-wider px-8 py-2 rounded-xl uppercase shadow-[0_8px_25px_rgba(234,179,8,0.5)] transform -rotate-2 border-2 border-yellow-200">
            🔨 SOLD!
          </div>
        </div>

        {/* Dynamic Role Graphic with Winning Team's Jersey Colors */}
        {renderRoleGraphic()}

        {/* Role Headline Badge */}
        <div className="mt-2 mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{player.role} • {player.country} {player.flag}</span>
        </div>

        {/* Player Name & Headline */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {player.name}
        </h2>

        {/* Winning Franchise Announcement */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg font-black text-lg p-1"
              style={{ backgroundColor: winningTeam.primaryColor, color: winningTeam.textColor }}
            >
              {winningTeam.logo ? (
                <img 
                  src={winningTeam.logo} 
                  alt={winningTeam.shortName} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span>{winningTeam.shortName}</span>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Purchased by</div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>{winningTeam.name}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase font-semibold">Winning Bid</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow">
              {formatMoney(soldPrice)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            style={{
              backgroundColor: winningTeam.primaryColor,
              color: winningTeam.textColor
            }}
          >
            <span>Continue to Next Player</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
