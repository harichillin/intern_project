import React, { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { StatusBadge } from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ActionBox from '../components/ActionBox';
import { Search, RefreshCw, ChevronRight, User, Phone, MapPin, Activity } from 'lucide-react';
import axios from 'axios';

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
    } catch (err) {
      alert("Failed to sync with ML Service. Ensure it is running.");
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-2rem)] space-x-6 p-6">
      {/* List Panel */}
      <div className="w-1/3 bg-surface rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:border-primary outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4"><SkeletonLoader type="list" /></div>
          ) : (
            customers?.map(c => (
              <div 
                key={c.customer_id}
                onClick={() => setSelectedId(c.customer_id)}
                className={`p-4 border-b border-slate-700/30 cursor-pointer transition-all flex items-center justify-between group ${selectedId === c.customer_id ? 'bg-primary/10' : 'hover:bg-slate-700/20'}`}
              >
                <div>
                  <h4 className="font-semibold text-sm">{c.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <StatusBadge type="segment" value={c.segment} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary">Risk Score</p>
                  <p className={`font-bold text-sm ${c.churn_probability > 0.6 ? 'text-risk' : 'text-safe'}`}>
                    {(c.churn_probability * 100).toFixed(0)}%
                  </p>
                </div>
                <ChevronRight className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 bg-surface rounded-2xl border border-slate-700/50 p-8 overflow-y-auto">
        {!selectedId ? (
          <div className="h-full flex flex-col items-center justify-center text-secondary">
            <User size={48} className="mb-4 opacity-20" />
            <p>Select a customer to view 360 intelligence</p>
          </div>
        ) : loadingDetail ? (
          <SkeletonLoader type="list" />
        ) : detail && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-primary/20">
                  {detail.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{detail.name}</h2>
                  <div className="flex items-center space-x-4 text-secondary text-sm mt-1">
                    <span className="flex items-center"><MapPin size={14} className="mr-1"/> {detail.city}</span>
                    <span className="flex items-center"><Activity size={14} className="mr-1"/> Age: {detail.age}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleRefreshPredict(detail.customer_id)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary rounded-xl font-semibold text-sm hover:bg-blue-600 transition shadow-lg shadow-primary/30"
              >
                <RefreshCw size={16} />
                <span>Sync Real-time ML</span>
              </button>
            </header>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-secondary uppercase font-bold tracking-wider mb-2">Account Balance</p>
                <p className="text-xl font-bold">${parseFloat(detail.account_balance).toLocaleString()}</p>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-secondary uppercase font-bold tracking-wider mb-2">Credit Score</p>
                <p className="text-xl font-bold">{detail.credit_score}</p>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-secondary uppercase font-bold tracking-wider mb-2">Health Index</p>
                <p className="text-xl font-bold">{detail.relationship_health_score}/100</p>
              </div>
            </div>

            <section>
              <h3 className="text-lg font-bold mb-4">Risk Intelligence</h3>
              <div className="grid grid-cols-1 gap-4">
                <ActionBox 
                  title="Churn Probability" 
                  description={`AI analyzes a ${(detail.churn_probability * 100).toFixed(1)}% likelihood of customer attrition.`}
                  buttonText="Analyze Factors"
                  icon={<Users />}
                  type={detail.churn_probability > 0.7 ? 'danger' : 'info'}
                />
                <ActionBox 
                  title="Fraud Threat Score" 
                  description={`Behavioral analysis indicates a risk level of ${(detail.fraud_score * 100).toFixed(1)}%.`}
                  buttonText="Review Alerts"
                  icon={<ShieldAlert size={18} />}
                  type={detail.fraud_score > 0.5 ? 'warning' : 'info'}
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              <div className="bg-slate-800/20 rounded-xl overflow-hidden border border-slate-700/30">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/60 text-secondary uppercase text-[10px] tracking-widest font-bold">
                    <tr>
                      <th className="px-4 py-3">Merchant</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.history.transactions.map((tx, idx) => (
                      <tr key={idx} className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-3">{tx.merchant}</td>
                        <td className="px-4 py-3 capitalize">{tx.type}</td>
                        <td className={`px-4 py-3 font-semibold ${tx.type === 'debit' ? 'text-risk' : 'text-safe'}`}>
                          {tx.type === 'debit' ? '-' : '+'}${tx.amount}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for dynamic icon in ActionBox
import { ShieldAlert } from 'lucide-react';

export default Customer360;
