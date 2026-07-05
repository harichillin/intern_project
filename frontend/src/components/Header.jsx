import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const PAGE_LABELS = {
  '/':             'INTELLIGENCE OVERVIEW',
  '/customers':    'CUSTOMER 360',
  '/fraud':        'FRAUD & SECURITY CENTER',
  '/reports':      'FINANCIAL REPORTS',
  '/transactions': 'LIVE TRANSACTION FEED',
  '/control':      'CONTROL PANEL',
};

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/alerts');
      setAlerts(data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCount = alerts.filter(a => a.status === 'open').length;
  const recent = alerts.slice(0, 5);

  return (
    <div className="h-12 bg-surface border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-sm tracking-widest">
        <span className="text-secondary">NEXACORE</span>
        <ChevronRight size={10} className="text-secondary/40" />
        <span className="text-primary">{PAGE_LABELS[pathname] || 'MODULE'}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-secondary/50 tracking-widest hidden sm:block">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* Notification Bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="relative p-1.5 hover:bg-white/[0.06] transition-colors"
          >
            <Bell size={15} className={openCount > 0 ? 'text-primary' : 'text-secondary'} />
            {openCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-risk font-mono text-[8px] text-white flex items-center justify-center">
                {openCount > 99 ? '99' : openCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-8 w-80 bg-surface border border-white/[0.08] shadow-xl z-50 animate-in">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-sm tracking-widest text-secondary uppercase">Alerts</span>
                <span className="font-mono text-sm text-risk">{openCount} OPEN</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {recent.length === 0 ? (
                  <p className="font-mono text-sm text-secondary text-center py-6">NO ALERTS</p>
                ) : recent.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => { navigate('/fraud'); setOpen(false); }}
                    className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <div className={`mt-0.5 ${alert.status === 'open' ? 'text-risk' : 'text-safe'}`}>
                      {alert.status === 'open' ? <ShieldAlert size={13} /> : <CheckCircle2 size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-white truncate">{alert.type}</p>
                      <p className="font-mono text-sm text-secondary truncate">{alert.customer_name}</p>
                    </div>
                    <span className={`font-mono text-sm shrink-0 ${alert.status === 'open' ? 'text-risk' : 'text-safe'}`}>
                      {(alert.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { navigate('/fraud'); setOpen(false); }}
                className="w-full font-mono text-sm text-primary tracking-widest py-3 hover:bg-primary/5 transition-colors border-t border-white/[0.06]"
              >
                VIEW ALL →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
