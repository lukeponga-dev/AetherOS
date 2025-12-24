import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';
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
      
      // Simple boundary checking
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

  // Handle z-index and focus on click inside content
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
      <GlassCard className="h-full flex flex-col !rounded-2xl !border-white/40 shadow-2xl ring-1 ring-white/20">
        {/* Title Bar */}
        <div 
          className="h-10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none border-b border-white/10 bg-white/5"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400/80 hover:bg-red-500 cursor-pointer shadow-inner" onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} />
            <div className="w-3 h-3 rounded-full bg-amber-400/80 hover:bg-amber-500 cursor-pointer shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-green-400/80 hover:bg-green-500 cursor-pointer shadow-inner" />
          </div>
          <span className="text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300 opacity-80 uppercase">
            {windowState.title}
          </span>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </GlassCard>
    </div>
  );
};
