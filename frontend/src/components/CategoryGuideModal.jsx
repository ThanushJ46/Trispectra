import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { CATEGORY_META } from '../utils/guideData';
import CompostGuide from './CompostGuide';
import EwasteGuide from './EwasteGuide';
import RecyclingGuide from './RecyclingGuide';
import HazardousGuide from './HazardousGuide';
import CheckpointTimeline from './CheckpointTimeline';
import VendorCards from './VendorCards';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

// Generic fallback guide for medical/construction/sanitary
function GenericGuide({ items, guide, category, onPointsEarned }) {
  const catItems = items.filter(i => i.waste_category === category);
  const meta = CATEGORY_META[category] || {};
  return (
    <div className="space-y-5">
      {catItems.length > 0 && (
        <div className="bg-[#f0f4f8] rounded-[16px] p-4">
          <p className="text-xs font-semibold text-[#404943] uppercase tracking-wider mb-1">Detected Items</p>
          <p className="font-semibold text-[#151c22] capitalize">{catItems.map(i => i.item_name).join(', ')}</p>
        </div>
      )}
      <p className="text-sm text-[#404943] leading-relaxed">{guide?.summary}</p>
      {guide?.steps && (
        <div className="space-y-2">
          {guide.steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-number" style={{background:meta.bg||'#f0f4f8',color:meta.color||'#404943'}}>{i+1}</div>
              <p className="text-sm text-[#404943]">{s}</p>
            </div>
          ))}
        </div>
      )}
      {guide?.specifics && guide.specifics.map((sp, i) => (
        <div key={i} className="bg-white rounded-[14px] p-3 border border-[#bfc9c1]/30">
          <p className="font-semibold text-sm text-[#151c22] capitalize">{sp.item}</p>
          <ul className="mt-1 space-y-0.5">{sp.rules.map((r, j) => <li key={j} className="text-sm text-[#404943]">• {r}</li>)}</ul>
        </div>
      ))}
      {guide?.checkpoints && <CheckpointTimeline category={category} checkpoints={guide.checkpoints} onPointsEarned={onPointsEarned}/>}
      {guide?.vendors && guide.vendors.length > 0 && <VendorCards category={category} vendors={guide.vendors} onPointsEarned={onPointsEarned}/>}
    </div>
  );
}

export default function CategoryGuideModal({ category, items = [], onClose, onPointsEarned }) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const meta = CATEGORY_META[category] || { icon: 'eco', label: category, color: '#404943', bg: '#f0f4f8' };

  useEffect(() => {
    setLoading(true);
    apiRequest(`/api/guides/category/${category}`)
      .then(d => setGuide(d))
      .catch(() => setGuide({ summary: `Safely dispose ${category.replace(/_/g,' ')} waste. Contact local municipal services.`, steps: ['Separate from other waste','Pack securely','Contact municipal corporation'] }))
      .finally(() => setLoading(false));
  }, [category]);

  const renderGuide = () => {
    if (loading) return <div className="text-center py-8 text-[#404943]"><div className="w-6 h-6 border-2 border-[#2d6a4f] border-t-transparent rounded-full mx-auto mb-2" style={{animation:'spin 1s linear infinite'}}/> Loading guide...</div>;
    if (!guide) return <p className="text-center py-8 text-[#404943]">Guide not available.</p>;

    switch (category) {
      case 'wet_organic': return <CompostGuide items={items} guide={guide} onPointsEarned={onPointsEarned}/>;
      case 'e_waste': return <EwasteGuide items={items} guide={guide} onPointsEarned={onPointsEarned}/>;
      case 'dry_recyclable': return <RecyclingGuide items={items} guide={guide} onPointsEarned={onPointsEarned}/>;
      case 'hazardous': return <HazardousGuide items={items} guide={guide} onPointsEarned={onPointsEarned}/>;
      default: return <GenericGuide items={items} guide={guide} category={category} onPointsEarned={onPointsEarned}/>;
    }
  };

  return (
    <div className="guide-modal-backdrop" onClick={onClose}>
      <div className="guide-modal" onClick={e => e.stopPropagation()}>
        <div className="guide-modal-header">
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <I n="close" s={{fontSize:'22px',color:'#404943'}}/>
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: meta.bg}}>
            <I n={meta.icon} s={{fontSize:'18px',color: meta.color}}/>
          </div>
          <h2 className="font-bold text-base text-[#151c22] flex-1">{meta.label} Guide</h2>
        </div>
        <div className="guide-modal-body">
          {renderGuide()}
        </div>
      </div>
    </div>
  );
}
