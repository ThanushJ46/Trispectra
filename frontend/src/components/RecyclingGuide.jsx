import React from 'react';
import CheckpointTimeline from './CheckpointTimeline';
import VendorCards from './VendorCards';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function RecyclingGuide({ items = [], guide, onPointsEarned }) {
  const dryItems = items.filter(i => i.waste_category === 'dry_recyclable');

  return (
    <div className="space-y-5">
      {dryItems.length > 0 && (
        <div className="bg-[#e3f2fd] rounded-[16px] p-4">
          <p className="text-xs font-semibold text-[#1565c0] uppercase tracking-wider mb-1">Detected Recyclable Items</p>
          <p className="font-semibold text-[#151c22] capitalize">{dryItems.map(i => i.item_name).join(', ')}</p>
        </div>
      )}

      <p className="text-sm text-[#404943] leading-relaxed">{guide?.summary}</p>

      {/* Steps */}
      <div>
        <h4 className="font-semibold text-sm text-[#151c22] mb-3 flex items-center gap-1">
          <I n="checklist" s={{fontSize:'18px',color:'#1565c0'}}/> Preparation Steps
        </h4>
        <div className="space-y-2">
          {(guide?.steps || []).map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-number" style={{background:'#e3f2fd',color:'#1565c0'}}>{i+1}</div>
              <p className="text-sm text-[#404943]">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Item-specific rules */}
      {guide?.specifics && guide.specifics.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-[#151c22] mb-3 flex items-center gap-1">
            <I n="category" s={{fontSize:'18px',color:'#1565c0'}}/> Item-Specific Rules
          </h4>
          <div className="space-y-2">
            {guide.specifics.map((sp, i) => (
              <div key={i} className="bg-white rounded-[14px] p-3 border border-[#bfc9c1]/30">
                <p className="font-semibold text-sm text-[#151c22] capitalize">{sp.item}</p>
                <ul className="mt-1 space-y-0.5">
                  {sp.rules.map((r, j) => (
                    <li key={j} className="text-sm text-[#404943] flex items-start gap-1">
                      <span className="text-[#1565c0]">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {guide?.checkpoints && (
        <CheckpointTimeline category="dry_recyclable" checkpoints={guide.checkpoints} onPointsEarned={onPointsEarned}/>
      )}

      <VendorCards category="dry_recyclable" vendors={guide?.vendors} onPointsEarned={onPointsEarned}/>
    </div>
  );
}
