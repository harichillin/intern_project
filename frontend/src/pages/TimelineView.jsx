import React from 'react';
import useFetch from '../hooks/useFetch';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';

const TimelineView = () => {
  const { data: revenue, loading: loadingRevenue } = useFetch('/reports/revenue');
  const { data: cities, loading: loadingCities }   = useFetch('/reports/city-breakdown');

  const total    = revenue?.reduce((s, r) => s + parseFloat(r.net_flow), 0) || 0;
  const positive = revenue?.filter(r => parseFloat(r.net_flow) > 0).length || 0;

  return (
    <div className="p-6 space-y-6 animate-in">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="font-mono text-2xl font-semibold tracking-wider text-white">FINANCIAL FLUX TIMELINE</h2>
        <p className="font-mono text-sm text-secondary tracking-widest mt-1">AGGREGATED BANK-WIDE NET TRANSACTION FLOW</p>
      </div>

      {/* Summary */}
      {revenue && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'DATA POINTS',   value: revenue.length },
            { label: 'POSITIVE DAYS', value: positive },
            { label: 'NET TOTAL',     value: `${total >= 0 ? '+' : ''}$${(total/1000).toFixed(1)}k` },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-white/[0.06] p-4">
              <p className="font-mono text-xs text-secondary tracking-widest">{s.label}</p>
              <p className={`font-mono text-2xl font-semibold mt-1 ${s.label === 'NET TOTAL' ? (total >= 0 ? 'text-safe' : 'text-risk') : 'text-white'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Net Cash Flow chart */}
      <div className="bg-surface border border-white/[0.06] p-5">
        <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase mb-4">Daily Net Cash Flow</p>
        <div className="h-72">
          {loadingRevenue ? (
            <div className="h-full flex items-center justify-center font-mono text-xs text-secondary">LOADING...</div>
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
                <XAxis dataKey="date" stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                  labelFormatter={d => new Date(d).toLocaleDateString()} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 4" />
                <Area type="monotone" dataKey="net_flow" name="Net Flow ($)" stroke="#3fb950" strokeWidth={1.5} fill="url(#flowGradPos)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* City Breakdown */}
      <div className="bg-surface border border-white/[0.06] p-5">
        <div className="mb-4">
          <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase">Geographic Risk Breakdown — Top 20 Cities</p>
          <p className="font-mono text-xs text-secondary/50 mt-1">Ranked by average churn probability · Bar = avg churn · Red tint = at-risk count</p>
        </div>
        <div className="h-80">
          {loadingCities ? (
            <div className="h-full flex items-center justify-center font-mono text-xs text-secondary">LOADING...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cities} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0,1]} stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="city" stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} width={75} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                  formatter={(v, name) => [`${(v*100).toFixed(1)}%`, name]}
                />
                <Bar dataKey="avg_churn" name="Avg Churn" radius={0}>
                  {cities?.map((entry, i) => (
                    <Cell key={i} fill={entry.avg_churn > 0.6 ? '#f85149' : entry.avg_churn > 0.4 ? '#f0b429' : '#3fb950'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* City table */}
        {cities && (
          <div className="mt-4 border border-white/[0.06]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['CITY','CUSTOMERS','AVG CHURN','AVG FRAUD','AT RISK'].map(h => (
                    <th key={h} className="px-4 py-2.5 font-mono text-xs text-secondary tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cities.slice(0, 10).map((c, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-sm text-white">{c.city}</td>
                    <td className="px-4 py-2.5 font-mono text-sm text-secondary">{c.total_customers}</td>
                    <td className={`px-4 py-2.5 font-mono text-sm font-semibold ${c.avg_churn > 0.6 ? 'text-risk' : c.avg_churn > 0.4 ? 'text-primary' : 'text-safe'}`}>
                      {(c.avg_churn * 100).toFixed(1)}%
                    </td>
                    <td className={`px-4 py-2.5 font-mono text-sm font-semibold ${c.avg_fraud > 0.5 ? 'text-risk' : 'text-safe'}`}>
                      {(c.avg_fraud * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-risk">{c.at_risk_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
