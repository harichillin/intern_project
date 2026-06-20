import React from 'react';
import useFetch from '../hooks/useFetch';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TimelineView = () => {
  const { data: revenue, loading } = useFetch('/reports/revenue');

  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Financial Flux Timeline</h2>
        <p className="text-secondary mt-1">Aggregated bank-wide net transaction flow</p>
      </header>

      <div className="bg-surface p-8 rounded-2xl border border-slate-700/50">
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="colorFlux" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="net_flow" stroke="#10b981" fillOpacity={1} fill="url(#colorFlux)" name="Net Cash Flow" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
