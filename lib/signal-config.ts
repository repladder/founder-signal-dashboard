// Signal type definitions with labels and styling
export const SIGNAL_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  track_all: {
    icon: '🔥',
    label: 'Multiple Signals',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  funding: {
    icon: '💰',
    label: 'Funding',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  hiring_sales: {
    icon: '👔',
    label: 'Sales Hiring',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  hiring: {
    icon: '🎯',
    label: 'Hiring',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  new_role: {
    icon: '🆕',
    label: 'New Role',
    color: 'bg-teal-100 text-teal-700 border-teal-200'
  },
  launch: {
    icon: '🚀',
    label: 'Launch',
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  expansion: {
    icon: '🌍',
    label: 'Expansion',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  }
};

// Map keywords to signal types
export function detectSignalType(keyword: string): string {
  const keywordLower = keyword.toLowerCase();

  if (['raised', 'seed round', 'series a', 'series b', 'series c', 'funding', 'backed by', 'venture', 'investors', 'investment', 'closing our'].some(k => keywordLower.includes(k))) {
    return 'funding';
  }

  if (['hiring sdr', 'hiring ae', 'building sales team', 'first sales hire', 'account executive', 'sales development', 'sales manager', 'head of sales'].some(k => keywordLower.includes(k))) {
    return 'hiring_sales';
  }

  if (['excited to announce', 'thrilled to share', 'starting my new', 'joined', 'joining', 'new role', 'new position', 'new chapter', 'accepted a position', 'stepping into'].some(k => keywordLower.includes(k))) {
    return 'new_role';
  }

  if (['launching', 'just launched', 'now live', 'beta', 'new product', 'introducing', 'available now', 'officially live', 'proud to announce'].some(k => keywordLower.includes(k))) {
    return 'launch';
  }

  if (['expanding to', 'entering market', 'scaling operations', 'new office', 'international expansion', 'opening office', 'global expansion', 'new market'].some(k => keywordLower.includes(k))) {
    return 'expansion';
  }

  return 'hiring';
}
