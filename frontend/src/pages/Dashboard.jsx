import React from 'react';
import useFetch from '../hooks/useFetch';
import { MetricCard } from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, Legend,
} from 'recharts';
import { Users, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';

const SEGMENT_COLORS = {
  Champions: '#f0b429',
  Loyal:     '#22d3ee',
  Potential: '#3fb950',
  Dormant:   '#8b949e',
  'At Risk': '#f85149',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 px-3 py-2 font-mono text-[10px]">
      <p className="text-secondary tracking-wider mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="text-white">{p.value}</span></p>
      ))}
    </div>
  );
};

const HeatmapTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 px-3 py-2 font-mono text-[10px] max-w-[160px]">
      <p className="text-white truncate mb-1">{d.name}</p>
      <p className="text-secondary">Churn: <span className="text-primary">{(d.churn_probability * 100).toFixed(1)}%</span></p>
      <p className="text-secondary">Fraud: <span className="text-risk">{(d.fraud_score * 100).toFixed(1)}%</span></p>
      <p className="text-secondary">Segment: <span className="text-cyan">{d.segment}</span></p>
    </div>
  );
};

const Dashboard = () => {
  const { data, loading } = useFetch('/dashboard/stats');
  const { data: heatmapData } = useFetch('/dashboard/heatmap');

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4 p-6">
        {[1,2,3,4].map(i => <SkeletonLoader key={i} />)}
      </div>
    );
  }

  const { metrics, segments, churnRisk } = data;

  // Group heatmap points by segment for coloring
  const segmentGroups = heatmapData
    ? Object.entries(
        heatmapData.reduce((acc, c) => {
          (acc[c.segment] = acc[c.segment] || []).push(c);
          return acc;
        }, {})
      )
    : [];

  return (
    <div className="space-y-6 p-6 animate-in">

      {/* Page header */}
      <div className="flex justify-between items-end border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="font-mono text-lg font-semibold tracking-wider text-white">INTELLIGENCE OVERVIEW</h2>
          <p className="font-mono text-[10px] text-secondary tracking-widest mt-0.5">REAL-TIME PORTFOLIO METRICS + RISK INDICATORS</p>
        </div>
        <span className="font-mono text-[9px] text-secondary/50 tracking-widest border border-white/[0.06] px-3 py-1.5">
          UPDATED {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Total Customers"   value={metrics.totalCustomers.toLocaleString()} icon={<Users size={16}/>}         change="12"  isPositive={true} />
        <MetricCard title="Portfolio Balance" value={`$${(metrics.totalBalance/1e6).toFixed(2)}M`} icon={<DollarSign size={16}/>} change="4.5" isPositive={true} />
        <MetricCard title="Avg Credit Score"  value={metrics.avgCreditScore}                  icon={<CreditCard size={16}/>}    change="1.2" isPositive={false} />
        <MetricCard title="Open Alerts"       value={metrics.openAlerts}                      icon={<AlertTriangle size={16}/>} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Segment Donut */}
        <div className="bg-surface border border-white/[0.06] p-5">
          <p className="font-mono text-[10px] text-secondary tracking-[0.15em] uppercase mb-4">Customer Segments</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segments} dataKey="count" nameKey="segment" innerRadius={50} outerRadius={70} paddingAngle={3}>
                  {segments.map(s => (
                    <Cell key={s.segment} fill={SEGMENT_COLORS[s.segment] || '#8b949e'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {segments.map(s => (
              <div key={s.segment} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 shrink-0" style={{ backgroundColor: SEGMENT_COLORS[s.segment] || '#8b949e' }} />
                <span className="font-mono text-[9px] text-secondary truncate">{s.segment}: <span className="text-white">{s.count}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Risk Area */}
        <div className="lg:col-span-2 bg-surface border border-white/[0.06] p-5">
          <p className="font-mono text-[10px] text-secondary tracking-[0.15em] uppercase mb-4">Churn Risk Distribution</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={churnRisk}>
                <defs>
                  <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f0b429" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f0b429" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="risk_level" stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9 }} />
                <YAxis stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Customers" stroke="#f0b429" strokeWidth={1.5} fill="url(#churnGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Heatmap */}
      {heatmapData && heatmapData.length > 0 && (
        <div className="bg-surface border border-white/[0.06] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] text-secondary tracking-[0.15em] uppercase">Risk Heatmap — Churn vs Fraud</p>
              <p className="font-mono text-[9px] text-secondary/50 mt-0.5">Each dot = 1 customer · Colour = segment · Axis = risk score 0–1</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(SEGMENT_COLORS).map(([seg, color]) => (
                <div key={seg} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-mono text-[9px] text-secondary">{seg}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fraud_score"       name="Fraud Score"  type="number" domain={[0,1]} stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9 }} label={{ value: 'FRAUD SCORE', position: 'insideBottom', offset: -2, style: { fontFamily: 'JetBrains Mono', fontSize: 8, fill: '#8b949e' } }} />
                <YAxis dataKey="churn_probability" name="Churn Risk"   type="number" domain={[0,1]} stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9 }} label={{ value: 'CHURN', angle: -90, position: 'insideLeft', style: { fontFamily: 'JetBrains Mono', fontSize: 8, fill: '#8b949e' } }} />
                <ZAxis range={[12, 12]} />
                <Tooltip content={<HeatmapTooltip />} />
                {segmentGroups.map(([segment, points]) => (
                  <Scatter
                    key={segment}
                    name={segment}
                    data={points}
                    fill={SEGMENT_COLORS[segment] || '#8b949e'}
                    fillOpacity={0.7}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
