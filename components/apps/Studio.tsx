import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Download, Share2, Layers, Wand2 } from 'lucide-react';

export const Studio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    // Simulation of generation delay
    setTimeout(() => {
        setIsGenerating(false);
        // Using a placeholder image service for demo purposes since actual generation requires a separate flow
        const seed = Math.floor(Math.random() * 1000);
        setGeneratedImages(prev => [`https://picsum.photos/seed/${seed}/800/800`, ...prev]);
        setPrompt('');
    }, 2500);
  };

  return (
    <div className="h-full flex bg-[#0f1115] text-slate-200">
      {/* Sidebar Tools */}
      <div className="w-16 border-r border-white/10 flex flex-col items-center py-6 gap-6">
        <button className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400"><Wand2 size={20} /></button>
        <button className="p-3 rounded-xl hover:bg-white/5 text-slate-400"><Layers size={20} /></button>
        <button className="p-3 rounded-xl hover:bg-white/5 text-slate-400"><ImageIcon size={20} /></button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Gallery / Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
            {generatedImages.length === 0 && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <Sparkles size={48} className="mb-4" />
                    <p>Enter a prompt to start creating.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {isGenerating && (
                        <div className="aspect-square rounded-2xl bg-white/5 animate-pulse flex items-center justify-center border border-white/10">
                            <Sparkles className="animate-spin text-cyan-500" />
                        </div>
                    )}
                    {generatedImages.map((img, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                            <img src={img} alt="Generated" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Download size={20} /></button>
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Share2 size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Prompt Bar */}
        <div className="p-6 bg-black/20 border-t border-white/10 backdrop-blur-md">
            <div className="flex gap-4">
                <textarea 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 resize-none outline-none focus:border-cyan-500/50 transition-all font-light text-sm h-24"
                    placeholder="Describe what you want to imagine..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Sparkles size={20} className={isGenerating ? 'animate-spin' : ''} />
                    <span className="text-xs font-bold">{isGenerating ? 'Working' : 'Generate'}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};