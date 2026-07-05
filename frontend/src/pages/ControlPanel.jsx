import React, { useState, useEffect } from 'react';
import { RefreshCw, Cpu, Database, Zap, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const ControlPanel = () => {
  const [health, setHealth]         = useState(null);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState('');
  const [retrainStatus, setRetrainStatus] = useState(null);

  const fetchHealth = async () => {
    try {
      const { data } = await axios.get(`${API}/ml/health`);
      setHealth(data);
    } catch (_) { setHealth(null); }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainStatus(null);
    setRetrainMsg('Training started — this takes ~30 seconds...');
    try {
      await axios.post(`${API}/ml/retrain`);
      setRetrainMsg('Models retrained and reloaded successfully.');
      setRetrainStatus('success');
    } catch {
      setRetrainMsg('Retraining failed. Check backend logs.');
      setRetrainStatus('error');
    } finally {
      setRetraining(false);
      setTimeout(() => setRetrainMsg(''), 8000);
    }
  };

  const services = [
    { label: 'BACKEND API',  icon: <Zap size={16}/>,      online: true, detail: 'Express · Port 5000' },
    { label: 'ML ENGINE',    icon: <Cpu size={16}/>,       online: health?.ml?.status === 'healthy', detail: health?.ml?.models_loaded ? 'Models loaded' : 'Models not loaded' },
    { label: 'DATABASE',     icon: <Database size={16}/>,  online: true, detail: 'PostgreSQL · nexacore_db' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="font-mono text-2xl font-semibold tracking-wider text-white">CONTROL PANEL</h2>
        <p className="font-mono text-sm text-secondary tracking-widest mt-1">SYSTEM HEALTH · ML OPERATIONS · DIAGNOSTICS</p>
      </div>

      {/* System Status */}
      <div>
        <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-3">System Status</p>
        <div className="grid grid-cols-3 gap-3">
          {services.map(s => (
            <div key={s.label} className={`bg-surface border p-5 ${s.online ? 'border-safe/20' : 'border-risk/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={s.online ? 'text-safe' : 'text-risk'}>{s.icon}</span>
                <div className={`flex items-center gap-1.5 font-mono text-xs ${s.online ? 'text-safe' : 'text-risk'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.online ? 'bg-safe animate-ping-slow' : 'bg-risk'}`} />
                  {s.online ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>
              <p className="font-mono text-sm font-semibold text-white">{s.label}</p>
              <p className="font-mono text-xs text-secondary mt-1">{s.detail}</p>
            </div>
          ))}
        </div>
        {health?.timestamp && (
          <p className="font-mono text-xs text-secondary/40 mt-2 tracking-widest">
            Last checked: {new Date(health.timestamp).toLocaleTimeString()}
            <button onClick={fetchHealth} className="ml-3 text-secondary/60 hover:text-white transition-colors"><RefreshCw size={10}/></button>
          </p>
        )}
      </div>

      {/* ML Retraining */}
      <div className="bg-surface border border-white/[0.06] p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-mono text-sm font-semibold text-white">Retrain ML Models</p>
            <p className="font-mono text-xs text-secondary mt-1 max-w-lg">
              Pulls current customer data from PostgreSQL, trains fresh Random Forest models for churn
              prediction and fraud scoring, saves them as .joblib files, then hot-reloads the ML service
              — no restart needed.
            </p>
          </div>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-sm tracking-wider transition-all shrink-0 ml-6 ${
              retraining
                ? 'bg-primary/20 border border-primary/20 text-primary/50 cursor-not-allowed'
                : 'bg-primary text-black font-semibold hover:bg-primary/80'
            }`}
          >
            {retraining ? <Loader size={14} className="animate-spin" /> : <Cpu size={14} />}
            {retraining ? 'TRAINING...' : 'RETRAIN NOW'}
          </button>
        </div>

        {retrainMsg && (
          <div className={`flex items-center gap-2 border px-4 py-3 font-mono text-sm ${
            retrainStatus === 'success' ? 'border-safe/30 bg-safe/5 text-safe' :
            retrainStatus === 'error'   ? 'border-risk/30 bg-risk/5 text-risk' :
            'border-primary/30 bg-primary/5 text-primary'
          }`}>
            {retrainStatus === 'success' ? <CheckCircle2 size={14}/> :
             retrainStatus === 'error'   ? <AlertCircle size={14}/> :
             <Loader size={14} className="animate-spin"/>}
            {retrainMsg}
          </div>
        )}

        <div className="mt-6 border border-white/[0.06] p-4 space-y-2">
          <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-3">Training Pipeline</p>
          {[
            { step: '01', label: 'Connect to PostgreSQL', detail: 'Read all 1,000 customers from nexacore_db' },
            { step: '02', label: 'Train Churn Model',     detail: 'RandomForestRegressor · 7 behavioral features' },
            { step: '03', label: 'Train Fraud Model',     detail: 'RandomForestRegressor · 5 risk features' },
            { step: '04', label: 'Serialize Models',      detail: 'Save as churn_model.joblib + fraud_model.joblib' },
            { step: '05', label: 'Hot-Reload ML Service', detail: 'POST /reload to FastAPI — zero downtime' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-4">
              <span className="font-mono text-xs text-primary shrink-0 mt-0.5">{s.step}</span>
              <div>
                <p className="font-mono text-sm text-white">{s.label}</p>
                <p className="font-mono text-xs text-secondary">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML Service Info */}
      {health?.ml && (
        <div className="bg-surface border border-white/[0.06] p-5">
          <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">ML Service Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-xs text-secondary">SERVICE</p>
              <p className="font-mono text-sm text-white mt-1">{health.ml.service}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-secondary">MODELS LOADED</p>
              <p className={`font-mono text-sm mt-1 font-semibold ${health.ml.models_loaded ? 'text-safe' : 'text-risk'}`}>
                {health.ml.models_loaded ? 'YES — READY' : 'NO — RETRAIN REQUIRED'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
