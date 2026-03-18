import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 shadow-2xl backdrop-blur-xl border-white/10 transition-transform duration-300 hover:scale-[1.02] ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
