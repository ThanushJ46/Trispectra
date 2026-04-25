import React, { useState } from 'react';

function I({n,f,c='',s={}}){return <span className={`mi ${f?'mi-fill':''} ${c}`} style={s}>{n}</span>}

const CATEGORIES = [
  { value: 'wet_organic', label: 'Wet / Organic' },
  { value: 'dry_recyclable', label: 'Dry / Recyclable' },
  { value: 'e_waste', label: 'E-Waste' },
  { value: 'hazardous', label: 'Hazardous' },
  { value: 'medical', label: 'Medical' },
  { value: 'construction', label: 'Construction' },
  { value: 'sanitary', label: 'Sanitary' },
];

export default function CorrectionPanel({ items, onSave, onCancel }) {
  const [editedItems, setEditedItems] = useState(items.map(i => ({ ...i })));
  const [addName, setAddName] = useState('');
  const [addCat, setAddCat] = useState('dry_recyclable');

  const removeItem = (idx) => {
    setEditedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const changeCategory = (idx, newCat) => {
    setEditedItems(prev => prev.map((item, i) => i === idx ? { ...item, waste_category: newCat } : item));
  };

  const addItem = () => {
    if (!addName.trim()) return;
    setEditedItems(prev => [...prev, {
      item_name: addName.trim(),
      waste_category: addCat,
      confidence: 'medium',
      disposal_path: addCat === 'wet_organic' ? 'compost' : addCat === 'e_waste' ? 'sell' : 'collection_point',
      reason: 'Manually added by user',
      is_hazardous: addCat === 'hazardous',
    }]);
    setAddName('');
  };

  return (
    <div className="correction-panel space-y-4 anim">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-[#151c22] flex items-center gap-2">
          <I n="edit" s={{color:'#e65100',fontSize:'20px'}}/>
          Correct Results
        </h3>
        <button onClick={onCancel} className="text-sm text-[#404943] underline">Cancel</button>
      </div>
      <p className="text-sm text-[#404943]">Remove wrong items, edit categories, or add missed items.</p>

      {/* Existing items */}
      <div className="space-y-2">
        {editedItems.map((item, i) => (
          <div key={i} className="bg-white rounded-[14px] p-3 border border-[#bfc9c1]/30 flex items-center gap-2">
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#151c22] capitalize">{item.item_name}</p>
              <select value={item.waste_category} onChange={e => changeCategory(i, e.target.value)}
                className="mt-1 text-xs bg-[#f6f9ff] border border-[#bfc9c1]/50 rounded-lg px-2 py-1 outline-none">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
              <I n="close" s={{color:'#c62828',fontSize:'18px'}}/>
            </button>
          </div>
        ))}
      </div>

      {/* Add missed item */}
      <div className="bg-white rounded-[14px] p-3 border border-dashed border-[#bfc9c1]/60">
        <p className="text-xs text-[#404943] font-semibold mb-2">Add missed item</p>
        <div className="flex gap-2">
          <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Item name..."
            className="flex-1 bg-[#f6f9ff] rounded-lg border border-[#bfc9c1]/50 px-3 py-2 text-sm outline-none"/>
          <select value={addCat} onChange={e => setAddCat(e.target.value)}
            className="bg-[#f6f9ff] border border-[#bfc9c1]/50 rounded-lg px-2 py-2 text-xs outline-none">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <button onClick={addItem} disabled={!addName.trim()}
          className="mt-2 text-sm font-semibold text-[#2d6a4f] flex items-center gap-1 disabled:opacity-40">
          <I n="add_circle" s={{fontSize:'18px'}}/> Add Item
        </button>
      </div>

      {/* Save */}
      <button onClick={() => onSave(editedItems)}
        className="bg-[#2d6a4f] text-white w-full h-12 rounded-[20px] font-semibold text-sm"
        style={{boxShadow:'0 4px 12px rgba(45,106,79,0.25)'}}>
        Save Corrections & Recalculate Points
      </button>
    </div>
  );
}
