import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../components/MetricCard';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const TransactionFeed = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [filter, setFilter] = useState('all');

  const fetchFeed = async () => {
    try {
      const { data } = await axios.get(`${API}/transactions/feed`);
      setTransactions(data);
      setLastRefresh(new Date());
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = transactions.filter(tx => {
    if (filter === 'debit')  return tx.type === 'debit';
    if (filter === 'credit') return tx.type === 'credit';
    if (filter === 'flagged') return parseFloat(tx.fraud_score) > 0.6;
    return true;
  });

  const totalVolume = filtered.reduce((s, tx) => s + parseFloat(tx.amount), 0);
  const credits = filtered.filter(t => t.type === 'credit').length;
  const debits  = filtered.filter(t => t.type === 'debit').length;

  return (
    <div className="p-6 space-y-6 animate-in">
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4 flex items-end justify-between">
        <div>
          <h2 className="font-mono text-2xl font-semibold tracking-wider text-white">LIVE TRANSACTION FEED</h2>
          <p className="font-mono text-sm text-secondary tracking-widest mt-1">BANK-WIDE · AUTO-REFRESHES EVERY 10 SECONDS</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-safe animate-ping-slow" />
          <span className="font-mono text-xs text-safe tracking-widest">LIVE</span>
          <span className="font-mono text-xs text-secondary/50 ml-3">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
          <button onClick={fetchFeed} className="ml-2 p-1.5 border border-white/[0.08] text-secondary hover:text-white hover:border-white/20 transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'TOTAL SHOWN',   value: filtered.length,               color: 'text-white' },
          { label: 'CREDITS',       value: credits,                       color: 'text-safe' },
          { label: 'DEBITS',        value: debits,                        color: 'text-risk' },
          { label: 'TOTAL VOLUME',  value: `$${(totalVolume/1000).toFixed(1)}k`, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-white/[0.06] p-4">
            <p className="font-mono text-xs text-secondary tracking-widest">{s.label}</p>
            <p className={`font-mono text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {[['all','ALL'],['credit','CREDITS'],['debit','DEBITS'],['flagged','FLAGGED (Fraud > 60%)']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`font-mono text-xs tracking-widest px-4 py-2.5 transition-colors ${
              filter === v ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-white'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="bg-surface border border-white/[0.06]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['TYPE','MERCHANT','CUSTOMER','SEGMENT','FRAUD RISK','AMOUNT','TIMESTAMP'].map(h => (
                <th key={h} className="px-4 py-3 font-mono text-xs text-secondary tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 font-mono text-xs text-secondary text-center">LOADING FEED...</td></tr>
            ) : filtered.map((tx, i) => (
              <tr key={i} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                parseFloat(tx.fraud_score) > 0.6 ? 'border-l-2 border-l-risk' : ''
              }`}>
                <td className="px-4 py-2.5">
                  <div className={`flex items-center gap-1.5 font-mono text-xs font-semibold ${tx.type === 'credit' ? 'text-safe' : 'text-risk'}`}>
                    {tx.type === 'credit' ? <ArrowUpRight size={13}/> : <ArrowDownLeft size={13}/>}
                    {tx.type.toUpperCase()}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-sm text-white">{tx.merchant}</td>
                <td className="px-4 py-2.5 font-mono text-sm text-white whitespace-nowrap">{tx.customer_name}</td>
                <td className="px-4 py-2.5"><StatusBadge type="segment" value={tx.segment} /></td>
                <td className="px-4 py-2.5">
                  <span className={`font-mono text-sm font-semibold ${parseFloat(tx.fraud_score) > 0.6 ? 'text-risk' : 'text-safe'}`}>
                    {(parseFloat(tx.fraud_score) * 100).toFixed(1)}%
                  </span>
                </td>
                <td className={`px-4 py-2.5 font-mono text-sm font-semibold ${tx.type === 'credit' ? 'text-safe' : 'text-risk'}`}>
                  {tx.type === 'credit' ? '+' : '-'}${parseFloat(tx.amount).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-secondary/60 whitespace-nowrap">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionFeed;
