import React from 'react';
import { formatMoney } from '../utils/rules';

export default function TeamsTicker({ teams, userTeamId, onSelectTeam }) {
  return (
    <div className="w-full bg-slate-950/90 border-t border-slate-800/80 py-2.5 px-4 overflow-x-auto shadow-2xl backdrop-blur-lg">
      <div className="flex items-center gap-3 min-w-max mx-auto justify-start lg:justify-center">
        {teams.map((team) => {
          const isUser = team.id === userTeamId;
          return (
            <button
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-200 text-left hover:scale-105 ${
                isUser 
                  ? 'bg-slate-900 border-amber-400/80 shadow-[0_0_15px_rgba(250,204,21,0.2)]' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Franchise Logo / Badge */}
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow"
                style={{ backgroundColor: team.primaryColor, color: team.textColor }}
              >
                {team.logo ? (
                  <img 
                    src={team.logo} 
                    alt={team.shortName} 
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerText = team.shortName;
                    }}
                  />
                ) : (
                  <span>{team.shortName}</span>
                )}
              </div>

              {/* Purse & Squad Counts */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">{team.shortName}</span>
                  {isUser && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded">
                      YOU
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-extrabold text-amber-400">{formatMoney(team.purse)}</span>
                  <span className="text-slate-400">({team.squad.length}/25 • ✈️{team.overseasCount})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
