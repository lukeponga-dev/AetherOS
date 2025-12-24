import React, { useState, useEffect } from 'react';
import { Search, File, Image, Music, Code, MoreVertical, Filter } from 'lucide-react';
import { FileItem } from '../../types';
import { INITIAL_FILES } from '../../constants';

interface MemoriesProps {
  initialQuery?: string;
}

export const Memories: React.FC<MemoriesProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const filteredFiles = INITIAL_FILES.filter(file => {
    const matchesQuery = file.name.toLowerCase().includes(query.toLowerCase()) || 
                         file.tags.some(t => t.includes(query.toLowerCase()));
    const matchesTag = activeTag ? file.tags.includes(activeTag) : true;
    return matchesQuery && matchesTag;
  });

  const getIcon = (type: string) => {
    switch (type) {
        case 'image': return <Image className="text-purple-500" />;
        case 'audio': return <Music className="text-pink-500" />;
        case 'code': return <Code className="text-blue-500" />;
        default: return <File className="text-slate-500" />;
    }
  };

  const allTags = Array.from(new Set(INITIAL_FILES.flatMap(f => f.tags)));

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
      {/* Smart Search Bar */}
      <div className="p-4 border-b border-white/10 bg-white/20 backdrop-blur-md sticky top-0 z-10">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by meaning, date, or context..."
                className="w-full bg-white/60 dark:bg-black/20 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 ring-blue-500/20 transition-all"
            />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            <button 
                onClick={() => setActiveTag(null)}
                className={`text-xs px-3 py-1 rounded-full border transition-all whitespace-nowrap ${!activeTag ? 'bg-slate-800 text-white border-transparent' : 'bg-white/40 border-white/20 text-slate-600'}`}
            >
                All Items
            </button>
            {allTags.map(tag => (
                <button 
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all whitespace-nowrap capitalize ${activeTag === tag ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/40 border-white/20 text-slate-600 hover:bg-white/60'}`}
                >
                    {tag}
                </button>
            ))}
        </div>
      </div>

      {/* Grid View */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFiles.map(file => (
                <div key={file.id} className="group relative bg-white/40 dark:bg-white/5 border border-white/20 p-4 rounded-2xl hover:bg-white/60 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {getIcon(file.type)}
                    </div>
                    <div className="w-full">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-full">{file.name}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">{file.date}</p>
                    </div>
                    
                    <button className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 rounded-lg text-slate-500">
                        <MoreVertical size={14} />
                    </button>
                </div>
            ))}
        </div>
        
        {filteredFiles.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <Filter size={48} className="mb-4" />
                <p>No memories found matching context.</p>
            </div>
        )}
      </div>
    </div>
  );
};
