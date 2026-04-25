/**
 * guideData.js — Local static guide data fallback
 * Used when backend /api/guides/category/{cat} is unreachable.
 */

export const CATEGORY_META = {
  wet_organic: { icon: 'compost', label: 'Wet / Organic Waste', color: '#2d6a4f', bg: '#e8f5e9', border: '#2d6a4f', action: 'Start composting journey', guideBtn: 'View Composting Guide' },
  dry_recyclable: { icon: 'recycling', label: 'Dry / Recyclable Waste', color: '#1565c0', bg: '#e3f2fd', border: '#1565c0', action: 'Clean and send to collection point', guideBtn: 'Find Recycling Vendors' },
  e_waste: { icon: 'devices', label: 'E-Waste', color: '#6a1b9a', bg: '#f3e5f5', border: '#6a1b9a', action: 'Sell, dismantle, or recycle safely', guideBtn: 'View E-Waste Guide' },
  hazardous: { icon: 'warning', label: 'Hazardous Waste', color: '#e65100', bg: '#fff3e0', border: '#e65100', action: 'Handle with care, special facility required', guideBtn: 'Hazardous Waste Safety' },
  medical: { icon: 'medical_services', label: 'Medical Waste', color: '#c62828', bg: '#ffebee', border: '#c62828', action: 'Separate and contact municipal collector', guideBtn: 'View Medical Guide' },
  construction: { icon: 'construction', label: 'Construction Waste', color: '#4e342e', bg: '#efebe9', border: '#4e342e', action: 'Sort materials and contact C&D facility', guideBtn: 'View Construction Guide' },
  sanitary: { icon: 'sanitizer', label: 'Sanitary Waste', color: '#283593', bg: '#e8eaf6', border: '#283593', action: 'Wrap and dispose separately', guideBtn: 'View Sanitary Guide' },
};

export const DISPOSAL_ICONS = {
  compost: 'compost',
  sell: 'sell',
  donate: 'volunteer_activism',
  collection_point: 'location_on',
  special_facility: 'settings',
};

export const CONFIDENCE_LABELS = {
  high: { label: '90%+ Confidence', color: '#2d6a4f', bg: '#e8f5e9' },
  medium: { label: '70–90% Confidence', color: '#e65100', bg: '#fff3e0' },
  low: { label: '<70% Confidence', color: '#c62828', bg: '#ffebee' },
};

// Points per category item
export const CATEGORY_POINTS = {
  wet_organic: 8,
  dry_recyclable: 5,
  e_waste: 12,
  hazardous: 15,
  medical: 10,
  construction: 5,
  sanitary: 5,
};
