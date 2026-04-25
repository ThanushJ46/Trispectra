import React from 'react';
import { getGameState, getLevel } from '../utils/pointsHelper';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function PointsBadges({ scanPoints, scanBreakdown }) {
  const state = getGameState();
  const level = state.level;

  return (
    <div className="space-y-4">
      {/* Scan points earned */}
      {scanPoints > 0 && (
        <div className="bg-gradient-to-r from-[#e8f5e9] to-[#f0fdf4] rounded-[20px] p-5 anim">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl points-pop">⭐</span>
            <div>
              <p className="font-black text-2xl text-[#0f5238]">+{scanPoints} points</p>
              <p className="text-xs text-[#404943]">Earned from this scan</p>
            </div>
          </div>
          {scanBreakdown && scanBreakdown.length > 0 && (
            <div className="space-y-1 mt-2 pt-2 border-t border-[#2d6a4f]/10">
              {scanBreakdown.map((b, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-[#404943]">{b.label}</span>
                  <span className="font-semibold text-[#2d6a4f]">+{b.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Level & total */}
      <div className="flex gap-3">
        <div className="card-s flex-1">
          <p className="text-xs text-[#404943] font-semibold uppercase tracking-wider">Level</p>
          <p className="text-xl font-bold text-[#151c22] mt-0.5">{level.icon} {level.name}</p>
          {level.nextLevel && (
            <div className="mt-2">
              <div className="h-1.5 bg-[#dce3ec] rounded-full">
                <div className="h-1.5 bg-[#2d6a4f] rounded-full transition-all" style={{width:`${Math.min(level.progress,100)}%`}}/>
              </div>
              <p className="text-[10px] text-[#404943] mt-1">{Math.round(level.progress)}% to {level.nextLevel.name}</p>
            </div>
          )}
        </div>
        <div className="card-s flex-1">
          <p className="text-xs text-[#404943] font-semibold uppercase tracking-wider">Total</p>
          <p className="text-xl font-bold text-[#2d6a4f] mt-0.5">{state.totalPoints.toLocaleString()}</p>
          <p className="text-xs text-[#404943]">points</p>
        </div>
      </div>

      {/* Streak */}
      {state.streak > 0 && (
        <div className="flex items-center gap-2 bg-[#fff8e1] rounded-full px-4 py-2 border border-[#e8a020]/20">
          <span className="text-lg">🔥</span>
          <span className="font-bold text-[#e8a020] text-sm">{state.streak}-day streak</span>
        </div>
      )}

      {/* Badges */}
      {state.earnedBadges.length > 0 && (
        <div>
          <p className="text-xs text-[#404943] font-semibold uppercase tracking-wider mb-2">Badges Earned</p>
          <div className="flex flex-wrap gap-2">
            {state.earnedBadges.map(b => (
              <div key={b.id} className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-[#151c22]">
                <span>{b.icon}</span> {b.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
