import React from 'react';

export const MetricCard = ({ title, value, icon, change, isPositive }) => {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 hover:shadow-lg hover:shadow-primary/5 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-700/30 rounded-xl text-primary">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-safe/10 text-safe' : 'bg-risk/10 text-risk'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <h3 className="text-secondary text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1 text-white">{value}</p>
    </div>
  );
};

export const StatusBadge = ({ type, value }) => {
  const getStyles = () => {
    switch(type) {
      case 'segment':
        if (value === 'Champions') return 'bg-primary/10 text-primary border-primary/20';
        if (value === 'At Risk') return 'bg-risk/10 text-risk border-risk/20';
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'risk':
        const score = parseFloat(value);
        if (score > 0.7) return 'bg-risk/10 text-risk border-risk/20';
        if (score > 0.4) return 'bg-accent/10 text-accent border-accent/20';
        return 'bg-safe/10 text-safe border-safe/20';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {value}
    </span>
  );
};
