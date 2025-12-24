import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2, GripHorizontal } from 'lucide-react';
import { WindowState } from '../../types';
import { GlassCard } from '../ui/GlassCard';

interface WindowFrameProps {
  windowState: WindowState;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ 
  windowState, 
  onClose, 
  onFocus, 
  onMinimize,
  onUpdatePosition,
  onDragStart,
  onDragEnd,
  children 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: windowState.position.x, y: windowState.position.y });

  useEffect(() => {
    if (!isDragging) {
      currentPos.current = windowState.position;
    }
  }, [windowState.position, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow drag from the top zone
    e.stopPropagation();
    onFocus(windowState.id);
    
    setIsDragging(true);
    
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    onDragStart?.(windowState.id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !frameRef.current) return;
      e.preventDefault(); 
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = Math.max(0, e.clientY - dragOffset.current.y);
      
      frameRef.current.style.left = `${newX}px`;
      frameRef.current.style.top = `${newY}px`;
      
      currentPos.current = { x: newX, y: newY };
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      onDragEnd?.(windowState.id);
      onUpdatePosition(windowState.id, currentPos.current.x, currentPos.current.y);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUpdatePosition, windowState.id, onDragEnd]);

  if (!windowState.isOpen || windowState.isMinimized) return null;

  return (
    <div
      ref={frameRef}
      style={{
        position: 'absolute',
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height,
        zIndex: windowState.zIndex,
        transition: isDragging ? 'none' : 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
      className="flex flex-col group will-change-transform"
      onMouseDown={() => onFocus(windowState.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative h-full flex flex-col rounded-[2rem] overflow-hidden transition-all duration-300
        ${isDragging ? 'scale-[0.98] opacity-90 shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-grabbing' : 'shadow-[0_20px_60px_rgba(0,0,0,0.6)]'}
      `}>
        
        {/* Glass Background Layer */}
        <div className="absolute inset-0 bg-[#1a1b26]/80 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Gesture/Drag Zone (Invisible Header) */}
        <div 
          className="relative h-8 w-full z-20 cursor-grab active:cursor-grabbing flex justify-center items-center group/header"
          onMouseDown={handleMouseDown}
        >
            {/* Subtle Handle that appears on hover */}
            <div className={`w-12 h-1 rounded-full bg-white/20 transition-all duration-300 ${isHovered ? 'opacity-100 w-16' : 'opacity-0'}`} />
            
            {/* Window Controls - Floating outside content flow */}
            <div className={`absolute right-4 top-4 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors backdrop-blur-md"
                >
                    <Minus size={14} />
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors backdrop-blur-md"
                >
                    <X size={14} />
                 </button>
            </div>
        </div>

        {/* Content Container */}
        <div className="relative flex-1 overflow-hidden z-10">
           {children}
        </div>
        
        {/* Subtle Border Glow */}
        <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none" />
      </div>
      
      {/* Floating Label (Shows on hover below window) */}
      <div className={`
        absolute -bottom-8 left-1/2 -translate-x-1/2 
        bg-black/60 backdrop-blur-md text-slate-300 text-[10px] tracking-widest uppercase font-medium px-3 py-1 rounded-full border border-white/5
        transition-all duration-300 pointer-events-none
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}>
        {windowState.title}
      </div>
    </div>
  );
};