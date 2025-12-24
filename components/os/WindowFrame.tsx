import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';
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
  const frameRef = useRef<HTMLDivElement>(null);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: windowState.position.x, y: windowState.position.y });

  useEffect(() => {
    if (!isDragging) {
      currentPos.current = windowState.position;
    }
  }, [windowState.position, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
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
        transition: isDragging ? 'none' : 'width 0.3s, height 0.3s'
      }}
      className="flex flex-col group will-change-transform"
      onMouseDown={() => onFocus(windowState.id)}
    >
      <GlassCard className={`
        h-full flex flex-col !rounded-xl !border-white/10 shadow-2xl ring-1 ring-black/50 overflow-hidden
        ${isDragging ? 'scale-95 opacity-80 shadow-cyan-500/20 cursor-grabbing' : ''}
      `}>
        {/* Minimal Header */}
        <div 
          className="h-9 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none bg-gradient-to-r from-white/5 to-transparent"
          onMouseDown={handleMouseDown}
        >
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} className="w-3 h-3 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-transparent hover:text-black flex items-center justify-center transition-all">
                        <X size={8} strokeWidth={3} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }} className="w-3 h-3 rounded-full bg-yellow-500/20 hover:bg-yellow-500 border border-yellow-500/30 text-transparent hover:text-black flex items-center justify-center transition-all">
                        <Minus size={8} strokeWidth={3} />
                    </button>
                </div>
                <span className="text-[12px] font-medium text-slate-400/80 tracking-wide">{windowState.title}</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-black/40">
           {children}
        </div>
      </GlassCard>
    </div>
  );
};