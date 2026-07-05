import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, BarChart3, Activity } from 'lucide-react';

const navItems = [
  { name: 'DASHBOARD',     path: '/',          icon: <LayoutDashboard size={15} /> },
  { name: 'CUSTOMER 360',  path: '/customers', icon: <Users size={15} /> },
  { name: 'FRAUD CENTER',  path: '/fraud',     icon: <ShieldAlert size={15} /> },
  { name: 'REPORTS',       path: '/reports',   icon: <BarChart3 size={15} /> },
];

const Sidebar = () => (
  <div className="w-64 h-screen bg-surface border-r border-white/[0.06] flex flex-col fixed left-0 top-0">

    {/* Logo / Brand */}
    <div className="px-6 py-5 border-b border-white/[0.06]">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-7 h-7 bg-primary flex items-center justify-center">
          <Activity size={14} className="text-black" />
        </div>
        <span className="font-mono text-sm font-600 tracking-widest text-white uppercase">NexaCore</span>
      </div>
      <p className="font-mono text-sm text-secondary tracking-[0.2em] pl-10">SENTINEL AI v2.0</p>
    </div>

    {/* Module label */}
    <div className="px-6 pt-6 pb-2">
      <p className="font-mono text-sm text-secondary/50 tracking-[0.25em] uppercase">Navigation</p>
    </div>

    {/* Nav Items */}
    <nav className="flex-1 px-3 space-y-0.5">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 text-[13px] font-mono tracking-wider transition-all duration-150 ${
              isActive
                ? 'bg-primary/10 text-primary border-l-2 border-primary pl-[10px]'
                : 'text-secondary hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent pl-[10px]'
            }`
          }
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>

    {/* Status Footer */}
    <div className="px-6 py-5 border-t border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-sm text-secondary/50 tracking-[0.2em] uppercase">System Status</span>
        <span className="font-mono text-sm text-safe tracking-wider">LIVE</span>
      </div>
      <div className="space-y-1.5">
        {[
          { label: 'ML ENGINE', status: 'ONLINE' },
          { label: 'DATABASE', status: 'ONLINE' },
          { label: 'API LAYER', status: 'ONLINE' },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="font-mono text-sm text-secondary/70 tracking-wider">{s.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-safe animate-ping-slow" />
              <span className="font-mono text-sm text-safe/80">{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Sidebar;
