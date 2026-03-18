import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "relative font-bold text-lg rounded-xl py-4 px-8 mt-2 transition-all duration-300 active:scale-95 overflow-hidden flex items-center justify-center";
  
  const variants = {
    primary: "bg-gradient-to-r from-barflow-neonCyan to-barflow-electricPurple text-white shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(189,0,255,0.6)]",
    secondary: "bg-barflow-panel border border-white/20 text-white hover:bg-white/10",
    danger: "bg-gradient-to-r from-barflow-neonPink to-[#80002b] text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-10 tracking-wide">{children}</span>
      {/* Optional minimal gloss effect */}
      <div className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity"></div>
    </button>
  );
};
