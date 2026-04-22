import React from 'react';
import { QualityGateStatus } from '../types';

interface Props {
  status: QualityGateStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const QualityGateBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const passed = status === 'PASSED';
  const unknown = status === 'UNKNOWN';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded',
    md: 'px-3 py-1 text-sm font-semibold rounded',
    lg: 'px-6 py-2 text-base font-semibold rounded-md shadow-sm'
  };

  if (unknown) {
    return (
      <span className={`inline-block ${sizeClasses[size]} bg-slate-100 text-slate-500 border border-slate-200`}>
        NOT COMPUTED
      </span>
    );
  }

  return (
    <span
      className={`inline-block text-white ${sizeClasses[size]} ${
        passed
          ? 'bg-sonar-green'
          : 'bg-sonar-red'
      }`}
    >
      {passed ? 'PASSED' : 'FAILED'}
    </span>
  );
};
