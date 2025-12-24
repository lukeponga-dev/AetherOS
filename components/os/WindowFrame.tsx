import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { WindowState } from '../../types';
import { GlassCard } from '../ui/GlassCard';

interface WindowFrameProps {
  windowState: WindowState;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ 
  windowState, 
  onClose, 
  onFocus, 
  onUpdatePosition,
  children 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent focusing app underneath if clicking title bar
    onFocus(windowState.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const clampedY = Math.max(0, newY); // Don't go above screen
      
      onUpdatePosition(windowState.id, newX, clampedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onUpdatePosition, windowState.id]);

  const handleContentClick = () => {
    onFocus(windowState.id);
  };

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
      }}
      className="flex flex-col transition-shadow duration-300"
      onMouseDown={handleContentClick}
    >
      <GlassCard className="h-full flex flex-col !rounded-lg !border-white/10 shadow-2xl ring-1 ring-black/50">
        {/* Title Bar - Sleek & Dark */}
        <div 
          className="h-9 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none border-b border-white/5 bg-black/40"
          onMouseDown={handleMouseDown}
        >
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
            {windowState.title}
          </span>
          
          <div className="flex items-center gap-3 text-slate-500">
             <button className="hover:text-white transition-colors"><Minus size={12} /></button>
             <button className="hover:text-white transition-colors"><Square size={10} /></button>
             <button 
                className="hover:text-red-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }}
             >
                <X size={12} />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-black/20">
          {children}
        </div>
      </GlassCard>
    </div>
  );
};