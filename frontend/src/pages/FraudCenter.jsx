import React from 'react';
import useFetch from '../hooks/useFetch';
import { StatusBadge } from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const FraudCenter = () => {
  const { data: alerts, loading, refetch } = useFetch('/alerts');

  const handleResolve = async (id) => {
    await axios.put(`http://localhost:5000/api/alerts/${id}`, { status: 'resolved' });
    refetch();
  };

  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Fraud & Security Center</h2>
        <p className="text-secondary mt-1">Real-time anomaly monitoring powered by NexaCore ML Sentinel</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <SkeletonLoader type="list" />
        ) : alerts?.map(alert => (
          <div key={alert.id} className={`bg-surface p-6 rounded-2xl border border-slate-700/50 flex items-center justify-between transition-all ${alert.status === 'open' ? 'border-l-4 border-l-risk' : 'opacity-60'}`}>
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-2xl ${alert.status === 'open' ? 'bg-risk/10 text-risk' : 'bg-safe/10 text-safe'}`}>
                {alert.status === 'open' ? <ShieldAlert size={28}/> : <CheckCircle2 size={28}/>}
              </div>
              <div>
                <h4 className="text-lg font-bold">{alert.type}</h4>
                <p className="text-sm text-secondary">Customer: <span className="text-slate-200 font-semibold">{alert.customer_name}</span> • Risk Confidence: {(alert.risk_score * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusBadge type="risk" value={alert.risk_score} />
              {alert.status === 'open' && (
                <button 
                  onClick={() => handleResolve(alert.id)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FraudCenter;
