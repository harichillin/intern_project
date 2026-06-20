import React from 'react';
import useFetch from '../hooks/useFetch';
import { MetricCard } from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const Dashboard = () => {
  const { data, loading } = useFetch('/dashboard/stats');

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} />)}
      </div>
    );
  }

  const { metrics, segments, churnRisk } = data;

  return (
    <div className="space-y-8 p-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Intelligence Overview</h2>
          <p className="text-secondary mt-1">Real-time performance metrics and risk indicators</p>
        </div>
        <div className="bg-surface px-4 py-2 rounded-lg text-sm text-secondary border border-slate-700">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Customers" 
          value={metrics.totalCustomers.toLocaleString()} 
          icon={<Users />} 
          change="12" 
          isPositive={true} 
        />
        <MetricCard 
          title="Portfolio Balance" 
          value={`$${(metrics.totalBalance / 1000).toFixed(1)}k`} 
          icon={<DollarSign />} 
          change="4.5" 
          isPositive={true} 
        />
        <MetricCard 
          title="Avg Credit Score" 
          value={metrics.avgCreditScore} 
          icon={<CreditCard />} 
          change="1.2" 
          isPositive={false} 
        />
        <MetricCard 
          title="Critical Alerts" 
          value={metrics.openAlerts} 
          icon={<AlertTriangle />} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Segmentation */}
        <div className="lg:col-span-1 bg-surface p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-6">Customer Segments</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="segment"
                >
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {segments.map((s, idx) => (
              <div key={s.segment} className="flex items-center text-xs text-secondary">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                {s.segment}: {s.count}
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-6">Churn Probability Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={churnRisk}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="risk_level" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
