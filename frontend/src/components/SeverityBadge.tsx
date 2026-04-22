import React from 'react';
import { Severity } from '../types';

interface Props {
  severity: Severity;
  count?: number;
}

const config: Record<Severity, { label: string; bg: string; text: string; dot: string }> = {
  CRITICAL: {
    label: 'Crítico',
    bg: 'bg-red-950/60',
    text: 'text-red-400',
    dot: 'bg-red-500'
  },
  MAJOR: {
    label: 'Mayor',
    bg: 'bg-orange-950/60',
    text: 'text-orange-400',
    dot: 'bg-orange-500'
  },
  MINOR: {
    label: 'Menor',
    bg: 'bg-yellow-950/60',
    text: 'text-yellow-400',
    dot: 'bg-yellow-500'
  },
  INFO: {
    label: 'Info',
    bg: 'bg-blue-950/60',
    text: 'text-blue-400',
    dot: 'bg-blue-500'
  }
};

export const SeverityBadge: React.FC<Props> = ({ severity, count }) => {
  const c = config[severity] || config.INFO;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
      {count !== undefined && <span className="ml-1 opacity-70">({count})</span>}
    </span>
  );
};
