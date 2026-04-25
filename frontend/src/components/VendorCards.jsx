import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { awardPoints } from '../utils/pointsHelper';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

export default function VendorCards({ category, vendors: propVendors, onPointsEarned }) {
  const [vendors, setVendors] = useState(propVendors || []);
  const [loading, setLoading] = useState(!propVendors);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (propVendors && propVendors.length > 0) return;
    setLoading(true);
    apiRequest(`/api/vendors?category=${category}`)
      .then(d => setVendors(d.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [category]);

  const handleSelect = (vendor) => {
    setSelected(vendor.name);
    const pts = awardPoints(20, `vendor_selected_${category}`);
    if (onPointsEarned) onPointsEarned(20, pts);
  };

  if (loading) return <div className="text-center py-4 text-[#404943] text-sm">Loading vendors...</div>;
  if (vendors.length === 0) return <div className="text-center py-4 text-[#404943] text-sm">No vendors found for this category.</div>;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg text-[#151c22] flex items-center gap-2">
        <I n="store" s={{color:'#1565c0',fontSize:'20px'}}/>
        Nearby Collection Points
      </h3>
      {vendors.map((v, i) => (
        <div key={i} className={`vendor-card ${selected === v.name ? 'ring-2 ring-[#2d6a4f]' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-[#151c22] text-sm">{v.name}</h4>
              <p className="text-xs text-[#404943] mt-0.5">{v.address || ''}</p>
              {v.distance && <p className="text-xs text-[#1565c0] mt-0.5">📍 {v.distance}</p>}
            </div>
            {v.offers_pickup && (
              <span className="text-xs bg-[#e8f5e9] text-[#0f5238] px-2 py-0.5 rounded-full">Pickup</span>
            )}
          </div>
          {v.accepts && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(Array.isArray(v.accepts) ? v.accepts : [v.accepts]).slice(0, 4).map(a => (
                <span key={a} className="text-[10px] bg-[#f0f4f8] text-[#404943] px-2 py-0.5 rounded-full">{a}</span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {v.phone && (
              <a href={`tel:${v.phone}`} className="flex-1 bg-[#2d6a4f] text-white text-sm py-2 rounded-full text-center font-semibold flex items-center justify-center gap-1">
                <I n="call" s={{fontSize:'16px'}}/> Call
              </a>
            )}
            <button onClick={() => handleSelect(v)}
              className={`flex-1 text-sm py-2 rounded-full text-center font-semibold border transition-colors
                ${selected === v.name ? 'bg-[#e8f5e9] text-[#0f5238] border-[#2d6a4f]' : 'bg-white text-[#404943] border-[#bfc9c1]/50 hover:bg-[#f0fdf4]'}`}>
              {selected === v.name ? '✓ Selected' : 'Select'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
