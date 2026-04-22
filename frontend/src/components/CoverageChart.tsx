import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  coverage: number;
}

export const CoverageChart: React.FC<Props> = ({ coverage }) => {
  const data = [
    { name: 'Covered', value: coverage },
    { name: 'Uncovered', value: 100 - coverage }
  ];

  const color = coverage >= 80 ? '#10b981' : (coverage >= 50 ? '#f59e0b' : '#ef4444');

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={28}
            outerRadius={38}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-sm font-mono font-black text-white">{coverage.toFixed(1)}%</span>
      </div>
    </div>
  );
};
