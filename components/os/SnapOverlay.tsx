import React from 'react';
import { SnapLine } from '../../types';

export const SnapOverlay: React.FC<{ lines: SnapLine[] }> = ({ lines }) => {
  if (lines.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {lines.map(line => {
        // Screen Edge Glows
        if (line.type === 'screen') {
            if (line.orientation === 'vertical' && line.x === 0) {
                return <div key={line.id} className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cyan-500/30 to-transparent" />;
            }
            if (line.orientation === 'vertical' && line.x && line.x > 1000) { // Approx right edge check
                 return <div key={line.id} className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cyan-500/30 to-transparent" />;
            }
            if (line.orientation === 'horizontal' && line.y === 0) {
                return <div key={line.id} className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-cyan-500/30 to-transparent" />;
            }
            if (line.orientation === 'horizontal' && line.y && line.y > 500) { // Approx bottom edge check
                 return <div key={line.id} className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cyan-500/30 to-transparent" />;
            }
        }
        
        // Standard Lines (Center or Window Edges)
        return (
          <div
            key={line.id}
            className={`absolute bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-full transition-all duration-200 ${line.type === 'center' ? 'border-dashed border-cyan-400 bg-transparent border-l-2' : ''}`}
            style={{
                left: line.orientation === 'vertical' ? line.x : line.start,
                top: line.orientation === 'horizontal' ? line.y : line.start,
                width: line.orientation === 'vertical' ? (line.type === 'center' ? 0 : 1) : (line.end - line.start),
                height: line.orientation === 'horizontal' ? (line.type === 'center' ? 0 : 1) : (line.end - line.start),
                opacity: line.type === 'screen' ? 0.0 : 0.6 // Hide the line itself if we drew a glow, or keep it subtle
            }}
          />
        );
      })}
    </div>
  );
};