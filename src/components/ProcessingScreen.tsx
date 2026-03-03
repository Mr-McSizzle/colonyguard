"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalState } from "@/context/GlobalState";

export default function ProcessingScreen() {
    const router = useRouter();
    const { pendingUploadFiles, setPendingUploadFiles, setColoniesFromPayload } = useGlobalState();
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);

    const stages = [
        'Segmenting phase-contrast images...',
        'Extracting 16 morphological parameters...',
        'Computing temporal derivatives...',
        'Running CII model inference...'
    ];

    useEffect(() => {
        let isMounted = true;
        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + 1, 95));
        }, 30);

        const runInferencePipeline = async () => {
            try {
                // Stage 0 is default
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;

                setStage(1); // 'Extracting 16 morphological parameters...'
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;

                setStage(2); // 'Computing temporal derivatives...'

                let response;

                if (pendingUploadFiles && pendingUploadFiles.length > 0) {
                    const formData = new FormData();
                    pendingUploadFiles.forEach(file => {
                        formData.append('files', file);
                    });

                    setStage(3); // 'Running CII model inference...'

                    response = await fetch('http://localhost:8000/analyze_images', {
                        method: 'POST',
                        body: formData
                    });

                } else {
                    // Fallback Demo Dataset inference
                    const samplePayload = {
                        Diameter_um: 345.12, Area_um2: 85210.4, Perimeter_um: 1104.5,
                        Circularity: 0.82, Compactness: 1.25, Solidity: 0.94,
                        Convexity: 0.91, Eccentricity: 0.44, Mean_Intensity: 112.4,
                        Std_Intensity: 24.1, Entropy: 4.88, Contrast: 125.6,
                        Homogeneity: 0.81, Energy: 0.15, Correlation: 0.92, Edge_Density: 0.44
                    };

                    setStage(3); // 'Running CII model inference...'

                    response = await fetch('http://localhost:8000/predict', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(samplePayload)
                    });
                }

                if (response.ok) {
                    const result = await response.json();
                    console.log("Inference Flow Success:", result);

                    if (pendingUploadFiles && pendingUploadFiles.length > 0) {
                        setColoniesFromPayload(result);
                        setPendingUploadFiles([]);
                    }

                    if (isMounted) {
                        setProgress(100);
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 500);
                    }
                } else {
                    console.error("Inference Error:", response.statusText);
                    // Fallback routing explicitly
                    if (isMounted) router.push('/dashboard');
                }
            } catch (err) {
                console.error("Network flow failed:", err);
                if (isMounted) router.push('/dashboard');
            }
        };

        runInferencePipeline();

        return () => {
            isMounted = false;
            clearInterval(progressInterval);
        };
    }, [router]);

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex items-center justify-center font-sans overflow-hidden relative selection:bg-primary selection:text-white">
            {/* Background SVG filters */}
            <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
                    <feColorMatrix in="blur" mode="matrix" result="goo" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
            </svg>

            {/* Grid Backgrounds */}
            <div className="absolute inset-0 z-0 pointer-events-none radar-grid opacity-30"></div>
            <div className="absolute inset-0 z-50 pointer-events-none scanlines opacity-20 fixed mix-blend-overlay"></div>

            {/* Ambient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Drifting Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/40 rounded-full animate-drift"></div>
                <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-primary/20 rounded-full animate-drift" style={{ animationDelay: "2s" }}></div>
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white/10 rounded-full animate-drift" style={{ animationDelay: "4s" }}></div>
            </div>

            <main className="relative z-20 w-full max-w-[1400px] h-[90vh] flex flex-col md:flex-row gap-8 p-6">
                {/* Left Section (Main Processing Area) */}
                <section className="flex-[2] glass-processing-panel rounded-3xl flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-neon/20">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-sm z-30">
                        <button onClick={() => router.push('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white group">
                            <span className="material-symbols-outlined text-xl group-hover:shadow-neon-text transition-all">close</span>
                        </button>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm animate-pulse">hub</span>
                                <h2 className="text-xs font-bold tracking-[0.3em] text-cyan-glow uppercase text-neon">Morphological Analysis</h2>
                            </div>
                            <p className="text-[10px] font-mono text-primary/60 mt-1 tracking-widest">
                                PID: #482-XJ <span className="mx-1 text-slate-600">|</span> SECURE CONNECTION
                            </p>
                        </div>
                        <button onClick={() => router.push('/')} className="px-4 py-1.5 text-[10px] font-bold text-red-400 border border-red-500/30 bg-red-500/5 rounded hover:bg-red-500/20 hover:border-red-500/60 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all uppercase tracking-wider backdrop-blur-md">
                            Abort Sequence
                        </button>
                    </div>

                    {/* Central Animation Area */}
                    <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-1000">
                            <div className="w-[450px] h-[450px] rounded-full border border-primary/10 animate-spin-slow absolute">
                                <div className="absolute top-0 left-1/2 w-1 h-8 bg-primary/40 -translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-primary/40 -translate-x-1/2"></div>
                            </div>
                            <div className="w-[380px] h-[380px] rounded-full border border-dashed border-primary/20 absolute animate-spin-reverse-slow opacity-60"></div>
                            <div className="w-[550px] h-[550px] rounded-full border border-primary/5 absolute scale-100 animate-pulse"></div>
                            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent top-1/2 -translate-y-1/2"></div>
                            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent left-1/2 -translate-x-1/2"></div>
                        </div>

                        <div className="relative z-10 w-48 h-48 animate-float">
                            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse-core"></div>
                            <div className="w-full h-full relative flex items-center justify-center">
                                <div className="absolute w-full h-full rounded-full border-2 border-primary/30 blur-[1px] animate-[spin_8s_linear_infinite]"></div>
                                <div className="absolute w-[90%] h-[90%] rounded-full border border-primary/20 rotate-45 animate-[spin_12s_linear_infinite_reverse]"></div>
                                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-600/10 rounded-full backdrop-blur-sm border border-primary/40 shadow-neon relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+")` }}></div>
                                    <span className="material-symbols-outlined text-5xl text-white drop-shadow-[0_0_15px_rgba(6,182,212,1)] animate-pulse">biotech</span>
                                    <div className="absolute w-2 h-2 bg-white rounded-full blur-[2px] top-1/3 left-1/3 animate-ping" style={{ animationDuration: "3s" }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 text-center z-10 relative">
                            <div className="inline-block px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-3 backdrop-blur-md">
                                <span className="text-[10px] font-mono text-primary uppercase tracking-widest animate-pulse">Analysis In Progress</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-neon tracking-tight">Analyzing Morphology</h1>
                            <p className="text-sm text-slate-400 font-light max-w-md mx-auto leading-relaxed h-12">
                                {stages[stage]}
                            </p>
                        </div>

                        {/* Spatial Data Card */}
                        <div className="absolute top-1/3 right-12 hidden lg:block">
                            <div className="glass-card p-3 rounded-lg border-l-2 border-l-primary flex flex-col gap-1 w-32">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Spatial Data</span>
                                <div className="font-mono text-[10px] text-primary space-y-0.5">
                                    <div className="flex justify-between"><span>X-AXIS</span> <span>0.442</span></div>
                                    <div className="flex justify-between"><span>Y-AXIS</span> <span>0.918</span></div>
                                    <div className="flex justify-between"><span>Z-AXIS</span> <span>0.125</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Cell Density Card */}
                        <div className="absolute bottom-1/4 left-12 hidden lg:block">
                            <div className="glass-card p-3 rounded-lg border-r-2 border-r-emerald-500 flex flex-col gap-1 w-32 text-right">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Cell Density</span>
                                <div className="font-mono text-xl text-emerald-400 text-shadow-sm">
                                    2.4<span className="text-xs">µm</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5 bg-black/40 backdrop-blur-md">
                        <div className="p-5 text-center group hover:bg-white/5 transition-colors">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 group-hover:text-primary transition-colors">Scanned Units</p>
                            <p className="text-2xl font-mono font-bold text-slate-200 group-hover:text-white transition-colors">14,205</p>
                        </div>
                        <div className="p-5 text-center group hover:bg-white/5 transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 group-hover:text-red-400 transition-colors">Anomalies</p>
                            <p className="text-2xl font-mono font-bold text-red-400 text-neon-text">12</p>
                        </div>
                        <div className="p-5 text-center group hover:bg-white/5 transition-colors">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 group-hover:text-emerald-400 transition-colors">Confidence</p>
                            <p className="text-2xl font-mono font-bold text-emerald-400 text-neon-text">98.4%</p>
                        </div>
                    </div>

                    {/* Progress Bar Footer */}
                    <div className="p-6 bg-[#080c12] border-t border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                        <div className="flex justify-between items-end mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-neon"></div>
                                <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] text-neon-text">Processing Batch</span>
                                <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">T-MINUS 12s</span>
                            </div>
                            <span className="text-3xl font-mono font-bold text-white tracking-tighter">{progress}<span className="text-lg text-primary/70">%</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden relative backdrop-blur-sm ring-1 ring-white/5">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-primary to-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </section>

                {/* Right Section (System Logs & Hardware Status) */}
                <section className="w-full md:w-80 hidden md:flex flex-col gap-6">
                    {/* System Logs */}
                    <div className="flex-1 glass-card rounded-2xl p-0 font-mono text-xs overflow-hidden relative flex flex-col h-[400px]">
                        <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[10px] text-slate-500">terminal</span>
                                <span className="text-[10px] text-slate-400 font-semibold tracking-wider">SYSTEM LOG</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/50 border border-red-500/30"></div>
                                <div className="w-2 h-2 rounded-full bg-amber-500/50 border border-amber-500/30"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500/50 border border-emerald-500/30"></div>
                            </div>
                        </div>

                        <div className="p-4 space-y-3 text-emerald-500/90 flex-1 overflow-y-auto custom-scrollbar bg-[#05080c]/80 flex flex-col">
                            {stages.slice(0, stage + 1).map((msg, idx) => (
                                <div key={idx} className="flex gap-2 opacity-80 animate-fade-in">
                                    <span className="text-slate-600">09:41:{String(12 + idx * 3).padStart(2, '0')}</span>
                                    <span className={idx === stage ? "text-white" : "text-slate-400"}>{msg}</span>
                                    {idx < stage && <span className="text-emerald-500 ml-auto font-bold">[OK]</span>}
                                    {idx === stage && <span className="text-amber-400 ml-auto animate-pulse font-bold">[BUSY]</span>}
                                </div>
                            ))}
                            <div className="mt-auto flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                <span>Awaiting tensor output...</span>
                                <span className="inline-block w-2 h-4 bg-primary animate-blink"></span>
                            </div>
                        </div>

                        {/* Gradient shadow to hide cut-off text */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#05080c] to-transparent pointer-events-none"></div>
                    </div>

                    {/* Core Status */}
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">memory</span>
                                Core Status
                            </h3>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]"></div>
                                <span className="text-[9px] text-emerald-400 font-bold tracking-wider">ACTIVE</span>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="group/bar">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                                    <span>CPU THREADS</span>
                                    <span className="text-emerald-400 group-hover/bar:text-white transition-colors">42%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-700/30 rounded-full overflow-hidden">
                                    <div className="h-full w-[42%] bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>
                            <div className="group/bar">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                                    <span>VRAM ALLOCATION</span>
                                    <span className="text-primary group-hover/bar:text-white transition-colors">12.4 GB</span>
                                </div>
                                <div className="h-1 w-full bg-slate-700/30 rounded-full overflow-hidden">
                                    <div className="h-full w-[65%] bg-gradient-to-r from-cyan-600 to-primary rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                </div>
                            </div>
                            <div className="group/bar">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                                    <span>TENSOR CORES</span>
                                    <span className="text-purple-400 group-hover/bar:text-white transition-colors">88%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-700/30 rounded-full overflow-hidden">
                                    <div className="h-full w-[88%] bg-gradient-to-r from-purple-600 to-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-lg p-3 flex items-center justify-between border-l-2 border-l-slate-500 hover:border-l-primary transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500 text-sm group-hover:text-primary transition-colors">info</span>
                            <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Preview rendering unavailable</span>
                        </div>
                        <button onClick={() => router.push('/dashboard')} className="text-[9px] font-bold text-slate-300 bg-white/5 px-2 py-1 rounded hover:bg-primary hover:text-white hover:shadow-neon transition-all">
                            FORCE BYPASS
                        </button>
                    </div>
                </section>
            </main>

            {/* Bottom glowing border */}
            <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 shadow-[0_0_10px_#06b6d4]"></div>
        </div>
    );
}
