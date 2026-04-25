import re

with open('d:/code_space/Trispectra/frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace startJourney logic
old_start_journey = """  const startJourney = async () => {
    if (!phone.match(/^\+[1-9]\d{7,14}$/) || !user) {
      alert('Enter a valid phone number in format +91XXXXXXXXXX');
      return;
    }
    setStartingJourney(true);
    try {
      const r = await fetch(`${API}/api/reminder/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          phone,
          journey_start_date: new Date().toISOString(),
          waste_type: 'organic',
          items: [],
          primary_item: 'kitchen waste'
        })
      });
      if (r.ok) { setShowStartJourney(false); loadJourney(); }
      else { const d = await r.json(); alert(d.detail || 'Failed to start journey'); }
    } catch(e) { alert('Network error. Try again.'); }
    setStartingJourney(false);
  };"""

new_start_journey = """  const startJourney = async () => {
    if (!user) return;
    setStartingJourney(true);
    try {
      const r = await fetch(`${API}/api/reminder/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          journey_start_date: new Date().toISOString(),
          waste_type: 'organic',
          items: [],
          primary_item: 'kitchen waste'
        })
      });
      if (r.ok) { setShowStartJourney(false); loadJourney(); }
      else { const d = await r.json(); alert(d.detail || 'Failed to start journey'); }
    } catch(e) { alert('Network error. Try again.'); }
    setStartingJourney(false);
  };"""
content = content.replace(old_start_journey, new_start_journey)

old_ui = """        {showStartJourney ? (
          <div className="card mt-6">
            <h3 className="font-semibold text-lg mb-3">Start Your Journey</h3>
            <p className="text-sm text-[#404943] mb-3">Enter your WhatsApp number to get checkpoint reminders:</p>
            <input value={phone} onChange={e=>setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full border border-[#bfc9c1] rounded-[16px] px-4 py-3 text-sm outline-none mb-4"/>
            <button onClick={startJourney} disabled={startingJourney}
              className="bg-[#2d6a4f] text-white w-full h-12 rounded-[20px] font-semibold disabled:opacity-50">
              {startingJourney ? 'Starting...' : 'Begin Journey + Enable WhatsApp Reminders 🌱'}
            </button>
          </div>
        ) : ("""

new_ui = """        {showStartJourney ? (
          <div className="card mt-6">
            <h3 className="font-semibold text-lg mb-3">Start Your Journey</h3>
            <p className="text-sm text-[#404943] mb-3">You will receive notifications here on the app for each checkpoint.</p>
            <button onClick={startJourney} disabled={startingJourney}
              className="bg-[#2d6a4f] text-white w-full h-12 rounded-[20px] font-semibold disabled:opacity-50">
              {startingJourney ? 'Starting...' : 'Begin Journey 🌱'}
            </button>
          </div>
        ) : ("""
content = content.replace(old_ui, new_ui)

with open('d:/code_space/Trispectra/frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
