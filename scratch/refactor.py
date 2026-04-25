import re

with open("frontend/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add UID and API_BASE
inject = """
const API_BASE = 'http://localhost:8000';
function getUid() {
  let uid = localStorage.getItem('wastewise_uid');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('wastewise_uid', uid);
  }
  return uid;
}
const UID = getUid();
"""
content = content.replace("const {useState,useEffect,useRef}=React;", "const {useState,useEffect,useRef}=React;\n" + inject)


# 2. HomeScreen
home_old = """function HomeScreen({onNav,lang,setLang}){
const t=T[lang];
return(<div className="pt-20 px-5 pb-[100px] space-y-4 max-w-md mx-auto">"""

home_new = """function HomeScreen({onNav,lang,setLang}){
const t=T[lang];
const [stats, setStats] = useState({ total_points: 0, streak_days: 0, trees_equivalent: 0, bottles_rescued: 0, kg_diverted: 0, items_disposed: 0 });
useEffect(() => {
  fetch(`${API_BASE}/api/user/${UID}/stats`)
    .then(res => res.json())
    .then(data => { if (!data.message || data.total_points !== undefined) setStats(data); })
    .catch(console.error);
}, []);
return(<div className="pt-20 px-5 pb-[100px] space-y-4 max-w-md mx-auto">"""

content = content.replace(home_old, home_new)

content = content.replace('<span className="font-bold text-[#e8a020]">8-day streak</span>', '<span className="font-bold text-[#e8a020]">{stats.streak_days}-day streak</span>')
content = content.replace('<text x="80" y="75" textAnchor="middle" className="text-2xl font-bold" fill="#151c22">75%</text>', '<text x="80" y="75" textAnchor="middle" className="text-2xl font-bold" fill="#151c22">{stats.total_points}</text>')
content = content.replace('<text x="80" y="95" textAnchor="middle" className="text-sm" fill="#404943">Goal</text>', '<text x="80" y="95" textAnchor="middle" className="text-sm" fill="#404943">Points</text>')
content = content.replace('<p className="text-[#404943]">3 of 4 items properly sorted.</p>', '<p className="text-[#404943]">{stats.items_disposed} items properly sorted.</p>')
content = content.replace('<p className="text-[#2d6a4f] font-semibold text-sm mt-1">You prevented ~0.5 kg waste from landfill</p>', '<p className="text-[#2d6a4f] font-semibold text-sm mt-1">You prevented ~{stats.kg_diverted} kg waste from landfill</p>')
content = content.replace('<span className="text-xl font-semibold">12</span>', '<span className="text-xl font-semibold">{stats.items_disposed}</span>')
content = content.replace('["🌳 3 trees saved","♻️ 47 bottles","🗑️ 12.4 kg diverted"]', '[`🌳 ${stats.trees_equivalent} trees saved`,`♻️ ${stats.bottles_rescued} bottles`,`🗑️ ${stats.kg_diverted} kg diverted`]')


# 3. UploadPreviewScreen
upload_old = """const analyse=()=>{setLoading(true);setTimeout(()=>{setLoading(false);onNav('result');},2000);};"""
upload_new = """const analyse=()=>{
  setLoading(true);
  fetch(`${API_BASE}/api/vision/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: UID, image_base64: imgUrl })
  })
  .then(r => r.json())
  .then(data => {
    setLoading(false);
    onNav('result', data);
  })
  .catch(e => {
    console.error(e);
    setLoading(false);
    alert('Analysis failed');
  });
};"""
content = content.replace(upload_old, upload_new)

# 4. ResultScreen
result_old = """function ResultScreen({onNav,onChat}){
return(<div className="pt-20 px-5 space-y-4 pb-44">"""
result_new = """function ResultScreen({onNav,onChat,analysis}){
const item = analysis?.items?.[0] || { item_name: 'Unknown', waste_category: 'dry_recyclable', confidence: 'low', reason: 'Failed to analyze' };
const confMap = { 'high': 92, 'medium': 65, 'low': 35 };
const confPct = confMap[item.confidence] || 92;
const isOrganic = item.waste_category === 'wet_organic';

const startJourney = () => {
  const phone = prompt("Enter phone number for WhatsApp reminders:", "+919876543210");
  if(!phone) return;
  fetch(`${API_BASE}/api/reminder/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: UID, phone, journey_start_date: new Date().toISOString(), waste_type: 'organic', items: [item.item_name], primary_item: item.item_name })
  }).then(() => onNav('journey')).catch(console.error);
};

return(<div className="pt-20 px-5 space-y-4 pb-44">"""
content = content.replace(result_old, result_new)

content = content.replace('<h2 className="text-2xl font-semibold text-[#151c22]">Banana Peel</h2>', '<h2 className="text-2xl font-semibold text-[#151c22]" style={{textTransform:"capitalize"}}>{item.item_name}</h2>')
content = content.replace('<span className="flex items-center gap-1 bg-[#b1f0ce] text-[#0f5238] text-xs font-semibold px-3 py-1 rounded-full"><I n="compost" s={{fontSize:\'14px\'}}/>Organic</span>', '<span className="flex items-center gap-1 bg-[#b1f0ce] text-[#0f5238] text-xs font-semibold px-3 py-1 rounded-full"><I n="compost" s={{fontSize:\'14px\'}}/>{item.waste_category.replace("_", " ")}</span>')
content = content.replace('<span className="text-sm text-[#404943]">92% Confidence</span>', '<span className="text-sm text-[#404943]">{confPct}% Confidence</span>')
content = content.replace('<p className="text-lg text-[#151c22]">Add to compost bin (Day 1)</p>', '<p className="text-lg text-[#151c22]">{isOrganic ? "Add to compost bin (Day 1)" : "Dispose carefully"}</p>')
content = content.replace('<button onClick={()=>onNav(\'journey\')} className="bg-[#2d6a4f] text-white w-full h-14 rounded-[24px] font-semibold mt-4 text-base">Start 21-Day Journey →</button>', '{isOrganic && <button onClick={startJourney} className="bg-[#2d6a4f] text-white w-full h-14 rounded-[24px] font-semibold mt-4 text-base">Start 21-Day Journey →</button>}')
content = content.replace('{["Biodegradable material","Breaks down naturally without chemical processing"].map(t=>(<div key={t} className="flex items-start gap-2 mb-2"><I n="check_circle" s={{color:\'#0f5238\',fontSize:\'20px\'}}/><span className="text-[#404943] text-sm">{t}</span></div>))}', '<div className="flex items-start gap-2 mb-2"><I n="check_circle" s={{color:\'#0f5238\',fontSize:\'20px\'}}/><span className="text-[#404943] text-sm">{item.reason}</span></div>')

# 5. LeaderboardScreen
leader_old = """function LeaderboardScreen(){
const rows=[{r:1,n:'Sarah J.',b:'Compost Master',bg:'#e8f5e9',bc:'#0f5238',p:'3,420',ab:'#f59e0b',i:'S'},{r:2,n:'Michael T.',b:'E-Waste Hero',bg:'#e3f2fd',bc:'#1f5eac',p:'2,890',ab:'#64748b',i:'M'},{r:3,n:'Elena R.',b:'Zero Waster',bg:'#e0f2f1',bc:'#0f5238',p:'2,150',ab:'#f87171',i:'E'}];
return(<div className="pt-20 px-5 pb-[100px] space-y-4">"""

leader_new = """function LeaderboardScreen(){
const [rows, setRows] = useState([]);
const [myStats, setMyStats] = useState({ total_points: 0, kg_diverted: 0, bottles_rescued: 0 });
useEffect(() => {
  fetch(`${API_BASE}/api/leaderboard`).then(r => r.json()).then(d => {
    const rws = (d.leaderboard || []).map((u, idx) => ({ r: idx+1, n: u.uid, b: 'Member', bg: '#e8f5e9', bc: '#0f5238', p: u.total_points, ab: ['#f59e0b','#64748b','#f87171','#3b82f6','#10b981'][idx%5], i: u.uid[u.uid.length-1].toUpperCase() }));
    setRows(rws);
  }).catch(console.error);
  fetch(`${API_BASE}/api/user/${UID}/stats`).then(r => r.json()).then(d => { if (!d.message || d.total_points !== undefined) setMyStats(d); }).catch(console.error);
}, []);
return(<div className="pt-20 px-5 pb-[100px] space-y-4">"""

content = content.replace(leader_old, leader_new)
content = content.replace('<span className="text-4xl font-black text-[#151c22] mt-1">1,204</span>', '<span className="text-4xl font-black text-[#151c22] mt-1">{myStats.total_points}</span>')
content = content.replace('<span className="bg-[#e8f5e9] text-xs px-2 py-0.5 rounded-full">🌱 850</span><span className="bg-[#e3f2fd] text-xs px-2 py-0.5 rounded-full">♻ 354</span>', '<span className="bg-[#e8f5e9] text-xs px-2 py-0.5 rounded-full">🗑️ {myStats.kg_diverted} kg</span><span className="bg-[#e3f2fd] text-xs px-2 py-0.5 rounded-full">♻ {myStats.bottles_rescued}</span>')
content = content.replace('<div className="flex items-center gap-3 bg-[#f0fdf4] rounded-[16px] px-3 py-2"><span className="text-xl font-bold text-[#151c22] w-8">42</span><div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{background:\'#2d6a4f\'}}>Y</div><div className="flex-1"><p className="font-semibold text-[#2d6a4f]">You</p><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#e8f5e9] text-[#0f5238]">Growing Green</span></div><div className="text-right"><span className="text-xl font-bold text-[#2d6a4f]">1,204</span><br/><span className="text-xs text-[#404943]">pts</span></div></div>', '<div className="flex items-center gap-3 bg-[#f0fdf4] rounded-[16px] px-3 py-2"><span className="text-xl font-bold text-[#151c22] w-8">-</span><div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{background:\'#2d6a4f\'}}>Y</div><div className="flex-1"><p className="font-semibold text-[#2d6a4f]">You</p><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#e8f5e9] text-[#0f5238]">Current User</span></div><div className="text-right"><span className="text-xl font-bold text-[#2d6a4f]">{myStats.total_points}</span><br/><span className="text-xs text-[#404943]">pts</span></div></div>')

# 6. JourneyScreen
journey_old = """function JourneyScreen(){
const [done,setDone]=useState({1:true,2:true});const [celeb,setCeleb]=useState(false);
const isDone3=done[3]||false;const progress=isDone3?47:33;
const mark=()=>{setDone(p=>({...p,3:true}));setCeleb(true);setTimeout(()=>setCeleb(false),2000);};"""

journey_new = """function JourneyScreen(){
const [done,setDone]=useState({});const [celeb,setCeleb]=useState(false);
const [journey,setJourney]=useState(null);

useEffect(() => {
  fetch(`${API_BASE}/api/reminder/${UID}`).then(r => r.json()).then(d => {
    if(d.journey) {
      setJourney(d.journey);
      const checks = d.journey.checkpoints || {};
      const newDone = {};
      for(let day in checks) if(checks[day].status === 'completed') newDone[day] = true;
      setDone(newDone);
    }
  }).catch(console.error);
}, []);

const progress = Math.min(100, Math.round((Object.keys(done).length / 4) * 100));

const mark=(day)=>{
  fetch(`${API_BASE}/api/user/${UID}/checkpoint`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ day, status: 'completed' })
  }).then(r => r.json()).then(d => {
    setCeleb(true); setTimeout(() => setCeleb(false), 2000);
    setDone(p => ({ ...p, [day]: true }));
  }).catch(console.error);
};"""

content = content.replace(journey_old, journey_new)
content = content.replace('const sd=done[s.day];const isA=s.active&&!sd;const isL=s.locked;', 'const sd=done[s.day];const isL=s.locked;const isA=!sd&&!isL;')
content = content.replace('<button onClick={mark} className="bg-[#2d6a4f] text-white w-full h-12 rounded-[20px] font-semibold mt-4">Mark as Complete</button>', '<button onClick={()=>mark(s.day)} className="bg-[#2d6a4f] text-white w-full h-12 rounded-[20px] font-semibold mt-4">Mark as Complete</button>')
content = content.replace('<span className="font-semibold text-[#151c22]">Day 7 of 21</span>', '<span className="font-semibold text-[#151c22]">Journey Progress</span>')

# 7. App
app_old = """function App(){
const [scr,setScr]=useState('home');const [chat,setChat]=useState(false);const [lang,setLang]=useState('en');const [imgUrl,setImgUrl]=useState(null);
const [showNotifModal,setShowNotifModal]=useState(false);
const fileRef=useRef(null);
useEffect(()=>{
const alreadyGranted=localStorage.getItem('notif-granted');"""

app_new = """function App(){
const [scr,setScr]=useState('home');const [chat,setChat]=useState(false);const [lang,setLang]=useState('en');const [imgUrl,setImgUrl]=useState(null);
const [showNotifModal,setShowNotifModal]=useState(false);
const [analysis, setAnalysis]=useState(null);
const fileRef=useRef(null);
useEffect(()=>{
const alreadyGranted=localStorage.getItem('notif-granted');"""
content = content.replace(app_old, app_new)

nav_old = """const nav=(id)=>{if(id==='chat'){setChat(true);return;}if(id==='map'||id==='profile')return;setScr(id);};"""
nav_new = """const nav=(id, data)=>{if(id==='chat'){setChat(true);return;}if(id==='map'||id==='profile')return;if(data)setAnalysis(data);setScr(id);};"""
content = content.replace(nav_old, nav_new)

content = content.replace("{scr==='result'&&<ResultScreen onNav={nav} onChat={()=>setChat(true)}/>}", "{scr==='result'&&<ResultScreen onNav={nav} onChat={()=>setChat(true)} analysis={analysis}/>}")

with open("frontend/index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
