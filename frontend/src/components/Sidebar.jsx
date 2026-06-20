import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, BarChart3, Database } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Customer 360', path: '/customers', icon: <Users size={20} /> },
    { name: 'Fraud Center', path: '/fraud', icon: <ShieldAlert size={20} /> },
    { name: 'Financial Reports', path: '/reports', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-surface border-r border-slate-700/50 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700/50">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Database className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">NexaCore</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? 'bg-primary/20 text-primary border-l-4 border-primary' 
                : 'text-secondary hover:bg-slate-700/30 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-700/50">
        <div className="bg-slate-800/50 p-4 rounded-xl text-center">
          <p className="text-xs text-secondary mb-1 uppercase tracking-widest font-semibold">Sentinel Engine</p>
          <p className="text-safe text-sm flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-safe rounded-full animate-pulse"></span>
            System Live
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
