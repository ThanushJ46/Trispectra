import React, { useState } from 'react';
import { completeCheckpoint, getCheckpoints } from '../utils/pointsHelper';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function CheckpointTimeline({ category, checkpoints = [], onPointsEarned }) {
  const [completed, setCompleted] = useState(() => getCheckpoints(category));
  const [celebrating, setCelebrating] = useState(null);

  const handleComplete = (day) => {
    const result = completeCheckpoint(category, day);
    if (!result.alreadyDone) {
      setCompleted(prev => ({ ...prev, [day]: { completedAt: new Date().toISOString() } }));
      setCelebrating(day);
      setTimeout(() => setCelebrating(null), 1500);
      if (onPointsEarned) onPointsEarned(result.points, result.newTotal);
    }
  };

  const allDone = checkpoints.every(cp => completed[cp.day]);

  return (
    <div className="space-y-0">
      <h3 className="font-bold text-lg text-[#151c22] mb-4 flex items-center gap-2">
        <I n="flag" s={{color:'#2d6a4f',fontSize:'20px'}}/>
        Checkpoints
      </h3>
      {checkpoints.map((cp, i) => {
        const done = !!completed[cp.day];
        const isNext = !done && checkpoints.slice(0, i).every(p => !!completed[p.day]);
        return (
          <div key={cp.day} className="checkpoint-item">
            <div className={`checkpoint-dot ${done ? 'done' : isNext ? 'active' : ''}`}>
              {done ? '✓' : cp.day}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-[#151c22]">Day {cp.day}</span>
                {done && <span className="text-xs text-[#2d6a4f] bg-[#e8f5e9] px-2 py-0.5 rounded-full">✅ Completed</span>}
                {isNext && <span className="text-xs text-white bg-[#2d6a4f] px-2 py-0.5 rounded-full">Current</span>}
              </div>
              <p className="text-sm text-[#404943] mt-0.5">{cp.instruction}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#f59e0b] font-semibold">+{cp.points} pts</span>
                {celebrating === cp.day && <span className="text-lg points-pop">⭐</span>}
              </div>
              {isNext && !done && (
                <button onClick={() => handleComplete(cp.day)}
                  className="mt-2 bg-[#2d6a4f] text-white text-sm px-4 py-2 rounded-full font-semibold hover:bg-[#1b4332] transition-colors">
                  Mark Complete ✓
                </button>
              )}
            </div>
          </div>
        );
      })}
      {allDone && (
        <div className="bg-[#e8f5e9] rounded-[16px] p-4 text-center mt-2">
          <span className="text-2xl">🎉</span>
          <p className="font-bold text-[#0f5238] mt-1">All checkpoints complete!</p>
          <p className="text-sm text-[#404943]">+100 bonus points for finishing the journey</p>
        </div>
      )}
    </div>
  );
}
