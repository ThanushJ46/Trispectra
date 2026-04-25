import React, { useState } from 'react';
import CheckpointTimeline from './CheckpointTimeline';
import VendorCards from './VendorCards';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function EwasteGuide({ items = [], guide, onPointsEarned }) {
  const [tab, setTab] = useState('sell');
  const eItems = items.filter(i => i.waste_category === 'e_waste');
  const options = guide?.options || [];
  const sellOption = options.find(o => o.id === 'sell');
  const dismantleOption = options.find(o => o.id === 'dismantle');

  return (
    <div className="space-y-5">
      {/* Detected items */}
      {eItems.length > 0 && (
        <div className="bg-[#f3e5f5] rounded-[16px] p-4">
          <p className="text-xs font-semibold text-[#6a1b9a] uppercase tracking-wider mb-1">Detected E-Waste Items</p>
          <p className="font-semibold text-[#151c22] capitalize">{eItems.map(i => i.item_name).join(', ')}</p>
        </div>
      )}

      <p className="text-sm text-[#404943] leading-relaxed">{guide?.summary}</p>

      {/* Sell / Dismantle tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('sell')} className={`tab-btn ${tab==='sell'?'active':''}`} style={tab==='sell'?{background:'#6a1b9a',borderColor:'#6a1b9a'}:{}}>💰 Sell Device</button>
        <button onClick={() => setTab('dismantle')} className={`tab-btn ${tab==='dismantle'?'active':''}`} style={tab==='dismantle'?{background:'#6a1b9a',borderColor:'#6a1b9a'}:{}}>🔧 Dismantle</button>
      </div>

      {/* SELL TAB */}
      {tab === 'sell' && sellOption && (
        <div className="space-y-4">
          <div className="bg-white rounded-[16px] p-4 border border-[#bfc9c1]/30">
            <h4 className="font-bold text-[#151c22] mb-2">{sellOption.title}</h4>
            <p className="text-xs text-[#404943] font-semibold mb-2">Best when:</p>
            <ul className="space-y-1 text-sm text-[#404943]">
              {sellOption.best_when.map((b, i) => <li key={i}>✅ {b}</li>)}
            </ul>
          </div>

          {/* Resale estimates */}
          <div>
            <h4 className="font-semibold text-sm text-[#151c22] mb-2 flex items-center gap-1">
              <I n="payments" s={{fontSize:'18px',color:'#6a1b9a'}}/> Estimated Resale Value
            </h4>
            <table className="val-table">
              <thead><tr><th>Device</th><th>Estimate</th></tr></thead>
              <tbody>
                {(sellOption.estimates || []).map((e, i) => (
                  <tr key={i}><td className="text-[#151c22] font-medium">{e.item}</td><td className="text-[#6a1b9a] font-semibold">{e.value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISMANTLE TAB */}
      {tab === 'dismantle' && dismantleOption && (
        <div className="space-y-4">
          {/* Warning */}
          <div className="warning-box">
            <I n="warning" s={{fontSize:'20px',flexShrink:0}}/>
            <p className="text-sm font-medium">{dismantleOption.warning}</p>
          </div>

          <div className="bg-white rounded-[16px] p-4 border border-[#bfc9c1]/30">
            <h4 className="font-bold text-[#151c22] mb-2">{dismantleOption.title}</h4>
            <p className="text-xs text-[#404943] font-semibold mb-2">Best when:</p>
            <ul className="space-y-1 text-sm text-[#404943]">
              {dismantleOption.best_when.map((b, i) => <li key={i}>• {b}</li>)}
            </ul>
          </div>

          {/* Part-wise valuation */}
          {dismantleOption.parts && dismantleOption.parts.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-[#151c22] mb-2 flex items-center gap-1">
                <I n="memory" s={{fontSize:'18px',color:'#6a1b9a'}}/> Part-wise Valuation
              </h4>
              <table className="val-table">
                <thead><tr><th>Part</th><th>Value</th></tr></thead>
                <tbody>
                  {dismantleOption.parts.map((p, i) => (
                    <tr key={i}><td className="text-[#151c22] font-medium">{p.name}</td><td className="text-[#6a1b9a] font-semibold">{p.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Dismantling steps */}
          <div>
            <h4 className="font-semibold text-sm text-[#151c22] mb-3 flex items-center gap-1"><I n="build" s={{fontSize:'18px',color:'#6a1b9a'}}/> Dismantling Steps</h4>
            <div className="space-y-2">
              {(dismantleOption.steps || []).map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-number" style={{background:'#f3e5f5',color:'#6a1b9a'}}>{i+1}</div>
                  <p className="text-sm text-[#404943]">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety warnings */}
          {dismantleOption.safety && (
            <div className="danger-box">
              <I n="shield" s={{fontSize:'20px',flexShrink:0}}/>
              <div>
                <p className="font-semibold text-sm mb-1">Safety Warnings</p>
                <ul className="space-y-0.5 text-sm">
                  {dismantleOption.safety.map((s, i) => <li key={i}>🚫 {s}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkpoints */}
      {guide?.checkpoints && (
        <CheckpointTimeline category="e_waste" checkpoints={guide.checkpoints} onPointsEarned={onPointsEarned}/>
      )}

      {/* Vendors */}
      <VendorCards category="e_waste" vendors={guide?.vendors} onPointsEarned={onPointsEarned}/>
    </div>
  );
}
