import React, { useState } from 'react';
import { Sparkles, Mic, ArrowRight, Command } from 'lucide-react';
import { AIResponse, AppId } from '../../types';
import { processUserIntent } from '../../services/geminiService';

interface CommandCenterProps {
  onCommand: (response: AIResponse) => void;
  isProcessing: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onCommand, isProcessing }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    // Quick local commands or pass to AI
    const raw = input.trim();
    setInput('');
    
    // Process via AI Kernel
    const response = await processUserIntent(raw);
    onCommand(response);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
      <div 
        className={`
            relative flex items-center gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 pr-4 shadow-2xl transition-all duration-500
            ${isFocused ? 'bg-black/60 scale-105 border-white/20 shadow-cyan-500/20' : 'hover:bg-black/50'}
        `}
      >
        {/* AI Orb / Indicator */}
        <div className="relative w-12 h-12 flex items-center justify-center">
            <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-lg opacity-40 ${isProcessing ? 'animate-pulse' : ''}`} />
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-inner">
                {isProcessing ? (
                    <Sparkles size={20} className="text-white animate-spin" />
                ) : (
                    <Command size={20} className="text-white" />
                )}
            </div>
        </div>

        {/* Input Field */}
        <form onSubmit={handleSubmit} className="flex-1">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What is your intent?"
                className="w-full bg-transparent border-none outline-none text-lg text-white font-light placeholder:text-slate-500"
            />
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
            {!input && (
                <button 
                    onClick={() => onCommand({ intent: 'OPEN_APP', appId: AppId.OMNI, payload: { mode: 'voice' } })}
                    className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                    <Mic size={20} />
                </button>
            )}
            {input && (
                <button 
                    onClick={handleSubmit}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <ArrowRight size={20} />
                </button>
            )}
        </div>
      </div>
      
      {/* Dynamic Suggestions (Fade in when focused) */}
      <div className={`mt-4 flex justify-center gap-3 transition-all duration-500 ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {['Open Studio', 'Find Report', 'Focus Mode'].map(cmd => (
              <button 
                key={cmd} 
                onClick={() => { setInput(cmd); setIsFocused(true); }}
                className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-400 hover:text-white transition-colors backdrop-blur-md"
              >
                  {cmd}
              </button>
          ))}
      </div>
    </div>
  );
};