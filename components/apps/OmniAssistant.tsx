import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Clock, FileText, CheckCircle2, MoreHorizontal, Bot, Mic, X, Activity } from 'lucide-react';
import { processUserIntent, ai } from '../../services/geminiService';
import { AIResponse } from '../../types';
import { Modality, LiveServerMessage } from "@google/genai";

interface OmniProps {
  onCommand: (response: AIResponse) => void;
}

// --- Audio Utils for Live API ---
function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: arrayBufferToBase64(int16.buffer),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const OmniAssistant: React.FC<OmniProps> = ({ onCommand }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'system', text: string}[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // --- Voice Mode State ---
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs for Audio Cleanup
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null); // To store the session promise or object
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Live API Lifecycle ---
  useEffect(() => {
    if (!isVoiceMode) return;

    let isActive = true;

    const startSession = async () => {
        setVoiceStatus('connecting');
        try {
            // 1. Setup Audio Contexts
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            inputAudioContextRef.current = inputCtx;
            outputAudioContextRef.current = outputCtx;

            // 2. Setup Microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // 3. Setup Gemini Live Session
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: "You are Aether, a futuristic OS assistant. Keep responses concise, helpful, and friendly. You are running in a voice-first mode.",
                },
                callbacks: {
                    onopen: async () => {
                        if (!isActive) return;
                        console.log("Live Session Opened");
                        setVoiceStatus('connected');
                        
                        // Start Input Stream
                        const source = inputCtx.createMediaStreamSource(stream);
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        processor.onaudioprocess = (e) => {
                            if (!isActive) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            // Simple visualizer calc
                            let sum = 0;
                            for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
                            setAudioLevel(Math.min(100, (sum / (inputData.length/100)) * 500));

                            const pcmBlob = createPcmBlob(inputData);
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(processor);
                        processor.connect(inputCtx.destination);
                        
                        sourceRef.current = source;
                        processorRef.current = processor;
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (!isActive) return;
                        
                        // Handle Audio Output
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputCtx) {
                            try {
                                const audioData = base64ToUint8Array(base64Audio);
                                // Simple PCM decoding (1 channel, 16-bit, 24kHz)
                                const dataInt16 = new Int16Array(audioData.buffer);
                                const audioBuffer = outputCtx.createBuffer(1, dataInt16.length, 24000);
                                const channelData = audioBuffer.getChannelData(0);
                                for (let i = 0; i < dataInt16.length; i++) {
                                    channelData[i] = dataInt16[i] / 32768.0;
                                }

                                const source = outputCtx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputCtx.destination);
                                
                                const currentTime = outputCtx.currentTime;
                                // Schedule next chunk
                                const startTime = Math.max(currentTime, nextStartTimeRef.current);
                                source.start(startTime);
                                nextStartTimeRef.current = startTime + audioBuffer.duration;
                                
                                audioSourcesRef.current.add(source);
                                source.onended = () => audioSourcesRef.current.delete(source);
                            } catch (e) {
                                console.error("Audio Decode Error", e);
                            }
                        }
                        
                        if (msg.serverContent?.interrupted) {
                            audioSourcesRef.current.forEach(s => s.stop());
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        console.log("Live Session Closed");
                        if (isActive) setVoiceStatus('disconnected');
                    },
                    onerror: (err) => {
                        console.error("Live Session Error", err);
                        if (isActive) setVoiceStatus('error');
                    }
                }
            });
            
            sessionRef.current = sessionPromise;

        } catch (err) {
            console.error("Setup Error", err);
            setVoiceStatus('error');
        }
    };

    startSession();

    return () => {
        isActive = false;
        // Cleanup function
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (processorRef.current && sourceRef.current) {
            sourceRef.current.disconnect();
            processorRef.current.disconnect();
        }
        if (inputAudioContextRef.current) inputAudioContextRef.current.close();
        if (outputAudioContextRef.current) outputAudioContextRef.current.close();
        
        audioSourcesRef.current.forEach(s => s.stop());
        audioSourcesRef.current.clear();
        
        // Note: The SDK currently doesn't expose a clean way to close the session explicitly 
        // other than letting the connection drop or implementing a specific close method if available on the session object.
        // We assume dropping references and contexts cleans up client side.
    };
  }, [isVoiceMode]);


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

  const ContextCard = ({ icon: Icon, title, sub, color }: any) => (
    <div className="flex-1 min-w-[120px] p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all group">
        <div className="flex items-start justify-between mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} bg-opacity-20`}>
                <Icon size={14} className={color.replace('bg-', 'text-')} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={12} className="text-slate-500" />
            </div>
        </div>
        <h4 className="text-sm font-medium text-slate-200">{title}</h4>
        <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900/50 to-black/80 relative overflow-hidden">
      
      {/* Voice Mode Overlay */}
      {isVoiceMode && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
             <button 
                onClick={() => setIsVoiceMode(false)} 
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
                <X size={20} className="text-slate-400" />
            </button>
            
            <div className="relative">
                 {/* Glowing Core */}
                 <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 blur-2xl opacity-50 animate-pulse" 
                      style={{ transform: `scale(${1 + audioLevel/50})` }} 
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50 flex items-center justify-center">
                        <Activity size={32} className="text-white animate-pulse" />
                    </div>
                 </div>
            </div>

            <h3 className="mt-8 text-xl font-light text-slate-200 tracking-widest uppercase">
                {voiceStatus === 'connecting' ? 'Establishing Uplink...' : 
                 voiceStatus === 'connected' ? 'Listening' : 'Link Offline'}
            </h3>
            
            {voiceStatus === 'connected' && (
                <div className="mt-4 flex gap-1 h-8 items-center">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-1 bg-cyan-400 rounded-full animate-bounce" 
                             style={{ 
                                 height: `${Math.max(4, Math.random() * audioLevel)}px`, 
                                 animationDuration: `${0.4 + i*0.1}s` 
                             }} 
                        />
                    ))}
                </div>
            )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {messages.length === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-6 opacity-80">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-white">System Ready</h2>
                        <p className="text-xs text-slate-400">Aether Kernel v2.4</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <ContextCard 
                        icon={Clock} 
                        title="Focus" 
                        sub="2h until meeting" 
                        color="bg-orange-500 text-orange-400"
                    />
                    <ContextCard 
                        icon={FileText} 
                        title="Resume.pdf" 
                        sub="Edited recently" 
                        color="bg-blue-500 text-blue-400"
                    />
                    <ContextCard 
                        icon={CheckCircle2} 
                        title="Review" 
                        sub="3 Tasks pending" 
                        color="bg-green-500 text-green-400"
                    />
                    <div className="flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-slate-600 hover:bg-white/10 hover:text-slate-400 cursor-pointer transition-colors">
                        <MoreHorizontal size={16} />
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-4">
            {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div 
                className={`
                    max-w-[90%] px-4 py-2.5 text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white/10 text-slate-200 rounded-2xl rounded-tl-sm border border-white/5'}
                `}
                >
                {msg.text}
                </div>
            </div>
            ))}
            {isProcessing && (
                 <div className="flex gap-1 pl-2 opacity-50">
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce"/>
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '100ms'}}/>
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '200ms'}}/>
                </div>
            )}
            <div ref={endRef} />
        </div>

      </div>

      {/* Input Area */}
      <div className="p-4 pt-2 bg-gradient-to-t from-black/90 to-transparent">
        <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-md" />
            
            <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl px-3 py-2.5">
                <button type="button" onClick={() => setIsVoiceMode(true)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                    <Mic size={18} />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a command or use voice..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500"
                    autoFocus={!isVoiceMode}
                />
                {input ? (
                    <button type="submit" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowRight size={14} />
                    </button>
                ) : (
                    <Sparkles size={16} className={`text-slate-600 ${isProcessing ? 'animate-pulse text-cyan-400' : ''}`} />
                )}
            </div>
        </form>
      </div>

    </div>
  );
};