import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Zap, Bell, Shield, Moon, Battery, Cpu } from 'lucide-react';

export const FlowAutomation: React.FC = () => {
  const [toggles, setToggles] = useState({
    smartSort: true,
    focusMode: false,
    autoBackup: true,
    privacyShield: true,
  });

  const ToggleItem = ({ label, desc, icon: Icon, active, onClick }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl mb-3">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${active ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </div>
        <button onClick={onClick} className={`transition-colors duration-300 ${active ? 'text-blue-600' : 'text-slate-300'}`}>
            {active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
        </button>
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
        <div className="mb-6">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Flow Control</h2>
            <p className="text-sm text-slate-500">AI-managed system preferences</p>
        </div>

        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Intelligence</h3>
                <ToggleItem 
                    label="Smart Sort" 
                    desc="Automatically group files by project context"
                    icon={Zap}
                    active={toggles.smartSort}
                    onClick={() => setToggles(p => ({...p, smartSort: !p.smartSort}))}
                />
                 <ToggleItem 
                    label="Focus Mode" 
                    desc="Suppress notifications during deep work"
                    icon={Moon}
                    active={toggles.focusMode}
                    onClick={() => setToggles(p => ({...p, focusMode: !p.focusMode}))}
                />
            </section>

            <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">System</h3>
                 <ToggleItem 
                    label="Privacy Shield" 
                    desc="Anonymize data before AI processing"
                    icon={Shield}
                    active={toggles.privacyShield}
                    onClick={() => setToggles(p => ({...p, privacyShield: !p.privacyShield}))}
                />
                <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 bg-white/30 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2">
                        <Battery className="text-green-500" />
                        <span className="text-xs font-medium">Power: Optimal</span>
                     </div>
                     <div className="p-4 bg-white/30 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2">
                        <Cpu className="text-purple-500" />
                        <span className="text-xs font-medium">Neural Load: 12%</span>
                     </div>
                </div>
            </section>
        </div>
    </div>
  );
};
