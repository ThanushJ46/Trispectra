import React, { useState } from 'react';

// Reusable icon component (similar to App.jsx)
function I({ n, f, c = '', s = {} }) {
  return <span className={`mi ${f ? 'mi-fill' : ''} ${c}`} style={s}>{n}</span>;
}

export default function StoreScreen({ userStats }) {
  const [tab, setTab] = useState('products');
  const [localPoints, setLocalPoints] = useState(userStats?.total_points || 2500);
  const [history, setHistory] = useState([
    { id: 1, type: 'earn', title: 'Recycled 2 PET Bottles', pts: 40, date: 'Today' },
    { id: 2, type: 'earn', title: 'Compost Checkpoint Reached', pts: 100, date: 'Yesterday' },
    { id: 3, type: 'spend', title: 'Redeemed 10% Off Coupon', pts: -500, date: '3 days ago' },
  ]);
  const [toast, setToast] = useState('');

  const products = [
    { id: 'p1', name: 'Bamboo Toothbrush', desc: '100% biodegradable handle', pts: 150, icon: 'brush', color: '#2d6a4f' },
    { id: 'p2', name: 'Eco Phone Cover', desc: 'Made from ocean plastic', pts: 800, icon: 'smartphone', color: '#1f5eac' },
    { id: 'p3', name: 'Recycled Shoes', desc: 'Stylish & sustainable footprint', pts: 2500, icon: 'steps', color: '#e8a020' },
    { id: 'p4', name: 'Zero-Waste Book', desc: 'Guide to sustainable living', pts: 600, icon: 'menu_book', color: '#7e22ce' },
    { id: 'p5', name: 'Bamboo Specs', desc: 'UV400 polarized wooden frame', pts: 1200, icon: 'visibility', color: '#0f5238' },
  ];

  const coupons = [
    { id: 'c1', name: '10% Off Organic Store', desc: 'Valid on all grocery items', pts: 300 },
    { id: 'c2', name: '$5 Off EcoWear', desc: 'Sustainable fashion apparel', pts: 500 },
    { id: 'c3', name: 'Free Coffee @ GreenCafe', desc: 'Bring your own cup!', pts: 200 },
  ];

  const handleBuy = (item) => {
    if (localPoints >= item.pts) {
      setLocalPoints(prev => prev - item.pts);
      setHistory(prev => [{
        id: Date.now(),
        type: 'spend',
        title: `Purchased: ${item.name}`,
        pts: -item.pts,
        date: 'Just now'
      }, ...prev]);
      showToast(`Successfully purchased ${item.name}!`);
    } else {
      showToast(`Not enough points for ${item.name}. Keep recycling!`);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="pt-20 px-5 pb-[100px] space-y-4">
      {/* Points Header */}
      <div className="rounded-[24px] p-6 anim" style={{ background: 'linear-gradient(135deg, #2d6a4f 0%, #1e3a2e 100%)', boxShadow: '0 8px 24px rgba(45,106,79,0.3)' }}>
        <p style={{ color: 'rgba(255,255,255,0.8)' }} className="text-sm font-medium">Available Balance</p>
        <div className="flex items-center gap-3 mt-2">
          <I n="stars" s={{ color: '#fbbf24', fontSize: '36px' }} />
          <span className="text-5xl font-black" style={{ color: '#fff' }}>{localPoints.toLocaleString()}</span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>pts</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-xs mt-3">Earn more points by recycling correctly! ♻️</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-full p-1 border border-[#bfc9c1]/50 shadow-sm anim d1">
        {['products', 'coupons', 'history'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-full capitalize transition-colors ${
              tab === t ? 'bg-[#2d6a4f] text-white' : 'text-[#404943] hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="space-y-4 anim d2">
          {products.map((p, i) => (
            <div key={p.id} className="card-s flex items-center gap-4" style={{ animationDelay: `${100 + i * 50}ms` }}>
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center shadow-sm" style={{ backgroundColor: `${p.color}15` }}>
                <I n={p.icon} s={{ fontSize: '28px', color: p.color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#151c22] leading-tight">{p.name}</h3>
                <p className="text-xs text-[#404943] mt-0.5">{p.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold text-[#e8a020] text-sm">{p.pts} pts</span>
                  <button 
                    onClick={() => handleBuy(p)}
                    className="bg-[#e8f5e9] text-[#2d6a4f] px-3 py-1.5 rounded-full text-xs font-bold border border-[#2d6a4f]/20 hover:bg-[#2d6a4f] hover:text-white transition-colors"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupons Tab */}
      {tab === 'coupons' && (
        <div className="space-y-4 anim d2">
          {coupons.map((c, i) => (
            <div key={c.id} className="relative overflow-hidden bg-white rounded-[20px] p-5 border border-dashed border-[#2d6a4f]/50 shadow-sm" style={{ animationDelay: `${100 + i * 50}ms` }}>
              {/* Scissors decoration */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f0f4f8] rounded-full border border-dashed border-[#2d6a4f]/50"></div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f0f4f8] rounded-full border border-dashed border-[#2d6a4f]/50"></div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-[#151c22] text-lg">{c.name}</h3>
                  <p className="text-sm text-[#404943]">{c.desc}</p>
                </div>
                <I n="local_offer" s={{ color: '#2d6a4f' }} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold text-[#e8a020]">{c.pts} pts</span>
                <button 
                  onClick={() => handleBuy(c)}
                  className="bg-[#2d6a4f] text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-[#2d6a4f]/20 hover:scale-105 transition-transform"
                >
                  Get Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="card anim d2">
          <h3 className="font-bold text-[#151c22] mb-4 text-lg">Points History</h3>
          <div className="space-y-4 relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200"></div>
            
            {history.map((h, i) => (
              <div key={h.id} className="flex items-start gap-4 relative z-10" style={{ animationDelay: `${100 + i * 50}ms` }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 border-white flex-shrink-0 ${h.type === 'earn' ? 'bg-[#e8f5e9]' : 'bg-[#ffebee]'}`}>
                  <I n={h.type === 'earn' ? 'arrow_upward' : 'arrow_downward'} s={{ fontSize: '20px', color: h.type === 'earn' ? '#2d6a4f' : '#c62828' }} />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-sm text-[#151c22] leading-tight">{h.title}</p>
                  <p className="text-xs text-[#9ca3af] mt-0.5">{h.date}</p>
                </div>
                <div className="pt-1 text-right">
                  <span className={`font-bold text-sm ${h.type === 'earn' ? 'text-[#2d6a4f]' : 'text-[#c62828]'}`}>
                    {h.type === 'earn' ? '+' : ''}{h.pts}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#151c22] text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl z-50 whitespace-nowrap anim d1">
          {toast}
        </div>
      )}
    </div>
  );
}
