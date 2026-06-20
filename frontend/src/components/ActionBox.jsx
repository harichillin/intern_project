import React from 'react';

const ActionBox = ({ title, description, buttonText, icon, onClick, type = 'info' }) => {
  const styles = {
    info: 'border-primary/20 bg-primary/5',
    warning: 'border-accent/20 bg-accent/5',
    danger: 'border-risk/20 bg-risk/5'
  };

  return (
    <div className={`p-4 rounded-xl border ${styles[type]} flex items-center justify-between`}>
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-lg ${type === 'info' ? 'bg-primary/20 text-primary' : type === 'warning' ? 'bg-accent/20 text-accent' : 'bg-risk/20 text-risk'}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-secondary">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ActionBox;
