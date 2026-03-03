import React, { useState, useRef, useEffect } from 'react';
import { useGlobalState } from '@/context/GlobalState';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
    const { summaryStats, colonies } = useGlobalState();

    // Default system prompt state
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Hello Dr. Vance. I am the ColonyGuard AI. How can I assist you with your morphological analysis today?' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter active working set from global state
    const activeColonies = colonies.map((colony: any) => {
        const metrics = colony.metrics || [];
        const latestMetric = metrics[metrics.length - 1] || {};
        const ciiScore = latestMetric['Colony Instability Index'] || 0;
        let status = "STABLE";
        if (ciiScore > 60) status = "CRITICAL";
        else if (ciiScore > 35) status = "AT RISK";
        return { ...colony, ciiScore, status };
    });

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');

        // Simulate intelligent AI parsing context and replying
        setTimeout(() => {
            let aiResponse = "I'm analyzing the requested parameters.";
            const lowerInput = userMsg.toLowerCase();

            if (lowerInput.includes('critical') || lowerInput.includes('failing') || lowerInput.includes('risk')) {
                const criticalCount = activeColonies.filter((c: any) => c.status === "CRITICAL").length;
                aiResponse = `Alert: There are currently ${criticalCount} colonies exhibiting CRITICAL instability signatures exceeding the 60 CII threshold in this batch. I recommend immediate examination.`;
            } else if (lowerInput.includes('status') || lowerInput.includes('summary') || lowerInput.includes('how are') || lowerInput.includes('index')) {
                aiResponse = `We are currently monitoring ${summaryStats.total} total IPSC colonies. The mean Colony Instability Index across the batch is ${summaryStats?.avgInstability?.toFixed(1) || '0.0'}, which is within stable operational variance.`;
            } else if (lowerInput.includes('model') || lowerInput.includes('accuracy') || lowerInput.includes('ai')) {
                aiResponse = `I am currently operating via the XGBoost Max pipeline variant v2.0, utilizing 3rd-degree morphological polynomial tracking mapping 16 parameters. Engine precision is tracking at a 94.2% R² coefficient.`;
            } else {
                aiResponse = `Analyzing "${userMsg}" against the morphological dataset... Cross-referencing structural timeline vectors. The current distribution is nominal, but I will monitor for sudden entropy shifts.`;
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        }, 800);
    };

    return (
        <div className="fixed bottom-28 right-8 w-80 md:w-96 h-[500px] max-h-[70vh] glass-panel-3d bg-[#0a0f18]/95 rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col z-[100] overflow-hidden backdrop-blur-2xl animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-cyan-950/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                        <span className="material-symbols-outlined text-white text-sm">psychology</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide shadow-cyan">ColonyGuard AI</h3>
                        <p className="text-[9px] text-cyan-400 font-mono tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_#22d3ee]"></span>
                            SYSTEM ONLINE
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors relative z-10">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-lg ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 text-white rounded-br-sm backdrop-blur-md'
                                : 'bg-black/60 border border-white/10 text-slate-300 rounded-bl-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-white/10 bg-black/60 relative">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Query parameters..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-cyan-50 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all font-mono"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-1.5 w-8 h-8 rounded-full bg-cyan-500/20 hover:bg-cyan-500/50 border border-cyan-500/50 text-cyan-300 flex items-center justify-center transition-all disabled:opacity-30 disabled:border-transparent disabled:bg-slate-800"
                    >
                        <span className="material-symbols-outlined text-sm translate-x-px">send</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
