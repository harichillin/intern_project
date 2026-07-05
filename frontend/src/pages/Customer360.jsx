import React, { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { StatusBadge } from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  Search, RefreshCw, ChevronRight, Users, MapPin, Activity,
  ShieldAlert, TrendingDown, Star, AlertOctagon, UserCheck, Gift,
  StickyNote, Ticket, Send, Trash2, CheckSquare, Square, PhoneCall,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// ── AI Recommendation Engine ──────────────────────────────────────────────────
const getRecommendations = (c) => {
  const recs = [];
  const churn = parseFloat(c.churn_probability);
  const fraud = parseFloat(c.fraud_score);
  if (fraud > 0.75)  recs.push({ icon: <AlertOctagon size={13}/>, label: 'CRITICAL', text: 'Freeze account & initiate fraud review immediately.', color: 'text-risk border-risk/30 bg-risk/5' });
  else if (fraud > 0.5) recs.push({ icon: <ShieldAlert size={13}/>, label: 'WARNING', text: 'Flag for manual transaction review within 24 hrs.', color: 'text-primary border-primary/30 bg-primary/5' });
  if (churn > 0.75)  recs.push({ icon: <TrendingDown size={13}/>, label: 'URGENT',  text: 'Assign dedicated relationship manager immediately.', color: 'text-risk border-risk/30 bg-risk/5' });
  else if (churn > 0.5) recs.push({ icon: <UserCheck size={13}/>, label: 'ACTION',  text: 'Offer loyalty incentive or promotional interest rate.', color: 'text-primary border-primary/30 bg-primary/5' });
  if (c.segment === 'Dormant')   recs.push({ icon: <Activity size={13}/>, label: 'ENGAGE',  text: 'Launch personalised re-engagement campaign.', color: 'text-cyan border-cyan/30 bg-cyan/5' });
  if (c.segment === 'Champions') recs.push({ icon: <Star size={13}/>,     label: 'UPSELL',  text: 'Offer premium tier upgrade or exclusive product.', color: 'text-safe border-safe/30 bg-safe/5' });
  if (c.segment === 'Potential') recs.push({ icon: <Gift size={13}/>,     label: 'NURTURE', text: 'Enrol in onboarding rewards to increase engagement.', color: 'text-cyan border-cyan/30 bg-cyan/5' });
  if (c.relationship_health_score < 40) recs.push({ icon: <TrendingDown size={13}/>, label: 'LOW HEALTH', text: 'Schedule proactive wellness call with advisor.', color: 'text-primary border-primary/30 bg-primary/5' });
  if (!recs.length) recs.push({ icon: <UserCheck size={13}/>, label: 'STABLE', text: 'No immediate action required. Continue monitoring.', color: 'text-safe border-safe/30 bg-safe/5' });
  return recs;
};

const buildTimeline = (txs) => {
  if (!txs?.length) return [];
  const byDay = {};
  txs.forEach(tx => {
    const day = new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    byDay[day] = (byDay[day] || 0) + (tx.type === 'credit' ? parseFloat(tx.amount) : -parseFloat(tx.amount));
  });
  return Object.entries(byDay).map(([date, net]) => ({ date, net: parseFloat(net.toFixed(2)) }));
};

const OUTREACH_LABELS = { none: 'None', contacted: 'Contacted', in_progress: 'In Progress', resolved: 'Resolved' };
const OUTREACH_COLORS = { none: 'text-secondary', contacted: 'text-cyan', in_progress: 'text-primary', resolved: 'text-safe' };

// ── Notes Component ───────────────────────────────────────────────────────────
const NotesSection = ({ customerId }) => {
  const { data: notes, refetch } = useFetch(`/customers/${customerId}/notes`, [customerId]);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await axios.post(`${API}/customers/${customerId}/notes`, { note: text });
    setText('');
    setSaving(false);
    refetch();
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API}/notes/${id}`);
    refetch();
  };

  return (
    <div className="bg-surface border border-white/[0.06] p-5">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote size={14} className="text-primary" />
        <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase">Customer Notes</p>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a note... (Enter to save)"
          className="flex-1 bg-surface-2 border border-white/[0.06] font-mono text-sm py-2 px-3 text-white placeholder-secondary/40 focus:border-primary/50 outline-none"
        />
        <button onClick={submit} disabled={saving || !text.trim()} className="px-3 py-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40">
          <Send size={14} />
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {notes?.length === 0 && <p className="font-mono text-xs text-secondary/50 text-center py-3">No notes yet.</p>}
        {notes?.map(n => (
          <div key={n.id} className="flex items-start justify-between gap-3 bg-surface-2 border border-white/[0.04] px-3 py-2.5">
            <div>
              <p className="font-mono text-sm text-white">{n.note}</p>
              <p className="font-mono text-xs text-secondary/50 mt-1">{n.created_by} · {new Date(n.created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => deleteNote(n.id)} className="text-secondary/40 hover:text-risk transition-colors shrink-0 mt-0.5">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Support Tickets Component ─────────────────────────────────────────────────
const TicketsSection = ({ tickets }) => (
  <div className="bg-surface border border-white/[0.06]">
    <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
      <Ticket size={14} className="text-primary" />
      <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase">Support Tickets</p>
      <span className="ml-auto font-mono text-xs text-secondary">{tickets?.length || 0} tickets</span>
    </div>
    {!tickets?.length ? (
      <p className="font-mono text-xs text-secondary/50 text-center py-6">No support tickets.</p>
    ) : (
      <div className="divide-y divide-white/[0.03]">
        {tickets.map((t, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <p className="font-mono text-sm text-white flex-1 pr-4">{t.issue}</p>
            <span className={`font-mono text-xs px-2 py-0.5 border ${t.status === 'open' ? 'text-risk border-risk/30 bg-risk/5' : 'text-safe border-safe/30 bg-safe/5'}`}>
              {t.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Customer360 = () => {
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedId, setSelectedId]   = useState(null);
  const [activeTab, setActiveTab]     = useState('overview');
  const [selected, setSelected]       = useState(new Set());
  const [outreachStatus, setOutreachStatus] = useState('contacted');
  const [bulkDone, setBulkDone]       = useState(false);

  const { data: customers, loading, refetch } = useFetch(`/customers?search=${searchTerm}`, [searchTerm]);
  const { data: detail, loading: loadingDetail, refetch: refetchDetail } = useFetch(
    selectedId ? `/customers/${selectedId}` : null, [selectedId]
  );

  const handleRefreshPredict = async (id) => {
    try {
      await axios.post(`${API}/customers/${id}/refresh`);
      refetchDetail(); refetch();
    } catch { alert('Failed to sync with ML Service.'); }
  };

  const toggleSelect = (id) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const handleBulkOutreach = async () => {
    await axios.post(`${API}/customers/bulk-outreach`, {
      customer_ids: [...selected],
      status: outreachStatus,
    });
    setBulkDone(true);
    setSelected(new Set());
    refetch();
    setTimeout(() => setBulkDone(false), 3000);
  };

  const timeline = detail ? buildTimeline(detail.history?.transactions) : [];
  const recs = detail ? getRecommendations(detail) : [];
  const tabs = ['overview', 'tickets', 'notes'];

  return (
    <div className="flex h-full min-h-[calc(100vh-3rem)] gap-4 p-4 animate-in">

      {/* ── Customer List ───────────────────────────────────────────── */}
      <div className="w-72 shrink-0 bg-surface border border-white/[0.06] flex flex-col overflow-hidden">
        <div className="p-3 border-b border-white/[0.06]">
          <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-2">Search Customers</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-secondary" size={13} />
            <input
              type="text"
              placeholder="name..."
              className="w-full bg-surface-2 border border-white/[0.06] font-mono text-sm py-2 pl-8 pr-3 text-white placeholder-secondary/40 focus:border-primary/50 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Bulk outreach bar */}
        {selected.size > 0 && (
          <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
            <span className="font-mono text-xs text-primary">{selected.size} selected</span>
            <select value={outreachStatus} onChange={e => setOutreachStatus(e.target.value)}
              className="ml-auto bg-surface border border-white/[0.08] font-mono text-xs text-white px-2 py-0.5 outline-none">
              {Object.entries(OUTREACH_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button onClick={handleBulkOutreach}
              className="px-2 py-0.5 bg-primary text-black font-mono text-xs font-semibold hover:bg-primary/80 transition-colors">
              <PhoneCall size={11} />
            </button>
          </div>
        )}
        {bulkDone && (
          <div className="px-3 py-1.5 bg-safe/10 border-b border-safe/20">
            <p className="font-mono text-xs text-safe">Outreach status updated.</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-3"><SkeletonLoader /></div> : customers?.map(c => (
            <div key={c.customer_id}
              className={`px-3 py-2.5 border-b border-white/[0.04] cursor-pointer transition-all flex items-center gap-2 group ${
                selectedId === c.customer_id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
              }`}
            >
              {/* Checkbox for bulk select */}
              <button onClick={e => { e.stopPropagation(); toggleSelect(c.customer_id); }}
                className="text-secondary/40 hover:text-primary transition-colors shrink-0">
                {selected.has(c.customer_id) ? <CheckSquare size={13} className="text-primary" /> : <Square size={13} />}
              </button>
              <div className="flex-1 min-w-0" onClick={() => setSelectedId(c.customer_id)}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-white font-medium truncate">{c.name}</p>
                  <p className={`font-mono text-sm font-semibold shrink-0 ml-2 ${c.churn_probability > 0.6 ? 'text-risk' : 'text-safe'}`}>
                    {(c.churn_probability * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge type="segment" value={c.segment} />
                  {c.outreach_status && c.outreach_status !== 'none' && (
                    <span className={`font-mono text-xs ${OUTREACH_COLORS[c.outreach_status]}`}>
                      · {OUTREACH_LABELS[c.outreach_status]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail Panel ────────────────────────────────────────────── */}
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
                    <span className="flex items-center gap-1"><MapPin size={10}/> {detail.city}</span>
                    <span className="flex items-center gap-1"><Activity size={10}/> AGE {detail.age}</span>
                    <StatusBadge type="segment" value={detail.segment} />
                  </div>
                </div>
              </div>
              <button onClick={() => handleRefreshPredict(detail.customer_id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-mono text-xs tracking-wider hover:bg-primary/20 transition-colors">
                <RefreshCw size={11} /> SYNC ML
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'BALANCE',      value: `$${parseFloat(detail.account_balance).toLocaleString()}` },
                { label: 'CREDIT SCORE', value: detail.credit_score },
                { label: 'HEALTH INDEX', value: `${detail.relationship_health_score}/100` },
              ].map(s => (
                <div key={s.label} className="bg-surface-2 border border-white/[0.04] p-3">
                  <p className="font-mono text-xs text-secondary tracking-wider">{s.label}</p>
                  <p className="font-mono text-base font-semibold text-white mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-white/[0.06]">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`font-mono text-xs tracking-widest px-5 py-2.5 transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-secondary hover:text-white'
                }`}>
                {tab === 'overview' ? 'OVERVIEW' : tab === 'tickets' ? 'SUPPORT TICKETS' : 'NOTES'}
              </button>
            ))}
          </div>

          {/* ── TAB: OVERVIEW ── */}
          {activeTab === 'overview' && (<>
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
                    <div className={`h-full ${r.color.replace('text-', 'bg-')}`} style={{ width: `${r.score * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Recommendations */}
            <div className="bg-surface border border-white/[0.06] p-5">
              <p className="font-mono text-sm text-secondary tracking-[0.15em] uppercase mb-3">AI Recommendations</p>
              <div className="space-y-2">
                {recs.map((rec, i) => (
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
                      <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono', fontSize: 12 }} />
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
                      <td className="px-4 py-2.5 font-mono text-xs text-secondary/60">{new Date(tx.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>)}

          {/* ── TAB: TICKETS ── */}
          {activeTab === 'tickets' && (
            <TicketsSection tickets={detail.history?.tickets} />
          )}

          {/* ── TAB: NOTES ── */}
          {activeTab === 'notes' && (
            <NotesSection customerId={detail.customer_id} />
          )}

        </>)}
      </div>
    </div>
  );
};

export default Customer360;
