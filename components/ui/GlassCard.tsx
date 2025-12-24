import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-white/10 dark:bg-black/20 
        backdrop-blur-2xl 
        border border-white/20 dark:border-white/10
        shadow-xl
        rounded-3xl
        text-slate-800 dark:text-slate-100
        transition-all duration-300
        ${hoverEffect ? 'hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Noise Texture Overlay for realism */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};
