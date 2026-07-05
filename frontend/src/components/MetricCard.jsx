import React from 'react';

export const MetricCard = ({ title, value, icon, change, isPositive }) => (
  <div className="bg-surface border border-white/[0.06] p-5 hover:border-primary/30 hover:shadow-amber transition-all duration-200">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-primary/10 text-primary">
        {icon}
      </div>
      {change && (
        <span className={`font-mono text-[10px] tracking-wider px-2 py-0.5 ${
          isPositive ? 'bg-safe/10 text-safe' : 'bg-risk/10 text-risk'
        }`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <p className="font-mono text-[10px] text-secondary tracking-[0.15em] uppercase mb-1">{title}</p>
    <p className="font-mono text-2xl font-semibold text-white tracking-tight">{value}</p>
  </div>
);

export const StatusBadge = ({ type, value }) => {
  const getStyles = () => {
    switch (type) {
      case 'segment':
        if (value === 'Champions') return 'bg-primary/10 text-primary border-primary/20';
        if (value === 'At Risk')   return 'bg-risk/10 text-risk border-risk/20';
        if (value === 'Dormant')   return 'bg-secondary/10 text-secondary border-secondary/20';
        return 'bg-cyan/10 text-cyan border-cyan/20';
      case 'risk': {
        const score = parseFloat(value);
        if (score > 0.7) return 'bg-risk/10 text-risk border-risk/20';
        if (score > 0.4) return 'bg-primary/10 text-primary border-primary/20';
        return 'bg-safe/10 text-safe border-safe/20';
      }
      default:
        return 'bg-white/5 text-secondary border-white/10';
    }
  };

  return (
    <span className={`font-mono px-2 py-0.5 text-[9px] tracking-wider uppercase border ${getStyles()}`}>
      {value}
    </span>
  );
};
