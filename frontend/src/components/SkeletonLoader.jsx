import React from 'react';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 animate-pulse">
        <div className="w-10 h-10 bg-slate-700 rounded-xl mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-slate-700/50 rounded-xl"></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
