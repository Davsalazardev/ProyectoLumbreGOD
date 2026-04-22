import React from 'react';

interface Props {
  value: number; // For example: bugs count
  type: 'bugs' | 'vulnerabilities' | 'smells';
  size?: 'sm' | 'md' | 'lg';
}

export const SonarRating: React.FC<Props> = ({ value, type, size = 'sm' }) => {
  let rating = 'A';
  let colorClass = 'bg-sonar-rating-a text-white border-transparent';
  
  if (type === 'bugs' || type === 'vulnerabilities') {
    if (value === 0) { rating = 'A'; colorClass = 'bg-sonar-rating-a text-white border-transparent'; }
    else if (value === 1) { rating = 'B'; colorClass = 'bg-sonar-rating-b text-white border-transparent'; }
    else if (value === 2) { rating = 'C'; colorClass = 'bg-sonar-rating-c text-white border-transparent'; }
    else if (value <= 4) { rating = 'D'; colorClass = 'bg-sonar-rating-d text-white border-transparent'; }
    else { rating = 'E'; colorClass = 'bg-sonar-rating-e text-white border-transparent'; }
  } else {
    // For smells/debt
    if (value <= 2) { rating = 'A'; colorClass = 'bg-sonar-rating-a text-white border-transparent'; }
    else if (value <= 5) { rating = 'B'; colorClass = 'bg-sonar-rating-b text-white border-transparent'; }
    else if (value <= 10) { rating = 'C'; colorClass = 'bg-sonar-rating-c text-white border-transparent'; }
    else if (value <= 20) { rating = 'D'; colorClass = 'bg-sonar-rating-d text-white border-transparent'; }
    else { rating = 'E'; colorClass = 'bg-sonar-rating-e text-white border-transparent'; }
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-lg'
  };

  return (
    <div 
      className={`inline-flex items-center justify-center font-bold rounded-sm border ${colorClass} ${sizeClasses[size]} shadow-sm`}
      title={`${value} ${type}`}
    >
      {rating}
    </div>
  );
};
