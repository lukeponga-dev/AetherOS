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
        bg-black/60
        backdrop-blur-2xl 
        border border-white/10
        shadow-2xl
        rounded-2xl
        text-slate-100
        transition-all duration-300
        ${hoverEffect ? 'hover:bg-black/70 hover:scale-[1.01] hover:border-white/20 cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Noise Texture Overlay for realism */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Subtle inner light reflection at top */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};