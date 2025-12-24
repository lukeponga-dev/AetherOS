import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Mic, Command, Clock, Calendar } from 'lucide-react';
import { processUserIntent } from '../../services/geminiService';
import { AIResponse, AppId } from '../../types';

interface OmniProps {
  onCommand: (response: AIResponse) => void;
}

export const OmniAssistant: React.FC<OmniProps> = ({ onCommand }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'system', text: string}[]>([
    { role: 'system', text: 'Good afternoon. I am ready to assist.' }
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsProcessing(true);

    const response = await processUserIntent(userText);
    
    setIsProcessing(false);
    setMessages(prev => [...prev, { role: 'system', text: response.message || "Done." }]);
    onCommand(response);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = [
    "Summarize last week's reports",
    "Turn on Focus Mode",
    "Organize my downloads",
    "Create a meeting agenda"
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-transparent to-white/5">
      {/* Header / Context */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-300">
                <Sparkles size={20} />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Omni Core</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">System Intelligence Active</p>
            </div>
        </div>
        
        {/* Date/Time Context Card */}
        <div className="flex gap-3 mb-4">
             <div className="flex-1 bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-white/20 flex items-center gap-3">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">2:45 PM</span>
             </div>
             <div className="flex-1 bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-white/20 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium">Oct 24</span>
             </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`
                max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-500/20' 
                  : 'bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-tl-sm text-slate-800 dark:text-slate-200'}
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="bg-white/40 px-4 py-2 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
             </div>
           </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions (only show if few messages) */}
      {messages.length < 3 && (
        <div className="px-6 py-2">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Suggested Actions</p>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button 
                        key={i}
                        onClick={() => setInput(s)}
                        className="text-xs bg-white/30 hover:bg-white/50 border border-white/20 px-3 py-1.5 rounded-full transition-colors text-slate-700 dark:text-slate-300"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white/20 border-t border-white/10 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What would you like to do?"
            className="w-full bg-white/50 dark:bg-black/30 border border-white/30 focus:border-blue-400/50 rounded-2xl pl-10 pr-12 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-white shadow-inner"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Command size={16} />
          </div>
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            {input.trim() ? <Send size={16} /> : <Mic size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};
