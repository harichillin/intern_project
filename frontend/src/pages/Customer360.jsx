import React, { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { StatusBadge } from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search, RefreshCw, ChevronRight, Users, MapPin, Activity, ShieldAlert, TrendingDown, Star, AlertOctagon, UserCheck, Gift } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// AI Recommendation Engine — rule-based
const getRecommendations = (customer) => {
  const recs = [];
  const churn = parseFloat(customer.churn_probability);
  const fraud = parseFloat(customer.fraud_score);
  const seg   = customer.segment;
  const health = customer.relationship_health_score;

  if (fraud > 0.75)  recs.push({ icon: <AlertOctagon size={13}/>, label: 'CRITICAL', text: 'Freeze account & initiate fraud review immediately.', color: 'text-risk border-risk/30 bg-risk/5' });
  else if (fraud > 0.5) recs.push({ icon: <ShieldAlert size={13}/>, label: 'WARNING', text: 'Flag for manual transaction review within 24 hrs.', color: 'text-primary border-primary/30 bg-primary/5' });

  if (churn > 0.75)  recs.push({ icon: <TrendingDown size={13}/>, label: 'URGENT',  text: 'Assign dedicated relationship manager immediately.', color: 'text-risk border-risk/30 bg-risk/5' });
  else if (churn > 0.5) recs.push({ icon: <UserCheck size={13}/>, label: 'ACTION',  text: 'Offer loyalty incentive or promotional interest rate.', color: 'text-primary border-primary/30 bg-primary/5' });

  if (seg === 'Dormant')   recs.push({ icon: <Activity size={13}/>, label: 'ENGAGE',  text: 'Launch personalised re-engagement campaign.', color: 'text-cyan border-cyan/30 bg-cyan/5' });
  if (seg === 'Champions') recs.push({ icon: <Star size={13}/>,     label: 'UPSELL',  text: 'Offer premium tier upgrade or exclusive product.', color: 'text-safe border-safe/30 bg-safe/5' });
  if (seg === 'Potential') recs.push({ icon: <Gift size={13}/>,     label: 'NURTURE', text: 'Enrol in onboarding rewards to increase engagement.', color: 'text-cyan border-cyan/30 bg-cyan/5' });

  if (health < 40)   recs.push({ icon: <TrendingDown size={13}/>, label: 'LOW HEALTH', text: 'Schedule proactive wellness call with advisor.', color: 'text-primary border-primary/30 bg-primary/5' });

  if (recs.length === 0) recs.push({ icon: <UserCheck size={13}/>, label: 'STABLE', text: 'No immediate action required. Continue monitoring.', color: 'text-safe border-safe/30 bg-safe/5' });
  return recs;
};

// Build daily balance trend from transactions
const buildTimeline = (transactions) => {
  if (!transactions?.length) return [];
  const byDay = {};
  transactions.forEach(tx => {
    const day = new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    byDay[day] = (byDay[day] || 0) + (tx.type === 'credit' ? parseFloat(tx.amount) : -parseFloat(tx.amount));
  });
  return Object.entries(byDay).map(([date, net]) => ({ date, net: parseFloat(net.toFixed(2)) }));
};

const Customer360 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const { data: customers, loading, refetch } = useFetch(`/customers?search=${searchTerm}`, [searchTerm]);
  const { data: detail, loading: loadingDetail, refetch: refetchDetail } = useFetch(selectedId ? `/customers/${selectedId}` : null, [selectedId]);

  const handleRefreshPredict = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/customers/${id}/refresh`);
      refetchDetail();
      refetch();
    } catch {
      alert('Failed to sync with ML Service.');
    }
  };

  const timeline = detail ? buildTimeline(detail.history?.transactions) : [];
  const recommendations = detail ? getRecommendations(detail) : [];

  return (
    <div className="flex h-full min-h-[calc(100vh-3rem)] gap-4 p-4 animate-in">

      {/* Customer List */}
      <div className="w-72 shrink-0 bg-surface border border-white/[0.06] flex flex-col overflow-hidden">
        <div className="p-3 border-b border-white/[0.06]">
          <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-2">Search Customers</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-secondary" size={12} />
            <input
              type="text"
              placeholder="name..."
              className="w-full bg-surface-2 border border-white/[0.06] font-mono text-sm py-1.5 pl-8 pr-3 text-white placeholder-secondary/40 focus:border-primary/50 outline-none tracking-wide"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-3"><SkeletonLoader /></div> : customers?.map(c => (
            <div
              key={c.customer_id}
              onClick={() => setSelectedId(c.customer_id)}
              className={`px-3 py-2.5 border-b border-white/[0.04] cursor-pointer transition-all flex items-center justify-between group ${
                selectedId === c.customer_id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
              }`}
            >
              <div>
                <p className="font-mono text-sm text-white font-medium">{c.name}</p>
                <div className="mt-1"><StatusBadge type="segment" value={c.segment} /></div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-secondary">CHURN</p>
                <p className={`font-mono text-sm font-semibold ${c.churn_probability > 0.6 ? 'text-risk' : 'text-safe'}`}>
                  {(c.churn_probability * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {!selectedId ? (
          <div className="h-full bg-surface border border-white/[0.06] flex flex-col items-center justify-center text-secondary">
            <Users size={32} className="mb-3 opacity-20" />
            <p className="font-mono text-sm tracking-widest">SELECT A CUSTOMER TO VIEW 360 INTELLIGENCE</p>
          </div>
        ) : loadingDetail ? (
          <div className="bg-surface border border-white/[0.06] p-6"><SkeletonLoader /></div>
        ) : detail && (<>

          {/* Profile header */}
          <div className="bg-surface border border-white/[0.06] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center font-mono text-xl font-bold text-primary">
                  {detail.name[0]}
                </div>
                <div>
                  <h2 className="font-mono text-base font-semibold text-white">{detail.name}</h2>
                  <div className="flex items-center gap-3 font-mono text-xs text-secondary mt-1">
                    <span className="flex items-center gap-1"><MapPin size={9}/> {detail.city}</span>
                    <span className="flex items-center gap-1"><Activity size={9}/> AGE {detail.age}</span>
                    <StatusBadge type="segment" value={detail.segment} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRefreshPredict(detail.customer_id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-mono text-xs tracking-wider hover:bg-primary/20 transition-colors"
              >
                <RefreshCw size={11} /> SYNC ML
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'BALANCE',       value: `$${parseFloat(detail.account_balance).toLocaleString()}` },
                { label: 'CREDIT SCORE',  value: detail.credit_score },
                { label: 'HEALTH INDEX',  value: `${detail.relationship_health_score}/100` },
              ].map(s => (
                <div key={s.label} className="bg-surface-2 border border-white/[0.04] p-3">
                  <p className="font-mono text-xs text-secondary tracking-wider">{s.label}</p>
                  <p className="font-mono text-base font-semibold text-white mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk scores */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'CHURN PROBABILITY', score: detail.churn_probability, color: detail.churn_probability > 0.7 ? 'text-risk' : 'text-primary' },
              { label: 'FRAUD THREAT SCORE', score: detail.fraud_score, color: detail.fraud_score > 0.5 ? 'text-risk' : 'text-safe' },
            ].map(r => (
              <div key={r.label} className="bg-surface border border-white/[0.06] p-4">
                <p className="font-mono text-xs text-secondary tracking-widest mb-2">{r.label}</p>
                <p className={`font-mono text-3xl font-semibold ${r.color}`}>{(r.score * 100).toFixed(1)}%</p>
                <div className="mt-3 h-1 bg-white/[0.06]">
                  <div className={`h-full transition-all ${r.color.replace('text-', 'bg-')}`} style={{ width: `${r.score * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div className="bg-surface border border-white/[0.06] p-5">
            <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase mb-3">AI Recommendations</p>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className={`flex items-start gap-3 border px-3 py-2.5 ${rec.color}`}>
                  <span className="mt-0.5 shrink-0">{rec.icon}</span>
                  <div>
                    <span className="font-mono text-xs tracking-widest mr-2 opacity-70">[{rec.label}]</span>
                    <span className="font-mono text-sm">{rec.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Timeline */}
          {timeline.length > 0 && (
            <div className="bg-surface border border-white/[0.06] p-5">
              <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase mb-4">Transaction Flow Timeline</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline}>
                    <defs>
                      <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
                    <YAxis stroke="#8b949e" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono', fontSize: 10 }} />
                    <Area type="monotone" dataKey="net" name="Net Flow ($)" stroke="#22d3ee" strokeWidth={1.5} fill="url(#flowGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-surface border border-white/[0.06]">
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase">Recent Transactions</p>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['MERCHANT','TYPE','AMOUNT','DATE'].map(h => (
                    <th key={h} className="px-4 py-2.5 font-mono text-xs text-secondary tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.history.transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-sm text-white">{tx.merchant}</td>
                    <td className="px-4 py-2.5 font-mono text-sm capitalize text-secondary">{tx.type}</td>
                    <td className={`px-4 py-2.5 font-mono text-sm font-semibold ${tx.type === 'debit' ? 'text-risk' : 'text-safe'}`}>
                      {tx.type === 'debit' ? '-' : '+'}${tx.amount}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-secondary/60">{new Date(tx.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
      </div>
    </div>
  );
};

export default Customer360;
