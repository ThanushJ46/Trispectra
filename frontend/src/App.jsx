import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fbAuth, GoogleAuthProvider, signInWithPopup, firebaseEnabled } from './firebase.js';
import { apiRequest } from './utils/api.js';
import NewResultScreen from './components/ResultScreen.jsx';
import StoreScreen from './components/StoreScreen.jsx';






const T={en:{g:"Good morning, Alex.",t:"You're making a difference today.",r:"Ready to sort?",s:"Scan your next item.",d:"Daily Progress"},hi:{g:"सुप्रभात, एलेक्स।",t:"आज आप बदलाव ला रहे हैं।",r:"छांटने के लिए तैयार?",s:"अगला आइटम स्कैन करें।",d:"दैनिक प्रगति"},kn:{g:"ಶುಭೋದಯ, ಅಲೆಕ್ಸ್.",t:"ನೀವು ಇಂದು ಬದಲಾವಣೆ ಮಾಡುತ್ತಿದ್ದೀರಿ.",r:"ವಿಂಗಡಿಸಲು ಸಿದ್ಧರೆ?",s:"ನಿಮ್ಮ ಮುಂದಿನ ವಸ್ತುವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",d:"ದೈನಂದಿನ ಪ್ರಗತಿ"}};
const botReply=(m)=>{const l=m.toLowerCase();if(l.includes('compost'))return"Great question! For effective composting, maintain a ratio of 3 parts brown material to 1 part green. Turn your pile every 3-7 days for faster decomposition. 🌱";if(l.includes('ewaste')||l.includes('e-waste'))return"For e-waste, I recommend checking your local municipal collection drive. Items like phones and laptops contain valuable metals that can be recovered. ♻️";if(l.includes('plastic'))return"Great initiative! For plastic reduction, start with single-use items. Carry a reusable bag and bottle. WasteWise can help you find recycling points nearby. 💪";return"That's a great question! Proper waste disposal can reduce landfill waste by up to 60%. Keep tracking your progress — every item counts! 🌍";};
function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}
function TopBar({screen,onBack,onNav,onLogout}){
  const bg = 'bg-[#2d6a4f]';
  const text = 'text-white';
  const safePadding = { paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: '16px' };
  
  if(screen==='upload-preview')return(<div className={`w-full flex items-center px-5 z-30 ${bg}`} style={safePadding}><button onClick={onBack} className={`w-10 h-10 flex items-center justify-center ${text}`}><I n="arrow_back"/></button><span className={`flex-1 text-center font-semibold text-lg ${text}`}>Review Image</span><div className="w-10"/></div>);
  if(screen==='result')return(<div className={`w-full flex items-center px-5 z-30 ${bg}`} style={safePadding}><button onClick={onBack} className={`w-10 h-10 flex items-center justify-center ${text}`}><I n="arrow_back"/></button><span className={`flex-1 text-center font-bold text-lg ${text}`}>WasteWise</span><div className="w-10"/></div>);
  if(screen==='store')return(<div className={`w-full flex items-center px-5 z-30 ${bg}`} style={safePadding}><button onClick={onBack} className={`w-10 h-10 flex items-center justify-center ${text}`}><I n="arrow_back"/></button><span className={`flex-1 text-center font-bold text-lg ${text}`}>Rewards Store</span><div className="w-10"/></div>);
  if(screen==='leaderboard')return(<div className={`w-full flex items-center px-5 z-30 ${bg}`} style={safePadding}><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2d6a4f] text-xs font-bold">A</div><span className={`flex-1 text-center font-semibold text-lg ${text}`}>Leaderboard</span><button className={`w-10 h-10 flex items-center justify-center ${text}`}><I n="notifications"/></button></div>);
  
  return(<div className={`w-full flex items-center justify-between px-5 z-30 ${bg}`} style={safePadding}><div className="flex items-center gap-2" onClick={onLogout} title="Click to Logout"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2d6a4f] text-xs font-bold cursor-pointer hover:scale-110 transition-transform">A</div><span className={`font-black text-2xl tracking-tighter ${text}`}>WasteWise</span></div><div className="flex items-center gap-1"><button onClick={()=>onNav&&onNav('store')} className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors ${text}`}><I n="local_mall" s={{fontSize:'22px'}}/></button><button className={`w-10 h-10 flex items-center justify-center ${text}`}><I n="notifications"/></button></div></div>);
}
function BottomNav({active,onNav}){
  const { t } = useTranslation();
const items=[{id:'home',i:'home',l:t('nav.home')},{id:'vendors',i:'store',l:t('nav.vendors')},{id:'scanner',i:'center_focus_strong',l:t('nav.scan')},{id:'journey',i:'bar_chart',l:t('nav.impact')},{id:'leaderboard',i:'leaderboard',l:t('nav.board')}];
return(
<div className="absolute bottom-0 left-0 right-0 z-30" style={{padding:'0 8px 10px'}}>
<div style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderRadius:26,border:'1px solid rgba(191,201,193,0.35)',boxShadow:'0 8px 32px rgba(0,0,0,0.08)'}} className="flex items-center justify-around py-2 px-1">
{items.map(it=>{
const isActive=active===it.id;
const isScan=it.id==='scanner';
return(
<button key={it.id} onClick={()=>onNav(it.id)} className="flex flex-col items-center relative" style={{flex:1,minWidth:0,transition:'all .3s cubic-bezier(.34,1.56,.64,1)',transform:isActive?'scale(1.08)':'scale(1)'}}>
{isScan?(
<div style={{width:52,height:52,borderRadius:16,background:isActive?'linear-gradient(135deg,#2d6a4f,#40916c)':'rgba(45,106,79,0.1)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:isActive?'0 4px 16px rgba(45,106,79,0.35)':'none',transition:'all .3s ease',transform:isActive?'translateY(-8px)':'translateY(0)'}}>
{isActive&&<div style={{position:'absolute',inset:-4,borderRadius:20,border:'2px solid rgba(45,106,79,0.25)',animation:'navPulse 2s ease-in-out infinite'}}/>}
<I n={it.i} f={isActive} s={{color:isActive?'#fff':'#2d6a4f',fontSize:'26px'}}/>
</div>
):(
<>
{isActive&&<div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:44,height:36,borderRadius:12,background:'rgba(45,106,79,0.1)',animation:'navPillIn .3s ease'}}/>}
<div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 0'}}>
<I n={it.i} f={isActive} s={{color:isActive?'#2d6a4f':'#9ca3af',fontSize:'22px',transition:'color .3s ease'}}/>
<span style={{fontSize:10,fontWeight:isActive?700:500,color:isActive?'#2d6a4f':'#9ca3af',transition:'all .3s ease',letterSpacing:'0.02em'}}>{it.l}</span>
</div>
{isActive&&<div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:5,height:5,borderRadius:'50%',background:'#2d6a4f',animation:'navDotIn .3s ease',boxShadow:'0 0 6px rgba(45,106,79,0.4)'}}/>}
</>
)}
</button>
);
})}
</div>
</div>
);
}
function ChatModal({ open, onClose }) {
  const { t } = useTranslation();
  const [msgs, setMsgs] = useState([{ f: 'b', t: t('chat.welcome') }]);
  const [inp, setInp] = useState(''); const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [msgs]);
  
  const botReply = (m) => {
    const l = m.toLowerCase();
    if (l.includes('compost') || l.includes('खाद') || l.includes('ಗೊಬ್ಬರ')) return t('chat.reply_compost');
    if (l.includes('ewaste') || l.includes('e-waste') || l.includes('ई-कचरा') || l.includes('ತ್ಯಾಜ್ಯ')) return t('chat.reply_ewaste');
    if (l.includes('plastic') || l.includes('प्लास्टिक') || l.includes('ಪ್ಲಾಸ್ಟಿಕ್')) return t('chat.reply_plastic');
    return t('chat.reply_default');
  };

  const send = (x) => { const txt = x || inp; if (!txt.trim()) return; setMsgs(p => [...p, { f: 'u', t: txt }]); setInp(''); setTimeout(() => setMsgs(p => [...p, { f: 'b', t: botReply(txt) }]), 800); };
  if (!open) return null;
  return (<div className="absolute inset-0 z-50 flex items-end" onClick={onClose}><div className="absolute inset-0 bg-black/40" />
    <div className="relative bg-white rounded-t-[32px] p-6 w-full flex flex-col" style={{ maxHeight: '70%' }} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-xl">{t('chat.title')}</h2><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><I n="close" /></button></div>
      <div ref={ref} className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ minHeight: 200 }}>
        {msgs.map((m, i) => (<div key={i} className={`max-w-[85%] p-3 text-sm ${m.f === 'b' ? 'bg-[#e8f5e9] rounded-[16px] rounded-tl-sm text-[#151c22]' : 'bg-[#2d6a4f] text-white rounded-[16px] rounded-tr-sm ml-auto'}`}>{m.t}</div>))}
      </div>
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">{t('chat.tips', { returnObjects: true }).map(c => (<button key={c} onClick={() => send(c)} className="whitespace-nowrap bg-[#e8eef7] text-[#404943] text-xs px-3 py-2 rounded-full border border-[#bfc9c1]/50">{c}</button>))}</div>
      <div className="flex gap-2"><input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t('chat.placeholder')} className="flex-1 bg-[#f6f9ff] rounded-[20px] border border-[#bfc9c1] px-4 py-3 text-sm outline-none" /><button onClick={() => send()} className="bg-[#2d6a4f] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"><I n="send" s={{ fontSize: '18px' }} /></button></div>
    </div></div>);
}

function LoginScreen({ onLogin }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signInWithGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(fbAuth, provider);
    } catch (e) {
      setError(`Google login unavailable: ${e.message}`);
      setLoading(false);
    }
  };

  const continueAsDemo = () => {
    let demoId = localStorage.getItem('wastewise-persistent-demo-id');
    if (!demoId) {
      demoId = `demo-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('wastewise-persistent-demo-id', demoId);
    }
    const demoUser = {
      uid: demoId,
      displayName: 'Guest Explorer',
      email: 'demo@wastewise.local',
      photoURL: null,
      isDemo: true
    };
    localStorage.setItem('wastewise-demo-user', JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between py-16 px-8 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #132a13 0%, #2d6a4f 100%)', borderRadius: 'inherit' }}>
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center mt-8 z-10">
        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center text-5xl shadow-2xl mb-6">🌱</div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">WasteWise</h1>
        <p className="text-green-100/60 text-sm font-medium tracking-wide uppercase">AI Waste Detection</p>
      </div>

      <div className="w-full z-10 space-y-4">
        <div className="text-center mb-8">
          <h2 className="text-white font-bold text-xl">{t('login.welcome')}</h2>
          <p className="text-white/50 text-xs mt-1">{t('login.join_msg')}</p>
        </div>

        {firebaseEnabled ? (
          <button onClick={signInWithGoogle} disabled={loading}
            className="group relative bg-white text-[#151c22] rounded-[24px] w-full h-16 font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-4 text-center">
            <p className="text-white/60 text-xs">{t('login.disabled_msg')}</p>
          </div>
        )}

        <button onClick={continueAsDemo} disabled={loading}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[24px] w-full h-16 font-bold text-base flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
          Start as Guest
        </button>
      </div>
      {error && <p className="text-red-300 text-[10px] mt-4 text-center z-10">{error}</p>}
    </div>
  );
}
function VendorsScreen() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest('/api/vendors/categories')
      .then(d => setCategories(d.categories || []))
      .catch(console.error);
  }, []);

  const loadVendors = async (cat) => {
    setSelected(cat);
    setLoading(true);
    try {
      const d = await apiRequest(`/api/vendors?category=${cat}`);
      setVendors(d.vendors || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="pt-20 px-5 pb-[100px]">
      <h1 className="text-2xl font-bold text-[#151c22] mb-4">{t('vendors.title')}</h1>

      {/* Mock Map Section */}
      <div className="relative w-full h-48 rounded-[24px] overflow-hidden mb-5 border border-[#bfc9c1]/40 bg-[#e8eef7]">
        {/* Simple CSS pattern to look like a map grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(#2d6a4f 1px, transparent 1px), linear-gradient(90deg, #2d6a4f 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        {/* Map UI Elements */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#2d6a4f] shadow-sm">
          📍 3 {t('vendors.vendors_nearby')}
        </div>
        {/* Mock Pins */}
        <div className="absolute top-[30%] left-[20%] text-2xl" style={{ animation: 'bounce 2s infinite' }}>📍</div>
        <div className="absolute top-[50%] left-[60%] text-2xl" style={{ animation: 'bounce 2.2s infinite' }}>📍</div>
        <div className="absolute top-[70%] left-[30%] text-2xl" style={{ animation: 'bounce 1.8s infinite' }}>📍</div>

        {/* User Location */}
        <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-[#1f5eac] rounded-full border-2 border-white shadow-md relative">
            <div className="absolute inset-0 bg-[#1f5eac] rounded-full animate-ping opacity-50"></div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map(c => (
          <button key={c.name} onClick={() => loadVendors(c.name)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-colors
              ${selected === c.name
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                : 'bg-white text-[#404943] border-[#bfc9c1]/50'}`}>
            {c.name.replace(/_/g, ' ')} ({c.vendor_count})
          </button>
        ))}
      </div>
      {loading && <div className="text-center py-8 text-[#404943]">{t('vendors.loading')}</div>}
      <div className="space-y-3">
        {vendors.map((v, i) => (
          <div key={i} className="card">
            <h3 className="font-semibold text-[#151c22]">{v.name}</h3>
            <p className="text-sm text-[#404943] mt-1">{v.address}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(v.categories || []).map(c => (
                <span key={c} className="text-xs bg-[#e8f5e9] text-[#0f5238] px-2 py-0.5 rounded-full">
                  {c.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {v.phone && (
                <a href={`tel:${v.phone}`}
                  className="mt-3 inline-flex items-center gap-2 bg-[#2d6a4f] text-white text-sm px-4 py-2 rounded-full">
                  {t('vendors.call_now')}
                </a>
              )}
              {v.address && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + ' ' + v.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 bg-white border border-[#2d6a4f] text-[#2d6a4f] text-sm px-4 py-2 rounded-full">
                  {t('vendors.directions')}
                </a>
              )}
            </div>
          </div>
        ))}
        {!loading && selected && vendors.length === 0 && (
          <p className="text-center text-[#404943] py-8">{t('vendors.no_vendors')}</p>
        )}
      </div>
    </div>
  );
}
function HomeScreen({ onNav, user, userStats }) {
  const { t, i18n } = useTranslation();
  
  const displayName = user?.displayName?.split(' ')[0] || 'Friend';
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const points = userStats?.total_points || 0;
  const kgDiverted = userStats?.kg_diverted || 0;
  const streak = userStats?.streak_days || 0;
  const treesEquiv = userStats?.trees_equivalent || 0;
  const bottlesRescued = userStats?.bottles_rescued || 0;
  const itemsDisposed = userStats?.items_disposed || 0;

  return (
    <div className="pt-20 px-5 pb-[100px] space-y-4 max-w-md mx-auto">
      <div className="flex justify-between items-start mb-1 anim">
        <button onClick={() => {
          localStorage.removeItem('wastewise-demo-user');
          if (fbAuth) fbAuth.signOut();
          window.location.reload();
        }} className="w-10 h-10 rounded-full bg-white border border-[#bfc9c1]/50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
          <I n="logout" s={{ fontSize: '18px' }} />
        </button>
        <div className="flex bg-white rounded-full border border-[#bfc9c1]/50 overflow-hidden text-xs font-semibold">
          {[['en', 'EN'], ['hi', 'हि'], ['kn', 'ಕ']].map(([k, l]) => (
            <button key={k} onClick={() => i18n.changeLanguage(k)}
              className={`px-3 py-1.5 transition-colors ${i18n.language === k ? 'bg-[#2d6a4f] text-white' : 'text-[#404943]'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="card anim d1">
        <h2 className="font-semibold text-xl text-[#151c22]">{t('home.good_morning', {defaultValue: greetingKey})}, {displayName}.</h2>
        <p className="text-[#404943] text-base mt-1">{t('home.making_diff')}</p>
      </div>
      {streak > 0 && (
        <div className="anim d2 flex items-center gap-3 bg-[#fff8e1] border border-[#e8a020]/20 rounded-[20px] px-4 py-3">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-[#e8a020]">{streak}-day streak</span>
          <span className="text-[#404943] text-sm">Keep going!</span>
        </div>
      )}
      <div className="card anim d2 flex flex-col items-center">
        <h3 className="font-semibold text-xl self-start">{t('home.daily_progress')}</h3>
        <svg width="160" height="160" viewBox="0 0 160 160" className="my-4"><circle cx="80" cy="80" r="64" fill="none" stroke="#dce3ec" strokeWidth="12" /><circle cx="80" cy="80" r="64" fill="none" stroke="#2d6a4f" strokeWidth="12" strokeLinecap="round" strokeDasharray="402.12" strokeDashoffset="100.53" transform="rotate(-90 80 80)" /><text x="80" y="75" textAnchor="middle" className="text-2xl font-bold" fill="#151c22">{points}</text><text x="80" y="95" textAnchor="middle" className="text-sm" fill="#404943">{t('board.points')}</text></svg>
        <p className="text-[#404943]">{t('home.items_sorted', {count: itemsDisposed})}</p>
        <p className="text-[#2d6a4f] font-semibold text-sm mt-1">
          {t('home.prevented_kg', {kg: kgDiverted.toFixed(1)})}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 anim d3">
        <div className="card-s h-32 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[#404943] text-sm">{t('home.total_points')}</span>
            <I n="star" f s={{ color: '#f59e0b', fontSize: '20px' }} />
          </div>
          <div>
            <span className="text-xl font-semibold">{points.toLocaleString()}</span>
            <br /><span className="text-xs font-semibold text-[#2d6a4f]">{t('home.impact_score')}</span>
          </div>
        </div>
        <div className="card-s h-32 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[#404943] text-sm">{t('home.recent_scans')}</span>
            <I n="center_focus_strong" f s={{ color: '#1f5eac', fontSize: '20px' }} />
          </div>
          <div>
            <span className="text-xl font-semibold">{itemsDisposed}</span>
            <br /><span className="text-xs font-semibold text-[#2d6a4f]">{t('home.total')}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto anim d4 pb-1">
        {treesEquiv > 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">{t('home.trees_saved', {count: treesEquiv})}</span>}
        {bottlesRescued > 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">{t('home.bottles_rescued', {count: bottlesRescued})}</span>}
        {kgDiverted > 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">{t('home.kg_diverted', {count: kgDiverted.toFixed(1)})}</span>}
        {points === 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">{t('home.start_sorting')}</span>}
      </div>
      <div className="anim d5 bg-[#2d6a4f] rounded-[24px] p-6 flex justify-between items-center cursor-pointer" onClick={() => onNav('scanner')}>
        <div>
          <h3 className="text-white font-semibold text-xl">{t('home.ready_to_sort')}</h3>
          <p className="text-white/90">{t('home.scan_next_item')}</p>
        </div>
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
          <I n="center_focus_strong" s={{ color: '#2d6a4f' }} />
        </div>
      </div>
    </div>
  );
}
function ScannerScreen({ onNav, onChat, fileRef, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current || !streamActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    let width = video.videoWidth;
    let height = video.videoHeight;
    const MAX_SIZE = 1024;

    if (width > height && width > MAX_SIZE) {
      height *= MAX_SIZE / width;
      width = MAX_SIZE;
    } else if (height > MAX_SIZE) {
      width *= MAX_SIZE / height;
      height = MAX_SIZE;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCapture(dataUrl);
  };

  return (
    <div className="absolute inset-0 z-10 bg-black">
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />

      <div className="absolute flex items-center justify-center pointer-events-none" style={{ top: 60, left: 0, right: 0, bottom: 320 }}>
        <div className="relative" style={{ width: 220, height: 220 }}>
          <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-[32px]" />
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
          <div className="absolute left-0 right-0 h-[2px] bg-[#4ade80]/60 shadow-[0_0_8px_#4ade80]" style={{ animation: 'scanline 2s ease-in-out infinite alternate', top: '50%' }} />
        </div>
      </div>
      <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-[32px]" />
      <p className="absolute left-0 right-0 text-center text-white text-sm font-medium drop-shadow-lg" style={{ bottom: 298 }}>Align waste inside the box</p>

      <div className="absolute left-0 right-0 px-6 pointer-events-auto" style={{ bottom: 190 }}>
        <p className="text-white/50 text-xs text-center mb-2">── or ──</p>
        <button onClick={() => fileRef.current && fileRef.current.click()} className="bg-white/15 backdrop-blur border border-white/25 text-white rounded-[20px] px-5 py-2.5 w-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/25 transition-colors"><I n="photo_library" s={{ fontSize: '18px' }} />Upload from Gallery</button>
      </div>

      <div className="absolute left-0 right-0 px-6 flex justify-between items-center pointer-events-auto" style={{ bottom: 100 }}>
        <div className="w-14" />
        <button onClick={takeSnapshot} disabled={!streamActive} className="w-[72px] h-[72px] rounded-full flex items-center justify-center border-4 border-white/30 bg-[#2D6A4F] disabled:opacity-50">
          <I n="camera_alt" c="text-white" s={{ fontSize: '32px' }} />
        </button>
        <button onClick={onChat} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"><I n="forum" s={{ color: '#2D6A4F', fontSize: '20px' }} /></button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto" style={{padding:'0 8px 10px'}}>
      <div style={{background:'rgba(255,255,255,0.15)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderRadius:26,border:'1px solid rgba(255,255,255,0.2)',boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}} className="flex items-center justify-around py-2 px-1">
        {[{id:'home',i:'home',l:'Home'},{id:'scanner',i:'center_focus_strong',l:'Scan',a:true},{id:'journey',i:'bar_chart',l:'Impact'},{id:'leaderboard',i:'leaderboard',l:'Board'}].map(it=>{
        const isScan=it.id==='scanner';
        return(
          <button key={it.l} onClick={()=>onNav(it.id)} className="flex flex-col items-center" style={{flex:1,minWidth:0}}>
            {isScan?(
              <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#2d6a4f,#40916c)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(45,106,79,0.4)',transform:'translateY(-8px)',position:'relative'}}>
                <div style={{position:'absolute',inset:-4,borderRadius:20,border:'2px solid rgba(255,255,255,0.3)',animation:'navPulse 2s ease-in-out infinite'}}/>
                <I n={it.i} f s={{color:'#fff',fontSize:'26px'}}/>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 0'}}>
                <I n={it.i} f={!!it.a} s={{color:it.a?'#fff':'rgba(255,255,255,.5)',fontSize:'22px'}}/>
                <span style={{fontSize:10,fontWeight:it.a?700:500,color:it.a?'#fff':'rgba(255,255,255,.5)'}}>{it.l}</span>
              </div>
            )}
          </button>
        );
        })}
      </div>
    </div>
    </div>
  );
}

function UploadPreviewScreen({ onNav, imgUrl, fileRef, user, onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyse = async () => {
    if (!imgUrl || !user) return;
    setLoading(true);
    setError('');
    try {
      const base64 = imgUrl.includes(',') ? imgUrl.split(',')[1] : imgUrl;
      const response = await apiRequest('/api/vision/analyze', {
        method: 'POST',
        body: JSON.stringify({
          image_base64: base64,
          uid: user.uid
        })
      }, 120000);

      if (!response.items || response.total_items_detected === 0) {
        setError('No trained waste items detected. Try a clearer image with trained classes like PET bottle, plastic bag, can, glass, laptop, book, apple, carrot, rice, etc.');
        return;
      }

      onResult(response);
      onNav('result');
    } catch (e) {
      setError(`Analysis failed: ${e.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 px-5 pb-32 flex flex-col gap-5">
      <div className="anim w-full rounded-[24px] overflow-hidden border-2 border-[#2d6a4f]/30" style={{ aspectRatio: '1/1' }}>
        {imgUrl
          ? <img src={imgUrl} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#e8eef7] flex flex-col items-center justify-center gap-2">
            <I n="image" s={{ fontSize: '48px', color: '#9ca3af' }} />
            <span className="text-sm text-[#404943]">No image selected</span>
          </div>
        }
      </div>
      <div className="anim d1 bg-[#e8f5e9] rounded-[24px] p-4 border border-[#2d6a4f]/20 flex items-center gap-3">
        <I n="eco" s={{ color: '#2d6a4f', fontSize: '24px' }} />
        <div>
          <p className="font-semibold text-[#151c22] text-sm">Image ready for analysis</p>
          <p className="text-[#404943] text-xs mt-0.5">Local YOLO AI will identify trained waste items</p>
        </div>
      </div>
      <button onClick={() => fileRef.current && fileRef.current.click()}
        className="anim d3 bg-[#f6f9ff] border border-[#bfc9c1] text-[#404943] rounded-[20px] w-full h-12 font-medium text-sm flex items-center justify-center gap-2">
        <I n="refresh" s={{ fontSize: '18px' }} />Retake / Reselect
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading
        ? <div className="anim bg-[#2d6a4f]/10 rounded-[24px] w-full h-14 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-[#2d6a4f] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
          <span className="text-[#2d6a4f] font-medium text-sm">AI is analysing your waste...</span>
        </div>
        : <button onClick={analyse} disabled={!imgUrl}
          className="anim d4 bg-[#2d6a4f] text-white rounded-[24px] w-full h-14 font-semibold text-base disabled:opacity-50"
          style={{ boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
          Analyse My Waste →
        </button>
      }
    </div>
  );
}
// ResultScreen is now imported from ./components/ResultScreen.jsx
function LeaderboardScreen({ user, userStats }) {
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRanked, setTotalRanked] = useState(0);

  useEffect(() => {
    apiRequest('/api/leaderboard')
      .then(d => {
        setLeaders(d.leaderboard || []);
        setTotalRanked(d.total_ranked || 0);
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  const myPoints = userStats?.total_points || 0;
  const myKg = userStats?.kg_diverted || 0;

  const myRankInTop10 = leaders.findIndex(l => l.uid === user?.uid) + 1;

  const badgeForPoints = (pts) => {
    if (pts >= 2000) return { label: 'Compost Master', bg: '#e8f5e9', color: '#0f5238' };
    if (pts >= 1000) return { label: 'E-Waste Hero', bg: '#e3f2fd', color: '#1f5eac' };
    if (pts >= 500) return { label: 'Zero Waster', bg: '#e0f2f1', color: '#0f5238' };
    return { label: 'Growing Green', bg: '#e8f5e9', color: '#2d6a4f' };
  };

  return (
    <div className="pt-20 px-5 pb-[100px] space-y-4">
      <div className="grid grid-cols-2 gap-4 anim">
        <div className="card-s">
          <p className="text-xs font-semibold text-[#404943] uppercase tracking-wider">{t('board.your_rank')}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-black text-[#2d6a4f]">
              {myRankInTop10 > 0 ? `#${myRankInTop10}` : 'Top'}
            </span>
            <span className="text-sm text-[#404943]">{t('board.in_city')}</span>
          </div>
        </div>
        <div className="card-s">
          <p className="text-xs font-semibold text-[#404943] uppercase tracking-wider">{t('board.total_impact')}</p>
          <p className="text-4xl font-black text-[#151c22] mt-1">{myPoints.toLocaleString()}</p>
          <p className="text-sm text-[#404943]">{t('board.points')}</p>
        </div>
      </div>

      <div className="card anim d2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl">{t('board.top_savers')}</h3>
          <span className="text-sm text-[#2d6a4f] font-medium">{t('board.all_time')}</span>
        </div>
        {loading && <p className="text-center text-[#404943] py-4">{t('vendors.loading')}</p>}
        <div className="space-y-4">
          {leaders.map((row, i) => {
            const badge = badgeForPoints(row.total_points || 0);
            const isMe = row.uid === user?.uid;
            const initials = (row.display_name || row.uid || '?').substring(0, 1).toUpperCase();
            return (
              <div key={i} className={`flex items-center gap-3 ${isMe ? 'bg-[#f0fdf4] rounded-[16px] px-3 py-2' : ''}`}>
                <span className="text-xl font-bold text-[#151c22] w-8">{row.rank}</span>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: isMe ? '#2d6a4f' : '#64748b' }}>
                  {initials}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isMe ? 'text-[#2d6a4f]' : 'text-[#151c22]'}`}>
                    {isMe ? t('board.you') : (row.display_name || `User ${row.uid?.substring(0, 6)}`)}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${isMe ? 'text-[#2d6a4f]' : 'text-[#151c22]'}`}>
                    {(row.total_points || 0).toLocaleString()}
                  </span>
                  <br /><span className="text-xs text-[#404943]">{t('board.pts')}</span>
                </div>
              </div>
            );
          })}
        </div>
        {!loading && leaders.length === 0 && (
          <p className="text-center text-[#404943] py-4">{t('board.no_rankings')}</p>
        )}
      </div>
    </div>
  );
}
function JourneyScreen({ user, userStats, onNav }) {
  const { t } = useTranslation();
  const points = userStats?.total_points || 0;
  const kgDiverted = userStats?.kg_diverted || 0;
  const treesEquiv = userStats?.trees_equivalent || 0;
  const bottlesRescued = userStats?.bottles_rescued || 0;

  const quotes = [
    "Recycling one ton of paper saves 17 trees and 7,000 gallons of water. Be the change—one bin at a time!",
    "Turn waste into wonder: Recycling isn't just good for the planet; it's your superpower for a greener tomorrow.",
    "Every recycled bottle is a step toward a cleaner world. You've got the power—reuse, reduce, recycle!"
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="pt-20 px-5 pb-[100px] space-y-5">
      <h1 className="text-3xl font-black text-[#151c22] leading-tight anim">{t('journey.title')}</h1>
      <p className="text-[#404943] text-sm mt-2 anim d1">{t('journey.subtitle')}</p>

      <div className="card anim d2" style={{ background: 'linear-gradient(135deg, #2d6a4f 0%, #1e3a2e 100%)' }}>
        <h2 className="text-white font-bold text-lg mb-2">{t('journey.eco_footprint')}</h2>
        <p className="text-white/90 text-sm italic mb-4">"{quote}"</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-2xl mb-1">🌳</div>
            <div className="text-white font-bold text-xl">{treesEquiv}</div>
            <div className="text-white/80 text-xs">{t('journey.trees_saved')}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-2xl mb-1">♻️</div>
            <div className="text-white font-bold text-xl">{bottlesRescued}</div>
            <div className="text-white/80 text-xs">{t('journey.bottles_rescued')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 anim d3">
        <div className="card-s flex flex-col justify-center items-center h-32">
          <span className="text-3xl font-black text-[#2d6a4f]">{kgDiverted.toFixed(1)}</span>
          <span className="text-sm font-semibold text-[#404943] mt-1">{t('journey.kg_diverted')}</span>
        </div>
        <div className="card-s flex flex-col justify-center items-center h-32">
          <span className="text-3xl font-black text-[#1f5eac]">{points.toLocaleString()}</span>
          <span className="text-sm font-semibold text-[#404943] mt-1">{t('journey.impact_points')}</span>
        </div>
      </div>

      <div className="card anim d4 bg-[#e8f5e9] border border-[#2d6a4f]/20">
        <div className="flex items-center gap-3 mb-3">
          <I n="psychology" s={{ color: '#2d6a4f', fontSize: '24px' }} />
          <h3 className="font-semibold text-lg text-[#151c22]">{t('journey.progress')}</h3>
        </div>
        <p className="text-sm text-[#404943]">
          {t('journey.progress_text', {kg: kgDiverted.toFixed(1)})}
        </p>
        <div className="mt-4 h-2 bg-[#dce3ec] rounded-full overflow-hidden">
          <div className="h-full bg-[#2d6a4f] rounded-full" style={{ width: `${Math.min(100, (kgDiverted / 10) * 100)}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-[#404943] mt-2 font-medium">
          <span>0 kg</span>
          <span>Goal: 10 kg</span>
        </div>
      </div>
    </div>
  );
}
function showPushNotif(title, options) { if ('serviceWorker' in navigator) { navigator.serviceWorker.ready.then(reg => { reg.showNotification(title, options).catch(e => console.error('SW notif error:', e)); }); } else { try { new Notification(title, options); } catch (e) { console.error('Notif error:', e); } } }
function App() {
  const { t } = useTranslation();
  const [scr, setScr] = useState('home');
  const [chat, setChat] = useState(false);
  
  const [imgUrl, setImgUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    // Check local storage first
    const savedDemoUser = localStorage.getItem('wastewise-demo-user');
    if (savedDemoUser) {
      handleUserLogin(JSON.parse(savedDemoUser));
      return;
    }

    if (firebaseEnabled && fbAuth) {
      const unsub = fbAuth.onAuthStateChanged(u => {
        if (u) {
          handleUserLogin(u);
        } else if (!user) { // Only set to null if not using demo user
          setAuthLoading(false);
        }
      });
      return unsub;
    } else {
      setAuthLoading(false);
    }
  }, []);

  const handleUserLogin = (u) => {
    setUser(u);
    setAuthLoading(false);
    fetchUserStats(u.uid);
    saveProfile(u);
  };

  const saveProfile = async (u) => {
    if (!u) return;
    try {
      await apiRequest(`/api/user/${u.uid}/profile`, {
        method: 'POST',
        body: JSON.stringify({ display_name: u.displayName || 'Anonymous' })
      });
    } catch (e) { console.error(e); }
  };

  const fetchUserStats = async (uid) => {
    try {
      const d = await apiRequest(`/api/user/${uid}/stats`);
      if (d.total_points !== undefined) {
        setUserStats(d);
      }
    } catch (e) { console.error('Stats fetch failed:', e); }
  };

  useEffect(() => {
    if (!user) return;
    const alreadyGranted = localStorage.getItem('notif-granted');
    const alreadyDismissed = localStorage.getItem('notif-dismissed');
    if (alreadyGranted === 'true' || alreadyDismissed === 'true') return;
    const t = setTimeout(() => setShowNotifModal(true), 3000);
    return () => clearTimeout(t);
  }, [user]);

  const handleAllowNotif = () => { Notification.requestPermission().then(permission => { setShowNotifModal(false); if (permission === 'granted') { localStorage.setItem('notif-granted', 'true'); showPushNotif('Welcome to WasteWise! 🌍', { body: 'You\'re set up to make a real difference. Let\'s sort some waste today! ♻️' }); } }); };
  const handleDismissNotif = () => { localStorage.setItem('notif-dismissed', 'true'); setShowNotifModal(false); };
  const nav = (id, data) => { if (id === 'chat') { setChat(true); return; } if (id === 'map' || id === 'profile') return; if (data) setAnalysisResult(data); setScr(id); };
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_SIZE = 1024;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setImgUrl(canvas.toDataURL('image/jpeg', 0.85));
        setScr('upload-preview');
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(f);
    e.target.value = '';
  };
  const showNav = scr !== 'scanner' && scr !== 'upload-preview';
  const topBack = scr === 'upload-preview' ? 'scanner' : (scr === 'store' ? 'home' : 'scanner');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2d6a4f' }}>
        <div className="phone flex flex-col items-center justify-center">
          <div className="text-5xl mb-4" style={{ animation: 'pulse-soft 1.5s infinite' }}>🌱</div>
          <div className="text-white font-bold">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-0 md:p-4" style={{ background: '#2d6a4f' }}>
        <div className="phone">
          <LoginScreen onLogin={handleUserLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4" style={{ background: '#2d6a4f' }}>
      <div className="phone flex flex-col">
        <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} style={{display:'none'}}/>
        {scr!=='scanner'&&<TopBar screen={scr} onBack={()=>nav(topBack)} onNav={nav}/>}
        <div className="flex-1 relative overflow-y-auto bg-[#f6f9ff]">
          {scr==='home'&&<HomeScreen onNav={nav} user={user} userStats={userStats}/>}
          {scr==='scanner'&&<ScannerScreen onNav={nav} onChat={()=>setChat(true)} fileRef={fileRef} onCapture={(url)=>{setImgUrl(url);setScr('upload-preview');}}/>}
          {scr==='upload-preview'&&<UploadPreviewScreen onNav={nav} imgUrl={imgUrl} fileRef={fileRef} user={user} onResult={setAnalysisResult}/>}
          {scr==='result'&&<NewResultScreen onNav={nav} result={analysisResult} user={user}/>}
          {scr==='leaderboard'&&<LeaderboardScreen user={user} userStats={userStats}/>}
          {scr==='journey'&&<JourneyScreen user={user} userStats={userStats} onNav={nav}/>}
          {scr==='vendors'&&<VendorsScreen />}
          {scr==='store'&&<StoreScreen onNav={nav} userStats={userStats}/>}
        </div>
        {showNav && <BottomNav active={scr === 'result' ? 'scanner' : scr} onNav={nav} />}
        {scr === 'home' && <button onClick={() => setChat(true)} className="absolute z-20 flex items-center gap-2 px-4 py-3 rounded-[16px] text-white" style={{ background: '#2d6a4f', bottom: 96, right: 16 }}><I n="chat" s={{ fontSize: '20px' }} /><span className="text-sm font-medium">Ask WasteWise</span></button>}
        {scr === 'result' && <button onClick={() => setChat(true)} className="absolute z-20 flex items-center gap-3 px-5 rounded-full shadow-lg" style={{ background: '#78acff', color: '#003f7e', bottom: 96, right: 16, height: 52 }}><I n="smart_toy" f s={{ fontSize: '22px' }} /><span className="font-semibold text-sm">Ask WasteWise</span></button>}
        {scr === 'journey' && <button onClick={() => setChat(true)} className="absolute z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white" style={{ background: '#2d6a4f', bottom: 96, right: 16 }}><I n="eco" s={{ fontSize: '24px' }} /></button>}
        <ChatModal open={chat} onClose={() => setChat(false)} />
        {showNotifModal && <div className="absolute inset-0 z-[9999] flex items-end" style={{ background: 'rgba(0,0,0,.5)' }} onClick={handleDismissNotif}>
          <div className="bg-white rounded-t-[32px] p-6 w-full" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 -8px 32px rgba(0,0,0,.12)' }}>
            <span className="text-5xl text-center block">🌱</span>
            <h3 className="font-bold text-xl text-center mt-3" style={{ color: '#151c22' }}>Stay on top of your waste journey</h3>
            <p className="text-sm text-center mt-2" style={{ color: '#404943' }}>Get composting reminders, streak alerts and eco tips. No spam, ever.</p>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={handleAllowNotif} className="bg-[#2d6a4f] text-white w-full h-14 rounded-[24px] font-semibold">Allow Notifications 🔔</button>
              <button onClick={handleDismissNotif} className="bg-[#f6f9ff] w-full h-12 rounded-[24px] font-medium text-sm" style={{ color: '#404943' }}>Maybe Later</button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}

export default App;
