import React, { useState, useMemo } from 'react';
import { CATEGORY_META, CONFIDENCE_LABELS } from '../utils/guideData';
import { calculateScanPoints, awardScanPoints } from '../utils/pointsHelper';
import CorrectionPanel from './CorrectionPanel';
import CategoryGuideModal from './CategoryGuideModal';
import PointsBadges from './PointsBadges';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function ResultScreen({ onNav, result, user }) {
  const [items, setItems] = useState(result?.items || []);
  const [correcting, setCorrecting] = useState(false);
  const [guideCategory, setGuideCategory] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(() => {
    if (!result?.items?.length) return null;
    return awardScanPoints(result.items);
  });

  // No result / no items
  if (!result || !items || items.length === 0) {
    return (
      <div className="pt-20 px-5 pb-32 text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-[#f0f4f8] rounded-full flex items-center justify-center">
          <I n="search_off" s={{fontSize:'40px',color:'#9ca3af'}}/>
        </div>
        <h2 className="text-xl font-bold text-[#151c22]">No Waste Items Detected</h2>
        <p className="text-sm text-[#404943]">No trained waste items were found. Try a clearer image or add items manually.</p>
        <button onClick={() => onNav('scanner')} className="bg-[#2d6a4f] text-white px-6 py-3 rounded-full font-semibold">
          Try Again
        </button>
      </div>
    );
  }

  // Group items by category
  const grouped = useMemo(() => {
    const groups = {};
    items.forEach(item => {
      const cat = item.waste_category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);

  const categoryKeys = Object.keys(grouped);
  const lowConfItems = items.filter(i => i.confidence === 'low');
  const { total: scanPoints, breakdown } = calculateScanPoints(items);

  // Handle correction save
  const handleCorrectionSave = (editedItems) => {
    setItems(editedItems);
    setCorrecting(false);
    // Recalculate points with corrected items
    setPointsAwarded(awardScanPoints(editedItems));
  };

  return (
    <div className="pt-20 px-5 space-y-4 pb-32">
      {/* ─── 1. RESULT SUMMARY HEADER ─── */}
      <div className="anim">
        <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-[24px] p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <I n="check_circle" f s={{fontSize:'24px'}}/>
            <h2 className="font-bold text-xl">Analysis Complete</h2>
          </div>
          <p className="text-white/90 text-sm">
            {items.length} item{items.length !== 1 ? 's' : ''} detected across {categoryKeys.length} waste categor{categoryKeys.length !== 1 ? 'ies' : 'y'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold">
              ⭐ +{pointsAwarded?.total || scanPoints} points
            </span>
            {lowConfItems.length > 0 && (
              <span className="bg-[#ffcc80]/30 rounded-full px-3 py-1 text-xs font-semibold">
                ⚠️ {lowConfItems.length} low-confidence item{lowConfItems.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── 2. CATEGORY GROUP CARDS ─── */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-[#404943] uppercase tracking-wider anim d1">Categories Found</h3>
        {categoryKeys.map((cat, idx) => {
          const meta = CATEGORY_META[cat] || { icon: 'eco', label: cat.replace(/_/g,' '), color: '#404943', bg: '#f0f4f8', border: '#bfc9c1', action: 'Dispose properly', guideBtn: 'View Guide' };
          const catItems = grouped[cat];
          const catPoints = catItems.length * (cat === 'wet_organic' ? 8 : cat === 'e_waste' ? 12 : cat === 'hazardous' ? 15 : 5);

          return (
            <div key={cat} className={`category-card anim d${Math.min(idx+2, 6)}`} style={{'--accent': meta.border}}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: meta.bg}}>
                  <I n={meta.icon} s={{color: meta.color, fontSize:'22px'}}/>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#151c22]">{meta.label}</h4>
                  <p className="text-xs text-[#404943]">{catItems.length} item{catItems.length !== 1 ? 's' : ''} • +{catPoints} pts</p>
                </div>
                {catItems.some(i => i.is_hazardous) && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ Hazardous</span>
                )}
              </div>

              {/* Item list */}
              <div className="space-y-2 mb-3">
                {catItems.map((item, i) => {
                  const conf = CONFIDENCE_LABELS[item.confidence] || CONFIDENCE_LABELS.medium;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-[#f6f9ff] rounded-[12px] px-3 py-2">
                      <span className="font-medium text-sm text-[#151c22] capitalize flex-1">{item.item_name}</span>
                      <span className="conf-badge" style={{background: conf.bg, color: conf.color}}>{conf.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action summary */}
              <p className="text-sm text-[#404943] mb-3">{meta.action}</p>

              {/* Low confidence warnings */}
              {catItems.filter(i => i.confidence === 'low').map((item, i) => (
                <div key={i} className="warning-box mb-2" style={{padding:'10px 14px'}}>
                  <I n="help" s={{fontSize:'16px',flexShrink:0}}/>
                  <span className="text-xs">Please verify: <strong className="capitalize">{item.item_name}</strong></span>
                </div>
              ))}

              {/* Guide button */}
              <button onClick={() => setGuideCategory(cat)}
                className="w-full py-2.5 rounded-[14px] font-semibold text-sm border-2 transition-colors flex items-center justify-center gap-2"
                style={{borderColor: meta.color, color: meta.color, background: 'transparent'}}
                onMouseEnter={e => { e.currentTarget.style.background = meta.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <I n="menu_book" s={{fontSize:'18px'}}/> {meta.guideBtn}
              </button>
            </div>
          );
        })}
      </div>

      {/* ─── 3. CHOOSE A GUIDE PROMPT ─── */}
      <div className="text-center anim d4 py-2">
        <p className="text-sm text-[#404943] font-medium">Choose a category above to get your disposal manual</p>
      </div>

      {/* ─── 4. POINTS & BADGES ─── */}
      <div className="anim d4">
        <PointsBadges scanPoints={pointsAwarded?.total || scanPoints} scanBreakdown={pointsAwarded?.breakdown || breakdown}/>
      </div>

      {/* ─── 5. CORRECTION ─── */}
      <div className="anim d5">
        {correcting ? (
          <CorrectionPanel items={items} onSave={handleCorrectionSave} onCancel={() => setCorrecting(false)}/>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-[#404943]">Was this result correct?</p>
            <div className="flex gap-3 max-w-xs mx-auto">
              <button onClick={() => onNav('home')}
                className="flex-1 h-12 rounded-[20px] font-semibold bg-[#0f5238] text-white text-sm">
                ✓ Yes, looks good
              </button>
              <button onClick={() => setCorrecting(true)}
                className="flex-1 h-12 rounded-[20px] font-semibold bg-[#dce3ec] text-[#151c22] text-sm">
                ✏️ No, correct it
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── GUIDE MODAL ─── */}
      {guideCategory && (
        <CategoryGuideModal
          category={guideCategory}
          items={items}
          onClose={() => setGuideCategory(null)}
          onPointsEarned={(pts, total) => {
            setPointsAwarded(prev => prev ? { ...prev, total: (prev.total || 0) + pts } : { total: pts, breakdown: [] });
          }}
        />
      )}
    </div>
  );
}
