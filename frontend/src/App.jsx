import React, { useState, useEffect, useRef } from 'react';
import { fbAuth, GoogleAuthProvider, signInWithPopup, firebaseEnabled } from './firebase.js';
import { apiRequest } from './utils/api.js';







const T={en:{g:"Good morning, Alex.",t:"You're making a difference today.",r:"Ready to sort?",s:"Scan your next item.",d:"Daily Progress"},hi:{g:"सुप्रभात, एलेक्स।",t:"आज आप बदलाव ला रहे हैं।",r:"छांटने के लिए तैयार?",s:"अगला आइटम स्कैन करें।",d:"दैनिक प्रगति"},kn:{g:"ಶುಭೋದಯ, ಅಲೆಕ್ಸ್.",t:"ನೀವು ಇಂದು ಬದಲಾವಣೆ ಮಾಡುತ್ತಿದ್ದೀರಿ.",r:"ವಿಂಗಡಿಸಲು ಸಿದ್ಧರೆ?",s:"ನಿಮ್ಮ ಮುಂದಿನ ವಸ್ತುವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",d:"ದೈನಂದಿನ ಪ್ರಗತಿ"}};
const botReply=(m)=>{const l=m.toLowerCase();if(l.includes('compost'))return"Great question! For effective composting, maintain a ratio of 3 parts brown material to 1 part green. Turn your pile every 3-7 days for faster decomposition. 🌱";if(l.includes('ewaste')||l.includes('e-waste'))return"For e-waste, I recommend checking your local municipal collection drive. Items like phones and laptops contain valuable metals that can be recovered. ♻️";if(l.includes('plastic'))return"Great initiative! For plastic reduction, start with single-use items. Carry a reusable bag and bottle. WasteWise can help you find recycling points nearby. 💪";return"That's a great question! Proper waste disposal can reduce landfill waste by up to 60%. Keep tracking your progress — every item counts! 🌍";};
function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}
function TopBar({screen,onBack}){
if(screen==='upload-preview')return(<div className="absolute top-0 left-0 right-0 h-16 flex items-center px-5 bg-white z-30 border-b border-[#bfc9c1]/40"><button onClick={onBack} className="w-10 h-10 flex items-center justify-center"><I n="arrow_back"/></button><span className="flex-1 text-center font-semibold text-lg text-[#151c22]">Review Image</span><div className="w-10"/></div>);
if(screen==='result')return(<div className="absolute top-0 left-0 right-0 h-16 flex items-center px-5 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100"><button onClick={onBack} className="w-10 h-10 flex items-center justify-center"><I n="arrow_back"/></button><span className="flex-1 text-center font-bold text-lg" style={{color:'#2D6A4F'}}>WasteWise</span><div className="w-10"/></div>);
if(screen==='leaderboard')return(<div className="absolute top-0 left-0 right-0 h-16 flex items-center px-5 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-xs font-bold">A</div><span className="flex-1 text-center font-semibold text-lg" style={{color:'#2D6A4F'}}>Community Leaderboard</span><button className="w-10 h-10 flex items-center justify-center"><I n="notifications" c="text-gray-500"/></button></div>);
return(<div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-5 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-xs font-bold">A</div><span className="font-black text-2xl tracking-tighter" style={{color:'#2D6A4F'}}>WasteWise</span></div><button className="w-10 h-10 flex items-center justify-center"><I n="notifications" c="text-gray-500"/></button></div>);
}
function BottomNav({active,onNav}){
const items=[{id:'home',i:'home',l:'HOME'},{id:'vendors',i:'store',l:'VENDORS'},{id:'scanner',i:'center_focus_strong',l:'SCAN'},{id:'journey',i:'bar_chart',l:'IMPACT'},{id:'leaderboard',i:'leaderboard',l:'LEADERBOARD'}];
return(<div className="absolute bottom-0 left-0 right-0 h-20 bg-white rounded-t-[24px] border-t border-gray-200 flex items-center justify-around px-2 z-30" style={{boxShadow:'0 -2px 10px rgba(0,0,0,.05)'}}>{items.map(it=>(<button key={it.id} onClick={()=>onNav(it.id)} className="flex flex-col items-center gap-0.5 relative pt-1 pb-1 px-1"><I n={it.i} f={active===it.id} s={{color:active===it.id?'#2D6A4F':'#9ca3af',fontSize:'24px'}}/><span className="text-[10px] uppercase tracking-wider font-medium" style={{color:active===it.id?'#2D6A4F':'#9ca3af'}}>{it.l}</span>{active===it.id&&<div className="absolute -bottom-0 w-1 h-1 rounded-full" style={{background:'#2D6A4F'}}/>}</button>))}</div>);
}
function ChatModal({open,onClose}){
const [msgs,setMsgs]=useState([{f:'b',t:"Hi! I can help you with composting tips, waste disposal guidance, or anything about WasteWise. What would you like to know?"}]);
const [inp,setInp]=useState('');const ref=useRef(null);
useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[msgs]);
const send=(x)=>{const txt=x||inp;if(!txt.trim())return;setMsgs(p=>[...p,{f:'u',t:txt}]);setInp('');setTimeout(()=>setMsgs(p=>[...p,{f:'b',t:botReply(txt)}]),800);};
if(!open)return null;
return(<div className="absolute inset-0 z-50 flex items-end" onClick={onClose}><div className="absolute inset-0 bg-black/40"/>
<div className="relative bg-white rounded-t-[32px] p-6 w-full flex flex-col" style={{maxHeight:'70%'}} onClick={e=>e.stopPropagation()}>
<div className="flex items-center justify-between mb-4"><h2 className="font-bold text-xl">Ask WasteWise 🤖</h2><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><I n="close"/></button></div>
<div ref={ref} className="flex-1 overflow-y-auto space-y-3 mb-4" style={{minHeight:200}}>
{msgs.map((m,i)=>(<div key={i} className={`max-w-[85%] p-3 text-sm ${m.f==='b'?'bg-[#e8f5e9] rounded-[16px] rounded-tl-sm text-[#151c22]':'bg-[#2d6a4f] text-white rounded-[16px] rounded-tr-sm ml-auto'}`}>{m.t}</div>))}
</div>
<div className="flex gap-2 mb-3 overflow-x-auto pb-1">{["Composting tips","E-waste near me","Reduce plastic"].map(c=>(<button key={c} onClick={()=>send(c)} className="whitespace-nowrap bg-[#e8eef7] text-[#404943] text-xs px-3 py-2 rounded-full border border-[#bfc9c1]/50">{c}</button>))}</div>
<div className="flex gap-2"><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message..." className="flex-1 bg-[#f6f9ff] rounded-[20px] border border-[#bfc9c1] px-4 py-3 text-sm outline-none"/><button onClick={()=>send()} className="bg-[#2d6a4f] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"><I n="send" s={{fontSize:'18px'}}/></button></div>
</div></div>);
}
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signInWithGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(fbAuth, provider);
    } catch (e) {
      setError(`Google login is unavailable in this environment. Continue as Demo User for local demo. Error: ${e.message}`);
      setLoading(false);
    }
  };

  const continueAsDemo = () => {
    const demoUser = {
      uid: 'demo-user',
      displayName: 'Demo User',
      email: 'demo@wastewise.local',
      photoURL: null,
      isDemo: true
    };
    localStorage.setItem('wastewise-demo-user', JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8"
      style={{background: 'linear-gradient(135deg, #1a3a1a 0%, #2d6a4f 100%)', borderRadius: 'inherit'}}>
      <div className="text-6xl mb-4">🌱</div>
      <h1 className="text-3xl font-black text-white mb-2">WasteWise</h1>
      <p className="text-white/70 text-sm text-center mb-6">
        Local demo mode available — no Firebase login required.
      </p>
      <div className="w-full space-y-3">
        {firebaseEnabled ? (
          <button onClick={signInWithGoogle} disabled={loading}
            className="bg-white text-[#151c22] rounded-[20px] w-full h-14 font-bold text-base flex items-center justify-center gap-3">
            {loading ? '...' : '🔵 Continue with Google'}
          </button>
        ) : (
          <button disabled
            className="bg-white/50 text-[#151c22]/50 cursor-not-allowed rounded-[20px] w-full h-14 font-bold text-xs flex items-center justify-center gap-3">
            Google login unavailable in local demo
          </button>
        )}
        <button onClick={continueAsDemo} disabled={loading}
          className="bg-transparent border-2 border-white/40 text-white rounded-[20px] w-full h-14 font-bold text-base flex items-center justify-center hover:bg-white/10 transition-colors">
          Continue as Demo User
        </button>
      </div>
      {error && <p className="text-red-300 text-xs mt-4 text-center">{error}</p>}
    </div>
  );
}
function VendorsScreen() {
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
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="pt-20 px-5 pb-[100px]">
      <h1 className="text-2xl font-bold text-[#151c22] mb-4">Collection Points</h1>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map(c => (
          <button key={c.name} onClick={() => loadVendors(c.name)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-colors
              ${selected === c.name 
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]' 
                : 'bg-white text-[#404943] border-[#bfc9c1]/50'}`}>
            {c.name.replace(/_/g,' ')} ({c.vendor_count})
          </button>
        ))}
      </div>
      {loading && <div className="text-center py-8 text-[#404943]">Loading...</div>}
      <div className="space-y-3">
        {vendors.map((v, i) => (
          <div key={i} className="card">
            <h3 className="font-semibold text-[#151c22]">{v.name}</h3>
            <p className="text-sm text-[#404943] mt-1">{v.address}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(v.categories || []).map(c => (
                <span key={c} className="text-xs bg-[#e8f5e9] text-[#0f5238] px-2 py-0.5 rounded-full">
                  {c.replace(/_/g,' ')}
                </span>
              ))}
            </div>
            {v.phone && (
              <a href={`tel:${v.phone}`}
                className="mt-3 inline-flex items-center gap-2 bg-[#2d6a4f] text-white text-sm px-4 py-2 rounded-full">
                📞 Call Now
              </a>
            )}
          </div>
        ))}
        {!loading && selected && vendors.length === 0 && (
          <p className="text-center text-[#404943] py-8">No vendors found for this category.</p>
        )}
      </div>
    </div>
  );
}
function HomeScreen({ onNav, lang, setLang, user, userStats }) {
  const t = T[lang] || T.en;
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
      <div className="flex justify-end mb-1 anim">
        <div className="flex bg-white rounded-full border border-[#bfc9c1]/50 overflow-hidden text-xs font-semibold">
          {[['en','EN'],['hi','हि'],['kn','ಕ']].map(([k,l])=>(
            <button key={k} onClick={()=>setLang(k)} 
              className={`px-3 py-1.5 transition-colors ${lang===k?'bg-[#2d6a4f] text-white':'text-[#404943]'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="card anim d1">
        <h2 className="font-semibold text-xl text-[#151c22]">{greetingKey}, {displayName}.</h2>
        <p className="text-[#404943] text-base mt-1">{t.t}</p>
      </div>
      {streak > 0 && (
        <div className="anim d2 flex items-center gap-3 bg-[#fff8e1] border border-[#e8a020]/20 rounded-[20px] px-4 py-3">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-[#e8a020]">{streak}-day streak</span>
          <span className="text-[#404943] text-sm">Keep going!</span>
        </div>
      )}
      <div className="card anim d2 flex flex-col items-center">
        <h3 className="font-semibold text-xl self-start">{t.d}</h3>
        <svg width="160" height="160" viewBox="0 0 160 160" className="my-4"><circle cx="80" cy="80" r="64" fill="none" stroke="#dce3ec" strokeWidth="12"/><circle cx="80" cy="80" r="64" fill="none" stroke="#2d6a4f" strokeWidth="12" strokeLinecap="round" strokeDasharray="402.12" strokeDashoffset="100.53" transform="rotate(-90 80 80)"/><text x="80" y="75" textAnchor="middle" className="text-2xl font-bold" fill="#151c22">{points}</text><text x="80" y="95" textAnchor="middle" className="text-sm" fill="#404943">Points</text></svg>
        <p className="text-[#404943]">{itemsDisposed} items properly sorted.</p>
        <p className="text-[#2d6a4f] font-semibold text-sm mt-1">
          You prevented ~{kgDiverted.toFixed(1)} kg waste from landfill
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 anim d3">
        <div className="card-s h-32 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[#404943] text-sm">Total Points</span>
            <I n="star" f s={{color:'#f59e0b',fontSize:'20px'}}/>
          </div>
          <div>
            <span className="text-xl font-semibold">{points.toLocaleString()}</span>
            <br/><span className="text-xs font-semibold text-[#2d6a4f]">Impact score</span>
          </div>
        </div>
        <div className="card-s h-32 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[#404943] text-sm">Recent Scans</span>
            <I n="center_focus_strong" f s={{color:'#1f5eac',fontSize:'20px'}}/>
          </div>
          <div>
            <span className="text-xl font-semibold">{itemsDisposed}</span>
            <br/><span className="text-xs font-semibold text-[#2d6a4f]">Total</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto anim d4 pb-1">
        {treesEquiv > 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">🌳 {treesEquiv} trees saved</span>}
        {bottlesRescued > 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">♻️ {bottlesRescued} bottles</span>}
        {kgDiverted > 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">🗑️ {kgDiverted.toFixed(1)} kg diverted</span>}
        {points === 0 && <span className="bg-white border border-[#bfc9c1]/40 rounded-full px-3 py-2 text-xs font-semibold text-[#404943] whitespace-nowrap">🌱 Start sorting to earn impact!</span>}
      </div>
      <div className="anim d5 bg-[#2d6a4f] rounded-[24px] p-6 flex justify-between items-center cursor-pointer" onClick={()=>onNav('scanner')}>
        <div>
          <h3 className="text-white font-semibold text-xl">{t.r}</h3>
          <p className="text-white/90">{t.s}</p>
        </div>
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
          <I n="center_focus_strong" s={{color:'#2d6a4f'}}/>
        </div>
      </div>
    </div>
  );
}
function ScannerScreen({onNav,onChat,fileRef}){
return(<div className="absolute inset-0 z-10" style={{background:'linear-gradient(135deg,#1a2e1e 0%,#2d4a2d 40%,#1e3a2e 100%)'}}>
<div className="absolute inset-0" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")"}}/>
<div className="absolute flex items-center justify-center" style={{top:60,left:0,right:0,bottom:320}}><div className="relative" style={{width:220,height:220}}>
<div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-[32px]"/>
<div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg"/>
<div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg"/>
<div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg"/>
<div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg"/>
<div className="absolute left-0 right-0 h-[1px] bg-[#4ade80]/60" style={{animation:'scanline 2s ease-in-out infinite alternate',top:'50%'}}/>
</div></div>
<p className="absolute left-0 right-0 text-center text-white text-sm font-medium drop-shadow-lg" style={{bottom:298}}>Align waste inside the box</p>
<div className="absolute left-0 right-0 flex justify-center" style={{bottom:248}}>
<div className="bg-white/95 backdrop-blur rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2"><I n="recycling" c="pulse-icon" s={{color:'#2D6A4F',fontSize:'18px',animation:'pulse-soft 1.5s ease-in-out infinite'}}/><span className="text-[#2D6A4F] font-bold text-sm">Detected: Plastic Bottle</span></div></div>
<div className="absolute left-0 right-0 px-6" style={{bottom:190}}>
<p className="text-white/50 text-xs text-center mb-2">── or ──</p>
<button onClick={()=>fileRef.current&&fileRef.current.click()} className="bg-white/15 backdrop-blur border border-white/25 text-white rounded-[20px] px-5 py-2.5 w-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/25 transition-colors"><I n="photo_library" s={{fontSize:'18px'}}/>Upload from Gallery</button>
</div>
<div className="absolute left-0 right-0 px-6 flex justify-between items-center" style={{bottom:100}}>
<div className="w-14"/>
<button onClick={()=>onNav('result')} className="w-[72px] h-[72px] rounded-full flex items-center justify-center border-4 border-white/30" style={{background:'#2D6A4F'}}><I n="center_focus_strong" c="text-white" s={{fontSize:'32px'}}/></button>
<button onClick={onChat} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"><I n="forum" s={{color:'#2D6A4F',fontSize:'20px'}}/></button>
</div>
<div className="absolute bottom-0 left-0 right-0 h-20 bg-black/20 rounded-t-[24px] flex items-center justify-around px-2">
{[{id:'home',i:'home',l:'HOME'},{id:'scanner',i:'center_focus_strong',l:'SCAN',a:true},{id:'journey',i:'bar_chart',l:'IMPACT'},{id:'leaderboard',i:'leaderboard',l:'LEADERBOARD'}].map(it=>(<button key={it.l} onClick={()=>onNav(it.id)} className="flex flex-col items-center gap-0.5"><I n={it.i} f={!!it.a} s={{color:it.a?'#fff':'rgba(255,255,255,.5)',fontSize:'22px'}}/><span className="text-[10px] uppercase tracking-wider font-medium" style={{color:it.a?'#fff':'rgba(255,255,255,.5)'}}>{it.l}</span></button>))}
</div>
</div>);
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
      });

      onResult(response);
      onNav('result');
    } catch (e) {
      setError(`Analysis failed: ${e.message}. Please try again.`);
    }
    setLoading(false);
  };

  return (
    <div className="pt-20 px-5 pb-32 flex flex-col gap-5">
      <div className="anim w-full rounded-[24px] overflow-hidden border-2 border-[#2d6a4f]/30" style={{aspectRatio:'1/1'}}>
        {imgUrl 
          ? <img src={imgUrl} className="w-full h-full object-cover"/>
          : <div className="w-full h-full bg-[#e8eef7] flex flex-col items-center justify-center gap-2">
              <I n="image" s={{fontSize:'48px',color:'#9ca3af'}}/>
              <span className="text-sm text-[#404943]">No image selected</span>
            </div>
        }
      </div>
      <div className="anim d1 bg-[#e8f5e9] rounded-[24px] p-4 border border-[#2d6a4f]/20 flex items-center gap-3">
        <I n="eco" s={{color:'#2d6a4f',fontSize:'24px'}}/>
        <div>
          <p className="font-semibold text-[#151c22] text-sm">Image ready for analysis</p>
          <p className="text-[#404943] text-xs mt-0.5">Local YOLO AI will identify trained waste items</p>
        </div>
      </div>
      <button onClick={() => fileRef.current && fileRef.current.click()}
        className="anim d3 bg-[#f6f9ff] border border-[#bfc9c1] text-[#404943] rounded-[20px] w-full h-12 font-medium text-sm flex items-center justify-center gap-2">
        <I n="refresh" s={{fontSize:'18px'}}/>Retake / Reselect
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading 
        ? <div className="anim bg-[#2d6a4f]/10 rounded-[24px] w-full h-14 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[#2d6a4f] border-t-transparent rounded-full" style={{animation:'spin 1s linear infinite'}}/>
            <span className="text-[#2d6a4f] font-medium text-sm">AI is analysing your waste...</span>
          </div>
        : <button onClick={analyse} disabled={!imgUrl}
            className="anim d4 bg-[#2d6a4f] text-white rounded-[24px] w-full h-14 font-semibold text-base disabled:opacity-50"
            style={{boxShadow:'0 4px 12px rgba(45,106,79,0.25)'}}>
            Analyse My Waste →
          </button>
      }
    </div>
  );
}
function ResultScreen({ onNav, onChat, result, user }) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  if (!result || !result.items || result.items.length === 0) {
    return (
      <div className="pt-20 px-5 text-center">
        <p className="text-[#404943]">No waste items detected. Try a clearer photo.</p>
        <button onClick={() => onNav('scanner')} className="mt-4 bg-[#2d6a4f] text-white px-6 py-3 rounded-full">
          Try Again
        </button>
      </div>
    );
  }

  const primaryItem = result.items[0];
  
  const categoryColors = {
    wet_organic: { bg: '#b1f0ce', text: '#0f5238', label: 'Organic' },
    dry_recyclable: { bg: '#e3f2fd', text: '#1f5eac', label: 'Recyclable' },
    e_waste: { bg: '#fce4ec', text: '#880e4f', label: 'E-Waste' },
    hazardous: { bg: '#fff3e0', text: '#e65100', label: 'Hazardous' },
    medical: { bg: '#f3e5f5', text: '#6a1b9a', label: 'Medical' },
    construction: { bg: '#efebe9', text: '#3e2723', label: 'Construction' },
    sanitary: { bg: '#e8eaf6', text: '#283593', label: 'Sanitary' },
  };

  const disposalIcons = {
    compost: 'compost',
    sell: 'sell',
    donate: 'volunteer_activism',
    collection_point: 'location_on',
    special_facility: 'settings'
  };

  const colors = categoryColors[primaryItem.waste_category] || { bg: '#e8eef7', text: '#404943', label: primaryItem.waste_category };
  const icon = disposalIcons[primaryItem.disposal_path] || 'eco';
  
  const confidenceLabel = { high: '90%+', medium: '70–90%', low: '<70%' };

  const submitFeedback = async (correct) => {
    if (!user || feedbackSent) return;
    setFeedbackSent(true);
    try {
      await apiRequest('/api/vision/feedback', {
        method: 'POST',
        body: JSON.stringify({
          uid: user.uid,
          analysis_id: result.session_id || 'unknown',
          correct
        })
      });
    } catch(e) { console.error('Feedback failed:', e); }
  };

  return (
    <div className="pt-20 px-5 space-y-4 pb-44">
      <div className="anim d1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#151c22] capitalize">{primaryItem.item_name}</h2>
          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
            style={{background: colors.bg, color: colors.text}}>
            <I n="compost" s={{fontSize:'14px'}}/>{colors.label}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <I n="verified" s={{color:'#2c694e',fontSize:'16px'}}/>
          <span className="text-sm text-[#404943]">{confidenceLabel[primaryItem.confidence] || '?'} Confidence</span>
          {primaryItem.is_hazardous && (
            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">⚠️ Hazardous</span>
          )}
        </div>
      </div>

      <div className="card anim d2">
        <h3 className="font-semibold text-xl mb-3">Recommended Action</h3>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{background: colors.bg}}>
            <I n={icon} s={{color: colors.text}}/>
          </div>
          <div>
            <p className="text-lg text-[#151c22] capitalize">
              {primaryItem.disposal_path.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-[#404943] mt-1">{primaryItem.reason}</p>
          </div>
        </div>
        {primaryItem.waste_category === 'wet_organic' && (
          <button onClick={()=>onNav('journey')} 
            className="bg-[#2d6a4f] text-white w-full h-14 rounded-[24px] font-semibold mt-4 text-base">
            Start 21-Day Journey →
          </button>
        )}
      </div>

      {result.items.length > 1 && (
        <div className="card anim d3">
          <h3 className="font-semibold text-xl mb-3">Also Detected ({result.items.length - 1} more)</h3>
          {result.items.slice(1).map((item, i) => {
            const c = categoryColors[item.waste_category] || { bg: '#e8eef7', text: '#404943', label: item.waste_category };
            return (
              <div key={i} className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-[#151c22] flex-1 capitalize">{item.item_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{background: c.bg, color: c.text}}>{c.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="anim d3 bg-[#e8f5e9] rounded-[24px] p-4 flex items-center gap-3">
        <span className="text-2xl">⭐</span>
        <div>
          <p className="font-bold text-[#0f5238]">+{result.items.length * 10} points earned!</p>
          <p className="text-xs text-[#404943]">Added to your impact score</p>
        </div>
      </div>

      <div className="text-center anim d4">
        <p className="text-sm text-[#404943] mb-3">Was this result correct?</p>
        {feedbackSent 
          ? <p className="text-[#2d6a4f] font-semibold text-sm">Thanks for your feedback! 🙏</p>
          : <div className="flex gap-3 max-w-xs mx-auto">
              <button onClick={()=>submitFeedback(true)} 
                className="flex-1 h-14 rounded-[24px] font-semibold bg-[#0f5238] text-white">Yes</button>
              <button onClick={()=>submitFeedback(false)}
                className="flex-1 h-14 rounded-[24px] font-semibold bg-[#dce3ec] text-[#151c22]">No</button>
            </div>
        }
      </div>
    </div>
  );
}
function LeaderboardScreen({ user, userStats }) {
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
          <p className="text-xs font-semibold text-[#404943] uppercase tracking-wider">YOUR RANK</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-black text-[#2d6a4f]">
              {myRankInTop10 > 0 ? `#${myRankInTop10}` : 'Top'}
            </span>
            <span className="text-sm text-[#404943]">in city</span>
          </div>
        </div>
        <div className="card-s">
          <p className="text-xs font-semibold text-[#404943] uppercase tracking-wider">TOTAL IMPACT</p>
          <p className="text-4xl font-black text-[#151c22] mt-1">{myPoints.toLocaleString()}</p>
          <p className="text-sm text-[#404943]">Points</p>
        </div>
      </div>

      <div className="card anim d2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl">Top Savers</h3>
          <span className="text-sm text-[#2d6a4f] font-medium">All Time</span>
        </div>
        {loading && <p className="text-center text-[#404943] py-4">Loading...</p>}
        <div className="space-y-4">
          {leaders.map((row, i) => {
            const badge = badgeForPoints(row.total_points || 0);
            const isMe = row.uid === user?.uid;
            const initials = (row.display_name || row.uid || '?').substring(0, 1).toUpperCase();
            return (
              <div key={i} className={`flex items-center gap-3 ${isMe ? 'bg-[#f0fdf4] rounded-[16px] px-3 py-2' : ''}`}>
                <span className="text-xl font-bold text-[#151c22] w-8">{row.rank}</span>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{background: isMe ? '#2d6a4f' : '#64748b'}}>
                  {initials}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isMe ? 'text-[#2d6a4f]' : 'text-[#151c22]'}`}>
                    {isMe ? 'You' : (row.display_name || `User ${row.uid?.substring(0,6)}`)}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{background: badge.bg, color: badge.color}}>{badge.label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${isMe ? 'text-[#2d6a4f]' : 'text-[#151c22]'}`}>
                    {(row.total_points || 0).toLocaleString()}
                  </span>
                  <br/><span className="text-xs text-[#404943]">pts</span>
                </div>
              </div>
            );
          })}
        </div>
        {!loading && leaders.length === 0 && (
          <p className="text-center text-[#404943] py-4">No rankings yet. Be the first! 🌱</p>
        )}
      </div>
    </div>
  );
}
function JourneyScreen({ user, onNav }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celeb, setCeleb] = useState(false);
  const [markingDay, setMarkingDay] = useState(null);
  const [showStartJourney, setShowStartJourney] = useState(false);
  const [phone, setPhone] = useState('');
  const [startingJourney, setStartingJourney] = useState(false);

  const CHECKPOINT_DAYS = [1, 3, 7, 21];

  const STEP_DEFS = {
    1: { title: 'Start Your Bin', desc: 'Choose a well-ventilated spot and add a base layer of coarse brown materials like twigs or straw to ensure good airflow.' },
    3: { title: 'Add Greens', desc: 'Incorporate nitrogen-rich materials like vegetable peelings, coffee grounds, and fresh grass clippings to start the heating process.' },
    7: { title: 'The First Turn', desc: "It's time to aerate! Use a pitchfork or compost aerator to thoroughly mix the pile. This introduces oxygen crucial for the microbes." },
    21: { title: 'Harvest Your Compost', desc: 'Identify when your compost is ready and learn the best ways to apply it to your garden.' },
  };

  const loadJourney = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const d = await apiRequest(`/api/reminder/${user.uid}`);
      setJourney(d.journey);
    } catch(e) { 
      console.error(e); 
      setJourney(null);
    }
    setLoading(false);
  };

  useEffect(() => { loadJourney(); }, [user]);

  const markComplete = async (day) => {
    if (!user || markingDay) return;
    setMarkingDay(day);
    try {
      const d = await apiRequest(`/api/user/${user.uid}/checkpoint`, {
        method: 'POST',
        body: JSON.stringify({ day, status: 'completed' })
      });
      if (d.success) {
        setCeleb(true);
        setTimeout(() => setCeleb(false), 2000);
        loadJourney(); 
      }
    } catch(e) { console.error(e); }
    setMarkingDay(null);
  };

  const startJourney = async () => {
    if (!user) return;
    setStartingJourney(true);
    try {
      const d = await apiRequest('/api/reminder/schedule', {
        method: 'POST',
        body: JSON.stringify({
          uid: user.uid,
          journey_start_date: new Date().toISOString(),
          waste_type: 'organic',
          items: [],
          primary_item: 'kitchen waste'
        })
      });
      setShowStartJourney(false); 
      loadJourney();
    } catch(e) { 
      alert(`Failed to start journey: ${e.message}`); 
    }
    setStartingJourney(false);
  };

  if (loading) return <div className="pt-20 px-5 text-center text-[#404943] py-8">Loading journey...</div>;

  if (!journey) {
    return (
      <div className="pt-20 px-5 pb-[100px]">
        <h1 className="text-3xl font-black text-[#151c22] leading-tight">21-Day Composting Journey</h1>
        <p className="text-[#404943] text-sm mt-2">Transform kitchen scraps into nutrient-rich soil.</p>
        {showStartJourney ? (
          <div className="card mt-6">
            <h3 className="font-semibold text-lg mb-3">Start Your Journey</h3>
            <p className="text-sm text-[#404943] mb-3">You will receive notifications here on the app for each checkpoint.</p>
            <button onClick={startJourney} disabled={startingJourney}
              className="bg-[#2d6a4f] text-white w-full h-12 rounded-[20px] font-semibold disabled:opacity-50">
              {startingJourney ? 'Starting...' : 'Begin Journey 🌱'}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowStartJourney(true)}
            className="mt-6 bg-[#2d6a4f] text-white w-full h-14 rounded-[24px] font-semibold">
            Start My 21-Day Journey →
          </button>
        )}
      </div>
    );
  }

  const checkpoints = journey.checkpoints || {};
  const completedDays = Object.entries(checkpoints)
    .filter(([_, v]) => v.status === 'completed').map(([k]) => parseInt(k));
  const progress = Math.round((completedDays.length / CHECKPOINT_DAYS.length) * 100);
  const nextDay = CHECKPOINT_DAYS.find(d => !completedDays.includes(d)) || null;
  const startDate = journey.start_date?.seconds 
    ? new Date(journey.start_date.seconds * 1000) 
    : new Date(journey.start_date || Date.now());
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000*60*60*24));

  return (
    <div className="pt-20 px-5 pb-44">
      <h1 className="text-3xl font-black text-[#151c22] leading-tight anim">21-Day Composting Journey</h1>
      <p className="text-[#404943] text-sm mt-2 anim d1">Day {daysSinceStart + 1} of 21</p>
      <div className="flex items-center justify-between mt-3 anim d1">
        <span className="font-semibold text-[#151c22]">{completedDays.length} of {CHECKPOINT_DAYS.length} checkpoints complete</span>
        <span className="text-sm text-[#404943]">{progress}%</span>
      </div>
      <div className="h-2 bg-[#dce3ec] rounded-full mt-2 anim d1">
        <div className="bg-[#2d6a4f] rounded-full h-2 transition-all duration-700" style={{width:`${progress}%`}}/>
      </div>
      <div className="space-y-3 mt-6">
        {CHECKPOINT_DAYS.map((day, i) => {
          const done = completedDays.includes(day);
          const isActive = day === nextDay;
          const stepDef = STEP_DEFS[day] || { title: `Day ${day}`, desc: '' };

          if (done) return (
            <div key={day} className="anim px-1" style={{animationDelay:`${(i+2)*50}ms`}}>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#e8f5e9] text-[#0f5238] text-xs px-2 py-0.5 rounded-full">✅ Completed</span>
                <span className="text-xs text-[#404943]">Day {day}</span>
              </div>
              <p className="font-semibold text-[#404943]">{stepDef.title}</p>
              <p className="text-sm text-[#404943]/70">{stepDef.desc}</p>
            </div>
          );

          if (isActive) return (
            <div key={day} className="bg-white rounded-[24px] p-5 border-2 border-[#2d6a4f] anim relative"
              style={{boxShadow:'0 4px 16px rgba(45,106,79,.15)',animationDelay:`${(i+2)*50}ms`}}>
              {celeb && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {['♻️','🌱','✨'].map((e,j)=><span key={j} className="text-3xl absolute" style={{animation:'celebration 1s ease both',animationDelay:`${j*150}ms`}}>{e}</span>)}
              </div>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#2d6a4f] text-white text-xs px-3 py-1 rounded-full font-semibold">⭐ Today's Task</span>
                <span className="text-xs text-[#404943]">Day {day}</span>
              </div>
              <h3 className="font-bold text-xl text-[#151c22] mt-2">{stepDef.title}</h3>
              <p className="text-[#404943] text-sm mt-1">{stepDef.desc}</p>
              <button onClick={() => markComplete(day)} disabled={markingDay === day}
                className="bg-[#2d6a4f] text-white w-full h-12 rounded-[20px] font-semibold mt-4 disabled:opacity-50">
                {markingDay === day ? 'Marking...' : 'Mark as Complete ✓'}
              </button>
            </div>
          );

          return (
            <div key={day} className="anim px-1 opacity-40" style={{animationDelay:`${(i+2)*50}ms`}}>
              <div className="flex items-center gap-2 mb-1">
                <I n="lock" s={{fontSize:'14px',color:'#404943'}}/>
                <span className="text-xs text-[#404943]">Day {day}</span>
              </div>
              <p className="font-semibold text-[#404943]">{stepDef.title}</p>
              <p className="text-sm text-[#404943]/80">{stepDef.desc}</p>
            </div>
          );
        })}
      </div>
      {progress === 100 && (
        <div className="mt-6 bg-[#2d6a4f] rounded-[24px] p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-white font-bold text-xl">Journey Complete!</h3>
          <p className="text-white/80 text-sm mt-2">You've mastered composting. Share your impact!</p>
        </div>
      )}
    </div>
  );
}
function showPushNotif(title, options) { if ('serviceWorker' in navigator) { navigator.serviceWorker.ready.then(reg => { reg.showNotification(title, options).catch(e => console.error('SW notif error:', e)); }); } else { try { new Notification(title, options); } catch(e) { console.error('Notif error:', e); } } }
function App() {
  const [scr, setScr] = useState('home');
  const [chat, setChat] = useState(false);
  const [lang, setLang] = useState('en');
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
    } catch(e) { console.error(e); }
  };

  const fetchUserStats = async (uid) => {
    try {
      const d = await apiRequest(`/api/user/${uid}/stats`);
      if (d.total_points !== undefined) {
        setUserStats(d);
      }
    } catch(e) { console.error('Stats fetch failed:', e); }
  };

  useEffect(() => {
    if (!user) return;
    const alreadyGranted = localStorage.getItem('notif-granted');
    const alreadyDismissed = localStorage.getItem('notif-dismissed');
    if (alreadyGranted === 'true' || alreadyDismissed === 'true') return;
    const t = setTimeout(() => setShowNotifModal(true), 3000);
    return () => clearTimeout(t);
  }, [user]);

  const handleAllowNotif=()=>{Notification.requestPermission().then(permission=>{setShowNotifModal(false);if(permission==='granted'){localStorage.setItem('notif-granted','true');showPushNotif('Welcome to WasteWise! 🌍',{body:'You\'re set up to make a real difference. Let\'s sort some waste today! ♻️'});}});};
  const handleDismissNotif=()=>{localStorage.setItem('notif-dismissed','true');setShowNotifModal(false);};
  const nav=(id, data)=>{if(id==='chat'){setChat(true);return;}if(id==='map'||id==='profile')return;if(data)setAnalysisResult(data);setScr(id);};
  const handleFile=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev)=>{setImgUrl(ev.target.result);setScr('upload-preview');};r.readAsDataURL(f);e.target.value='';};
  const showNav=scr!=='scanner'&&scr!=='upload-preview';
  const topBack=scr==='upload-preview'?'scanner':'scanner';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:'#f0f4f8'}}>
        <div className="phone flex flex-col items-center justify-center">
            <div className="text-5xl mb-4" style={{animation: 'pulse-soft 1.5s infinite'}}>🌱</div>
            <div className="text-[#2d6a4f] font-bold">Loading WasteWise...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background:'#f0f4f8'}}>
        <div className="phone">
          <LoginScreen onLogin={handleUserLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'#f0f4f8'}}>
      <div className="phone">
        <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} style={{display:'none'}}/>
        {scr!=='scanner'&&<TopBar screen={scr} onBack={()=>nav(topBack)}/>}
        <div className="absolute inset-0 overflow-y-auto" style={{top:scr==='scanner'?0:0,bottom:0}}>
          {scr==='home'&&<HomeScreen onNav={nav} lang={lang} setLang={setLang} user={user} userStats={userStats}/>}
          {scr==='scanner'&&<ScannerScreen onNav={nav} onChat={()=>setChat(true)} fileRef={fileRef}/>}
          {scr==='upload-preview'&&<UploadPreviewScreen onNav={nav} imgUrl={imgUrl} fileRef={fileRef} user={user} onResult={setAnalysisResult}/>}
          {scr==='result'&&<ResultScreen onNav={nav} onChat={()=>setChat(true)} result={analysisResult} user={user}/>}
          {scr==='leaderboard'&&<LeaderboardScreen user={user} userStats={userStats}/>}
          {scr==='journey'&&<JourneyScreen user={user} onNav={nav}/>}
          {scr==='vendors'&&<VendorsScreen />}
        </div>
        {showNav&&<BottomNav active={scr==='result'?'scanner':scr} onNav={nav}/>}
        {scr==='home'&&<button onClick={()=>setChat(true)} className="absolute z-20 flex items-center gap-2 px-4 py-3 rounded-[16px] text-white" style={{background:'#2d6a4f',bottom:96,right:16}}><I n="chat" s={{fontSize:'20px'}}/><span className="text-sm font-medium">Ask WasteWise</span></button>}
        {scr==='result'&&<button onClick={()=>setChat(true)} className="absolute z-20 flex items-center gap-3 px-5 rounded-full shadow-lg" style={{background:'#78acff',color:'#003f7e',bottom:96,right:16,height:52}}><I n="smart_toy" f s={{fontSize:'22px'}}/><span className="font-semibold text-sm">Ask WasteWise</span></button>}
        {scr==='journey'&&<button onClick={()=>setChat(true)} className="absolute z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white" style={{background:'#2d6a4f',bottom:96,right:16}}><I n="eco" s={{fontSize:'24px'}}/></button>}
        <ChatModal open={chat} onClose={()=>setChat(false)}/>
        {showNotifModal&&<div className="absolute inset-0 z-[9999] flex items-end" style={{background:'rgba(0,0,0,.5)'}} onClick={handleDismissNotif}>
          <div className="bg-white rounded-t-[32px] p-6 w-full" onClick={e=>e.stopPropagation()} style={{boxShadow:'0 -8px 32px rgba(0,0,0,.12)'}}>
            <span className="text-5xl text-center block">🌱</span>
            <h3 className="font-bold text-xl text-center mt-3" style={{color:'#151c22'}}>Stay on top of your waste journey</h3>
            <p className="text-sm text-center mt-2" style={{color:'#404943'}}>Get composting reminders, streak alerts and eco tips. No spam, ever.</p>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={handleAllowNotif} className="bg-[#2d6a4f] text-white w-full h-14 rounded-[24px] font-semibold">Allow Notifications 🔔</button>
              <button onClick={handleDismissNotif} className="bg-[#f6f9ff] w-full h-12 rounded-[24px] font-medium text-sm" style={{color:'#404943'}}>Maybe Later</button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}

export default App;
