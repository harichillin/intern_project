import React from 'react';
import useFetch from '../hooks/useFetch';
import { StatusBadge } from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';
import axios from 'axios';

const FraudCenter = () => {
  const { data: alerts, loading, refetch } = useFetch('/alerts');

  const handleResolve = async (id) => {
    await axios.put(`http://localhost:5000/api/alerts/${id}`, { status: 'resolved' });
    refetch();
  };

  const openAlerts    = alerts?.filter(a => a.status === 'open')     || [];
  const resolvedAlerts = alerts?.filter(a => a.status !== 'open')    || [];

  return (
    <div className="p-6 space-y-6 animate-in">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="font-mono text-2xl font-semibold tracking-wider text-white">FRAUD & SECURITY CENTER</h2>
        <p className="font-mono text-sm text-secondary tracking-widest mt-1">REAL-TIME ANOMALY MONITORING · NEXACORE ML SENTINEL</p>
      </div>

      {/* Summary bar */}
      {alerts && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'TOTAL ALERTS',    value: alerts.length,      color: 'text-white' },
            { label: 'OPEN',            value: openAlerts.length,  color: 'text-risk' },
            { label: 'RESOLVED',        value: resolvedAlerts.length, color: 'text-safe' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-white/[0.06] p-4">
              <p className="font-mono text-xs text-secondary tracking-widest">{s.label}</p>
              <p className={`font-mono text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Alert Feed */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-2">
          {alerts?.map(alert => (
            <div
              key={alert.id}
              className={`bg-surface border border-white/[0.06] p-4 flex items-center justify-between transition-all ${
                alert.status === 'open'
                  ? 'border-l-2 border-l-risk'
                  : 'opacity-50 border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 ${alert.status === 'open' ? 'bg-risk/10 text-risk' : 'bg-safe/10 text-safe'}`}>
                  {alert.status === 'open' ? <AlertOctagon size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-mono text-sm font-semibold text-white">{alert.type}</p>
                    <StatusBadge type="risk" value={alert.risk_score} />
                  </div>
                  <p className="font-mono text-sm text-secondary">
                    {alert.customer_name} &nbsp;·&nbsp; Risk: {(alert.risk_score * 100).toFixed(1)}%
                  </p>
                  <p className="font-mono text-xs text-secondary/40 mt-0.5">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {alert.status === 'open' && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="font-mono text-xs tracking-wider px-3 py-1.5 border border-white/[0.08] text-secondary hover:border-safe/50 hover:text-safe transition-colors"
                >
                  MARK RESOLVED
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FraudCenter;
