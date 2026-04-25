import React from 'react';
import CheckpointTimeline from './CheckpointTimeline';
import VendorCards from './VendorCards';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function HazardousGuide({ items = [], guide, onPointsEarned }) {
  const hazItems = items.filter(i => i.waste_category === 'hazardous');

  return (
    <div className="space-y-5">
      {/* Warning banner */}
      <div className="danger-box">
        <I n="dangerous" s={{fontSize:'24px',flexShrink:0}}/>
        <div>
          <p className="font-bold text-base mb-1">⚠️ Hazardous Waste Detected</p>
          <p className="text-sm">{guide?.warning || guide?.summary}</p>
        </div>
      </div>

      {hazItems.length > 0 && (
        <div className="bg-[#fff3e0] rounded-[16px] p-4">
          <p className="text-xs font-semibold text-[#e65100] uppercase tracking-wider mb-1">Detected Hazardous Items</p>
          <p className="font-semibold text-[#151c22] capitalize">{hazItems.map(i => i.item_name).join(', ')}</p>
        </div>
      )}

      {/* Safety steps */}
      <div>
        <h4 className="font-semibold text-sm text-[#151c22] mb-3 flex items-center gap-1">
          <I n="health_and_safety" s={{fontSize:'18px',color:'#e65100'}}/> Safety Steps
        </h4>
        <div className="space-y-2">
          {(guide?.steps || []).map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-number" style={{background:'#fff3e0',color:'#e65100'}}>{i+1}</div>
              <p className="text-sm text-[#404943]">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Item-specific rules */}
      {guide?.specifics && guide.specifics.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-[#151c22] mb-3 flex items-center gap-1">
            <I n="rule" s={{fontSize:'18px',color:'#e65100'}}/> Item-Specific Handling
          </h4>
          <div className="space-y-2">
            {guide.specifics.map((sp, i) => (
              <div key={i} className="bg-white rounded-[14px] p-3 border border-[#ffcc80]/60">
                <p className="font-semibold text-sm text-[#151c22] capitalize">{sp.item}</p>
                <ul className="mt-1 space-y-0.5">
                  {sp.rules.map((r, j) => (
                    <li key={j} className="text-sm text-[#404943] flex items-start gap-1">
                      <span className="text-[#e65100]">⚠️</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {guide?.checkpoints && (
        <CheckpointTimeline category="hazardous" checkpoints={guide.checkpoints} onPointsEarned={onPointsEarned}/>
      )}

      <VendorCards category="hazardous" vendors={guide?.vendors} onPointsEarned={onPointsEarned}/>
    </div>
  );
}
