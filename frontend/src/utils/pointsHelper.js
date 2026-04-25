/**
 * pointsHelper.js — WasteWise points calculation + localStorage persistence
 * Provides gamification logic for demo mode when backend is unavailable.
 */

const STORAGE_KEY = 'wastewise-gamification';

const POINT_VALUES = {
  scan_complete: 10,
  per_item: 5,
  organic_item: 8,
  ewaste_item: 12,
  hazardous_item: 15,
  recyclable_item: 5,
  medical_item: 10,
  construction_item: 5,
  sanitary_item: 5,
  start_journey: 20,
  checkpoint_complete: 20,
  journey_complete: 100,
  vendor_selected: 20,
};

const BADGE_DEFS = [
  { id: 'compost_starter', name: 'Compost Starter', icon: '🌱', condition: 'Started composting journey' },
  { id: 'soil_saver', name: 'Soil Saver', icon: '🌍', condition: 'Completed composting journey' },
  { id: 'ewaste_hero', name: 'E-Waste Hero', icon: '♻️', condition: 'Safely disposed e-waste' },
  { id: 'recycling_rookie', name: 'Recycling Rookie', icon: '🔄', condition: 'Sorted recyclable waste' },
  { id: 'hazard_handler', name: 'Hazard Handler', icon: '⚠️', condition: 'Safely handled hazardous waste' },
];

const LEVELS = [
  { min: 0, name: 'Seedling', icon: '🌱' },
  { min: 100, name: 'Sprout', icon: '🌿' },
  { min: 300, name: 'Sapling', icon: '🌳' },
  { min: 600, name: 'Tree', icon: '🌲' },
  { min: 1000, name: 'Forest', icon: '🏞️' },
  { min: 2000, name: 'Ecosystem', icon: '🌎' },
];

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { totalPoints: 0, badges: [], checkpoints: {}, scanCount: 0, streak: 0, lastScanDate: null };
}

function saveStore(store) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
}

export function getLevel(points) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (points >= l.min) level = l;
  }
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx + 1] || null;
  return { ...level, nextLevel: next, progress: next ? ((points - level.min) / (next.min - level.min)) * 100 : 100 };
}

export function calculateScanPoints(items) {
  let points = POINT_VALUES.scan_complete;
  const breakdown = [{ label: 'Scan complete', points: POINT_VALUES.scan_complete }];

  for (const item of items) {
    points += POINT_VALUES.per_item;
    breakdown.push({ label: `Detected: ${item.item_name}`, points: POINT_VALUES.per_item });

    const cat = item.waste_category;
    if (cat === 'wet_organic') { points += POINT_VALUES.organic_item; breakdown.push({ label: 'Organic bonus', points: POINT_VALUES.organic_item }); }
    else if (cat === 'e_waste') { points += POINT_VALUES.ewaste_item; breakdown.push({ label: 'E-waste bonus', points: POINT_VALUES.ewaste_item }); }
    else if (cat === 'hazardous') { points += POINT_VALUES.hazardous_item; breakdown.push({ label: 'Hazardous bonus', points: POINT_VALUES.hazardous_item }); }
    else if (cat === 'dry_recyclable') { points += POINT_VALUES.recyclable_item; breakdown.push({ label: 'Recyclable bonus', points: POINT_VALUES.recyclable_item }); }
  }

  return { total: points, breakdown };
}

export function awardScanPoints(items) {
  const { total, breakdown } = calculateScanPoints(items);
  const store = getStore();
  store.totalPoints += total;
  store.scanCount += 1;

  // Streak
  const today = new Date().toDateString();
  if (store.lastScanDate) {
    const last = new Date(store.lastScanDate);
    const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
    if (diff === 1) store.streak += 1;
    else if (diff > 1) store.streak = 1;
  } else {
    store.streak = 1;
  }
  store.lastScanDate = today;

  // Auto-award badges based on categories
  const cats = new Set(items.map(i => i.waste_category));
  if (cats.has('dry_recyclable') && !store.badges.includes('recycling_rookie')) store.badges.push('recycling_rookie');
  if (cats.has('hazardous') && !store.badges.includes('hazard_handler')) store.badges.push('hazard_handler');
  if (cats.has('e_waste') && !store.badges.includes('ewaste_hero')) store.badges.push('ewaste_hero');

  saveStore(store);
  return { total, breakdown, newTotal: store.totalPoints, streak: store.streak };
}

export function awardPoints(amount, reason) {
  const store = getStore();
  store.totalPoints += amount;
  saveStore(store);
  return store.totalPoints;
}

export function awardBadge(badgeId) {
  const store = getStore();
  if (!store.badges.includes(badgeId)) {
    store.badges.push(badgeId);
    saveStore(store);
    return true;
  }
  return false;
}

export function getCheckpoints(category) {
  const store = getStore();
  return store.checkpoints[category] || {};
}

export function completeCheckpoint(category, day) {
  const store = getStore();
  if (!store.checkpoints[category]) store.checkpoints[category] = {};
  if (store.checkpoints[category][day]) return { alreadyDone: true, points: 0 };
  store.checkpoints[category][day] = { completedAt: new Date().toISOString() };
  store.totalPoints += POINT_VALUES.checkpoint_complete;
  saveStore(store);
  return { alreadyDone: false, points: POINT_VALUES.checkpoint_complete, newTotal: store.totalPoints };
}

export function getGameState() {
  const store = getStore();
  const level = getLevel(store.totalPoints);
  const badges = BADGE_DEFS.filter(b => store.badges.includes(b.id));
  return { ...store, level, earnedBadges: badges, allBadges: BADGE_DEFS };
}

export { POINT_VALUES, BADGE_DEFS, LEVELS };
