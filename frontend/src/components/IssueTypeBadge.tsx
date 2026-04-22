import React from 'react';
import { IssueType } from '../types';

interface Props {
  type: IssueType;
}

const config: Record<IssueType, { label: string; icon: string; bg: string; text: string }> = {
  BUG: {
    label: 'Bug',
    icon: '🐛',
    bg: 'bg-red-950/40',
    text: 'text-red-300'
  },
  VULNERABILITY: {
    label: 'Vulnerabilidad',
    icon: '🔓',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300'
  },
  CODE_SMELL: {
    label: 'Código Sucio',
    icon: '🧹',
    bg: 'bg-slate-800/60',
    text: 'text-slate-300'
  }
};

export const IssueTypeBadge: React.FC<Props> = ({ type }) => {
  const c = config[type] || config.CODE_SMELL;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${c.bg} ${c.text}`}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
};
