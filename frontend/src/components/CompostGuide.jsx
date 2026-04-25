import React, { useState } from 'react';
import CheckpointTimeline from './CheckpointTimeline';
import VendorCards from './VendorCards';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function CompostGuide({ items = [], guide, onPointsEarned }) {
  const [tab, setTab] = useState('city');
  const organicItems = items.filter(i => i.waste_category === 'wet_organic');
  const cases = guide?.cases || [];
  const activeCase = cases.find(c => c.id === tab) || cases[0];

  return (
    <div className="space-y-5">
      {/* Detected items */}
      {organicItems.length > 0 && (
        <div className="bg-[#e8f5e9] rounded-[16px] p-4">
          <p className="text-xs font-semibold text-[#0f5238] uppercase tracking-wider mb-1">Detected Organic Items</p>
          <p className="font-semibold text-[#151c22] capitalize">{organicItems.map(i => i.item_name).join(', ')}</p>
        </div>
      )}

      {/* Summary */}
      <p className="text-sm text-[#404943] leading-relaxed">{guide?.summary}</p>

      {/* City / Village tabs */}
      {cases.length > 1 && (
        <div className="flex gap-2">
          <button onClick={() => setTab('city')} className={`tab-btn ${tab==='city'?'active':''}`}>🏙️ City / Apartment</button>
          <button onClick={() => setTab('village')} className={`tab-btn ${tab==='village'?'active':''}`}>🌿 Village / Open Land</button>
        </div>
      )}

      {activeCase && (
        <div className="space-y-4">
          <div className="bg-white rounded-[16px] p-4 border border-[#bfc9c1]/30">
            <h4 className="font-bold text-[#151c22] mb-1">{activeCase.title}</h4>
            <p className="text-sm text-[#404943]">{activeCase.explain}</p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-sm text-[#151c22] mb-2 flex items-center gap-1"><I n="handyman" s={{fontSize:'18px',color:'#2d6a4f'}}/> What You Need</h4>
            <div className="space-y-1.5">
              {(activeCase.tools || []).map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[#404943]">
                  <span className="text-[#2d6a4f] mt-0.5">•</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h4 className="font-semibold text-sm text-[#151c22] mb-3 flex items-center gap-1"><I n="list_alt" s={{fontSize:'18px',color:'#2d6a4f'}}/> Step by Step</h4>
            <div className="space-y-2">
              {(activeCase.steps || []).map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-number" style={{background:'#e8f5e9',color:'#2d6a4f'}}>{i+1}</div>
                  <div>
                    <p className="font-semibold text-sm text-[#151c22]">{s.day}</p>
                    <p className="text-sm text-[#404943] mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {activeCase.tips && (
            <div className="warning-box" style={{background:'#f0fdf4',borderColor:'#a7f3d0',color:'#0f5238'}}>
              <I n="tips_and_updates" s={{fontSize:'20px',flexShrink:0}}/>
              <div>
                <p className="font-semibold text-sm mb-1">Tips</p>
                <ul className="space-y-0.5 text-sm">
                  {activeCase.tips.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Importance of manure */}
      {guide?.importance && (
        <div className="bg-white rounded-[16px] p-4 border border-[#bfc9c1]/30 space-y-3">
          <h4 className="font-bold text-[#151c22]">{guide.importance.title}</h4>
          <ul className="space-y-1 text-sm text-[#404943]">
            {guide.importance.points.map((p, i) => <li key={i}>🌱 {p}</li>)}
          </ul>
          <p className="font-semibold text-sm text-[#151c22] mt-2">Where to use manure:</p>
          <div className="flex flex-wrap gap-1.5">
            {guide.importance.uses.map((u, i) => (
              <span key={i} className="text-xs bg-[#e8f5e9] text-[#0f5238] px-2 py-1 rounded-full">{u}</span>
            ))}
          </div>
        </div>
      )}

      {/* Checkpoints */}
      {guide?.checkpoints && (
        <CheckpointTimeline category="wet_organic" checkpoints={guide.checkpoints} onPointsEarned={onPointsEarned}/>
      )}

      {/* Vendors */}
      <VendorCards category="organic" vendors={guide?.vendors} onPointsEarned={onPointsEarned}/>
    </div>
  );
}
