'use client';

import { SIGNAL_CONFIG } from '@/lib/signal-config';

interface SignalBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export default function SignalBadge({ type, size = 'md' }: SignalBadgeProps) {
  const config = SIGNAL_CONFIG[type] || SIGNAL_CONFIG.hiring;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${config.color} ${sizeClass} font-medium`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
