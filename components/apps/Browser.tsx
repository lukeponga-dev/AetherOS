import React, { useState, useEffect } from 'react';
import { Search, Globe, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { performWebSearch } from '../../services/geminiService';

interface BrowserProps {
  initialQuery?: string;
}

export const Browser: React.FC<BrowserProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [url, setUrl] = useState(initialQuery ? `search:// ${initialQuery}` : 'about:blank');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{summary: string, sources: any[]} | null>(null);

  useEffect(() => {
    if (initialQuery) {
        handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);
    setUrl(`search:// ${q}`);
    
    const data = await performWebSearch(q);
    setResults(data);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSearch(query);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0f1115] text-slate-200">
      {/* Chrome / Address Bar */}
      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center gap-3">
        <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        </div>
        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg flex items-center px-3 py-1.5 focus-within:ring-1 ring-cyan-500/50 transition-all">
            <Globe size={14} className="text-slate-500 mr-2" />
            <input 
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-300 placeholder:text-slate-600"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter URL or Search Query..."
            />
        </div>
        <button onClick={() => handleSearch(query)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
            <ArrowRight size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        {!loading && !results && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <Globe size={64} className="mb-4 text-slate-500" />
                <h3 className="text-xl font-light">Quantum Web</h3>
                <p className="text-sm mt-2">Enter a query to access global knowledge.</p>
            </div>
        )}

        {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
                <p className="text-xs text-cyan-400/80 tracking-widest uppercase">Traversing Nodes...</p>
            </div>
        )}

        {results && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h1 className="text-2xl font-serif text-slate-100 mb-4 leading-relaxed">{query}</h1>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300/90 leading-7">
                        {results.summary}
                    </div>
                </div>

                {results.sources.length > 0 && (
                    <div className="grid gap-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sources</h3>
                        {results.sources.map((source: any, idx: number) => (
                            <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:border-cyan-500/30"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-cyan-100 group-hover:text-cyan-400 transition-colors line-clamp-1">{source.title}</span>
                                    <span className="text-xs text-slate-500 font-mono line-clamp-1">{source.uri}</span>
                                </div>
                                <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};