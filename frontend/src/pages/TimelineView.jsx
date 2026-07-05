import React from 'react';
import useFetch from '../hooks/useFetch';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TimelineView = () => {
  const { data: revenue, loading } = useFetch('/reports/revenue');

  const total = revenue?.reduce((s, r) => s + parseFloat(r.net_flow), 0) || 0;
  const positive = revenue?.filter(r => parseFloat(r.net_flow) > 0).length || 0;

  return (
    <div className="p-6 space-y-6 animate-in">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="font-mono text-2xl font-semibold tracking-wider text-white">FINANCIAL FLUX TIMELINE</h2>
        <p className="font-mono text-sm text-secondary tracking-widest mt-1">AGGREGATED BANK-WIDE NET TRANSACTION FLOW</p>
      </div>

      {/* Summary cards */}
      {revenue && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'DATA POINTS',     value: revenue.length },
            { label: 'POSITIVE DAYS',   value: positive },
            { label: 'NET TOTAL ($)',    value: `${total >= 0 ? '+' : ''}${(total/1000).toFixed(1)}k` },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-white/[0.06] p-4">
              <p className="font-mono text-xs text-secondary tracking-widest">{s.label}</p>
              <p className={`font-mono text-2xl font-semibold mt-1 ${s.label === 'NET TOTAL ($)' ? (total >= 0 ? 'text-safe' : 'text-risk') : 'text-white'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="bg-surface border border-white/[0.06] p-5">
        <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase mb-4">Daily Net Cash Flow</p>
        <div className="h-96">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="font-mono text-sm text-secondary tracking-widest">LOADING DATA...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="flowGradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3fb950" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="#8b949e"
                  tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                  labelFormatter={d => new Date(d).toLocaleDateString()}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 4" />
                <Area type="monotone" dataKey="net_flow" name="Net Flow ($)" stroke="#3fb950" strokeWidth={1.5} fill="url(#flowGradPos)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
