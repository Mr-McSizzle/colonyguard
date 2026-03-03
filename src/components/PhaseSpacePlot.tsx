"use client";

import React, { useState, useEffect } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import Link from "next/link";
import { useGlobalState } from "@/context/GlobalState";

export default function PhaseSpacePlot() {
    const { colonies, isLoading, selectedColony } = useGlobalState();
    const [currentDay, setCurrentDay] = useState<number>(7);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [trackedIds, setTrackedIds] = useState<string[]>([]);
    const hasInitializedTracker = React.useRef(false);

    // Auto-track the selected colony or default to the first colony
    useEffect(() => {
        if (!hasInitializedTracker.current && colonies.length > 0) {
            if (selectedColony?.id) {
                setTrackedIds([selectedColony.id]);
            } else {
                setTrackedIds([colonies[0].id]);
            }
            hasInitializedTracker.current = true;
        }
    }, [colonies, selectedColony?.id]);

    // Playback loop effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentDay((prev) => (prev >= 7 ? 2 : prev + 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);
    if (isLoading) {
        return (
            <div className="text-slate-300 h-screen overflow-hidden flex items-center justify-center font-sans antialiased bg-[#000510]">
                <span className="material-symbols-outlined text-4xl text-cyan-500 animate-spin">sync</span>
            </div>
        );
    }

    // Filter and map data for the current day interactively via slider
    const chartData = React.useMemo(() => {
        const displayedColonies = trackedIds.length > 0
            ? colonies.filter((c: any) => trackedIds.includes(c.id))
            : colonies;

        return displayedColonies.map((col: any) => {
            const metrics = col.metrics || [];
            // Dynamically seek the exact metric slice for the requested slider UI Day (2-7) 
            const dayMetric = metrics.find((m: any) => m.Day === currentDay) || metrics[metrics.length - 1] || {};

            const compactness = Number(dayMetric.Compactness) || 0;
            const entropy = Number(dayMetric.Entropy) || 0;
            const ciiScore = Number(dayMetric['Colony Instability Index']) || 0;

            let status = "STABLE";
            let color = "#10b981"; // success
            if (ciiScore > 60) {
                status = "CRITICAL";
                color = "#ef4444"; // danger
            } else if (ciiScore >= 40) {
                status = "WATCH";
                color = "#f59e0b"; // warning
            }

            return {
                id: col.id,
                Compactness: compactness,
                Entropy: entropy,
                ciiScore: ciiScore,
                status: status,
                color: color
            };
        }).filter((d: any) => d.Compactness > 0 || d.Entropy > 0); // only show valid tracking points
    }, [colonies, currentDay]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#020617]/90 border border-cyan-500/30 p-3 rounded shadow-lg backdrop-blur-md">
                    <p className="text-cyan-400 font-mono text-xs font-bold mb-1">{data.id}</p>
                    <p className="text-slate-200 font-sans text-xs">Compactness: {data.Compactness.toFixed(2)}</p>
                    <p className="text-slate-200 font-sans text-xs">Entropy: {data.Entropy.toFixed(2)}</p>
                    <p className="text-slate-200 font-sans text-xs">CII Score: <span style={{ color: data.color }} className="font-bold">{data.ciiScore.toFixed(1)}</span></p>
                    <p className="text-slate-200 font-sans text-[10px] mt-1 uppercase" style={{ color: data.color }}>{data.status}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="text-slate-300 h-screen overflow-hidden flex font-sans antialiased selection:bg-primary selection:text-white bg-[#000510] relative">

            {/* Background radial gradients */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.03) 0%, transparent 30%)`,
                }}
            />

            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="particle w-1 h-1 top-1/4 left-1/4 animate-[float_8s_infinite]"></div>
                <div className="particle w-2 h-2 top-3/4 left-1/3 animate-[float_12s_infinite_reverse]"></div>
                <div className="particle w-1 h-1 top-1/2 left-3/4 animate-[float_10s_infinite]"></div>
                <div
                    className="absolute inset-0 opacity-20 mask-image-gradient-b"
                    style={{ backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNiwgMTgyLCAyMTIsIDAuMSkiLz48L3N2Zz4=')` }}
                ></div>
            </div>

            <nav className="w-20 lg:w-64 flex flex-col justify-between glass-panel border-r-0 h-full shrink-0 z-20 m-4 rounded-2xl relative">
                <div className="flex flex-col">
                    <div className="h-24 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-blue-600/80 flex items-center justify-center shadow-neon-cyan text-white backdrop-blur-md border border-white/20 relative group">
                            <span className="material-symbols-outlined text-3xl drop-shadow-md">science</span>
                            <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        </div>
                        <div className="hidden lg:block ml-4">
                            <h1 className="font-bold text-xl tracking-wide uppercase text-white holographic-text">
                                Colony<span className="text-primary">Guard</span>
                            </h1>
                            <p className="text-[10px] text-primary/60 font-mono tracking-widest mt-1">SYS.VER 2.4.1</p>
                        </div>
                    </div>

                    <ul className="flex flex-col py-6 space-y-3 px-3">
                        <li>
                            <Link className="flex items-center p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-primary hover:shadow-neon-cyan hover:border hover:border-primary/30 transition-all duration-300 group" href="/dashboard">
                                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">dashboard</span>
                                <span className="hidden lg:block ml-3 font-medium tracking-wide">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center p-3 rounded-xl bg-primary/10 text-primary border border-primary/40 shadow-neon-cyan relative overflow-hidden cursor-default">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                                <span className="material-symbols-outlined text-2xl">analytics</span>
                                <span className="hidden lg:block ml-3 font-medium tracking-wide">Analysis</span>
                            </div>
                        </li>
                        <li>
                            <div className="mt-8 pt-4 border-t border-white/10 hidden lg:block">
                                <div className="text-[10px] text-slate-500 font-mono tracking-wider mb-2 uppercase">AI Engine Status</div>
                                <div className="bg-black/30 rounded-lg p-3 border border-white/5 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-white font-medium">XGBoost Max</span>
                                        <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono border border-primary/30">v2.0</span>
                                    </div>
                                    <div className="flex items-end gap-1 mb-2 mt-2">
                                        <span className="text-2xl font-bold text-success drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">94.2</span>
                                        <span className="text-xs text-success/80 font-mono mb-1">%</span>
                                    </div>
                                    <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-success to-emerald-300 w-[94%] shadow-[0_0_8px_#10b981]"></div>
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-2 font-mono flex justify-between">
                                        <span>R² ACCURACY</span>
                                        <span className="text-success/80">NOMINAL</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="p-4 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
                    <div className="hidden lg:flex items-center p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold shadow-inner text-white">DR</div>
                        <div className="ml-3">
                            <p className="text-xs font-bold text-white tracking-wide">Dr. R. Vance</p>
                            <p className="text-[10px] text-primary/70 uppercase tracking-wider">Lead Analyst</p>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative p-4 pl-0">
                <header className="h-20 glass-panel rounded-2xl flex items-center justify-between px-8 z-10 mb-6 mx-2 mt-2 lg:mt-0 lg:mx-0">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 holographic-text">
                                Phase-Space Visualization
                                <span className="px-2 py-1 rounded text-[10px] font-mono bg-primary/10 text-primary uppercase tracking-widest border border-primary/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                    Live Analysis
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span>
                                <p className="text-xs text-slate-400 font-mono">
                                    BATCH: {chartData.length > 0 ? "IPSC-LIVE-STREAM" : "NO-DATA"} • <span className="text-primary/70">Compactness vs Entropy Projection</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <button className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-lg border border-primary/20 shadow-inner hover:bg-white/10 transition-colors text-xs font-mono text-primary/80 tracking-widest">
                                <span>Tracked ({trackedIds.length || 'All'})</span>
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#020617]/95 border border-primary/30 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-primary/50">
                                <div className="p-2 space-y-1">
                                    <label className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer border-b border-white/10 mb-1 pb-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox bg-black border-primary rounded text-primary focus:ring-primary focus:ring-offset-0"
                                            checked={trackedIds.length === 0}
                                            onChange={() => setTrackedIds([])}
                                        />
                                        <span className="text-xs font-mono text-slate-300">Track All</span>
                                    </label>
                                    {colonies.map((col: any) => (
                                        <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox bg-black border-primary rounded text-primary focus:ring-primary focus:ring-offset-0"
                                                checked={trackedIds.includes(col.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setTrackedIds([...trackedIds, col.id]);
                                                    else setTrackedIds(trackedIds.filter(id => id !== col.id));
                                                }}
                                            />
                                            <span className="text-xs font-mono text-slate-300">{col.id}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-lg border border-primary/20 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-success animate-[pulse_1.5s_infinite] shadow-[0_0_8px_#10b981]"></span>
                            <span className="text-xs font-mono text-primary/80 tracking-widest hidden md:inline">GPU INFERENCE ACTIVE</span>
                        </div>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined">info</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-2 pb-2 scroll-smooth">
                    <div className="grid grid-cols-12 gap-6 h-full min-h-[600px]">
                        {/* Left side Plot + Timeline */}
                        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 h-full">

                            <div className="relative flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col plot-container-3d border border-primary/20">
                                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent z-10">
                                    <h3 className="font-mono text-sm uppercase tracking-widest text-primary flex items-center gap-2 drop-shadow-md">
                                        <span className="material-symbols-outlined text-lg">scatter_plot</span>
                                        Morphology Trajectory Space
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-xs bg-black/30 px-2 py-1 rounded border border-white/5">
                                            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_5px_#10b981]"></span>
                                            <span className="text-slate-300">Stable</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs bg-black/30 px-2 py-1 rounded border border-white/5">
                                            <span className="w-2 h-2 rounded-full bg-danger shadow-[0_0_5px_#ef4444]"></span>
                                            <span className="text-slate-300">Critical</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex-1 p-0 w-full h-full overflow-hidden bg-gradient-to-b from-transparent to-black/40">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-primary/50 tracking-[0.2em] whitespace-nowrap pointer-events-none drop-shadow-lg z-10">
                                        ENTROPY (TEXTURE INSTABILITY) ↑
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/50 tracking-[0.2em] whitespace-nowrap pointer-events-none drop-shadow-lg z-10">
                                        COMPACTNESS (MORPHOLOGICAL COMPLEXITY) →
                                    </div>
                                    <div className="absolute inset-0 pointer-events-none z-0">
                                        <div className="absolute bottom-0 left-0 right-0 h-full holo-grid opacity-30"></div>
                                        <div className="absolute top-[-20%] left-[20%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none animate-pulse"></div>
                                        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-danger/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
                                    </div>

                                    <div className="w-full h-full relative z-10 p-8">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" vertical={true} horizontal={true} />
                                                <XAxis
                                                    type="number"
                                                    dataKey="Compactness"
                                                    name="Compactness"
                                                    stroke="rgba(6, 182, 212, 0.6)"
                                                    tick={{ fill: 'rgba(6, 182, 212, 0.6)', fontFamily: "'Space Mono', monospace", fontSize: 10 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={[(dataMin: number) => isFinite(dataMin) ? Math.max(0, dataMin - 10) : 0, (dataMax: number) => isFinite(dataMax) ? dataMax + 10 : 100]}
                                                />
                                                <YAxis
                                                    type="number"
                                                    dataKey="Entropy"
                                                    name="Entropy"
                                                    stroke="rgba(6, 182, 212, 0.6)"
                                                    tick={{ fill: 'rgba(6, 182, 212, 0.6)', fontFamily: "'Space Mono', monospace", fontSize: 10 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={[(dataMin: number) => isFinite(dataMin) ? Math.max(0, dataMin - 5) : 0, (dataMax: number) => isFinite(dataMax) ? dataMax + 5 : 100]}
                                                />
                                                <ZAxis type="number" range={[100, 300]} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(6, 182, 212, 0.5)' }} />
                                                <Scatter name="Colonies" data={chartData} isAnimationActive={true} animationDuration={600} animationEasing="ease-out">
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Scatter>
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline slider row */}
                            <div className="h-28 glass-panel rounded-2xl p-6 flex items-center gap-8 shadow-3d-float border-t border-primary/20 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-[scan_3s_linear_infinite]"></div>
                                <div className="w-40 shrink-0 z-10">
                                    <h4 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                                        Time Evolution
                                        <span className="material-symbols-outlined text-xs text-primary animate-spin">data_usage</span>
                                    </h4>
                                    <p className="text-[10px] font-mono text-primary/60 mt-1 uppercase">Window: 72 Hours</p>
                                </div>
                                <div className="flex-1 relative pt-6 pb-2 group-hover:transform group-hover:scale-[1.01] transition-transform duration-500">
                                    <div className="h-2 bg-black/60 rounded-full w-full relative border border-white/10 shadow-inner overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary/50 via-primary to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-300"
                                            style={{ width: `${((currentDay - 2) / 5) * 100}%` }}
                                        ></div>
                                        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDF2MmgyVjFIMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')` }}></div>

                                        <input
                                            type="range"
                                            min={2}
                                            max={7}
                                            step={1}
                                            value={currentDay}
                                            onChange={(e) => setCurrentDay(Number(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                        />
                                    </div>
                                    <div
                                        className="absolute top-1/2 -translate-y-[20%] w-8 h-8 -ml-4 cursor-pointer z-20 hover:scale-110 transition-transform pointer-events-none"
                                        style={{ left: `${((currentDay - 2) / 5) * 100}%` }}
                                    >
                                        <div className="w-full h-full rounded-full bg-black border border-primary shadow-[0_0_20px_rgba(6,182,212,0.8)] relative flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                                            <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20"></div>
                                        </div>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-primary border border-primary/50 text-[10px] font-bold px-3 py-1 rounded backdrop-blur-md shadow-neon-cyan whitespace-nowrap">
                                            DAY {currentDay}
                                        </div>
                                    </div>
                                    <div className="absolute top-5 left-0 -translate-x-1/2 flex flex-col items-center">
                                        <div className="h-3 w-px bg-slate-600"></div>
                                        <span className="text-[9px] font-mono text-slate-500 mt-1">T-0</span>
                                    </div>
                                    <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                        <div className="h-3 w-px bg-slate-600"></div>
                                        <span className="text-[9px] font-mono text-slate-500 mt-1">T-36h</span>
                                    </div>
                                    <div className="absolute top-5 right-0 translate-x-1/2 flex flex-col items-center">
                                        <div className="h-3 w-px bg-slate-600"></div>
                                        <span className="text-[9px] font-mono text-slate-500 mt-1">T-72h</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 z-10">
                                    <button onClick={() => setIsPlaying(!isPlaying)} className={`w-10 h-10 flex items-center justify-center rounded-xl border text-slate-400 hover:text-white transition-all shadow-lg backdrop-blur-sm group/btn ${isPlaying ? 'bg-primary/20 border-primary text-primary shadow-neon-cyan' : 'border-white/10 hover:bg-white/10 hover:border-primary/50'}`}>
                                        <span className="material-symbols-outlined text-xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                    </button>
                                    <button onClick={() => { setIsPlaying(false); setCurrentDay(7); }} className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-primary hover:border-primary/50 transition-all shadow-lg backdrop-blur-sm group/btn">
                                        <span className="material-symbols-outlined text-xl group-hover/btn:text-white">fast_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right side Info Bar */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group shadow-3d-float border-l-4 border-l-primary flex-shrink-0">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                                <h4 className="text-xs font-mono uppercase text-primary/70 mb-6 tracking-widest border-b border-white/5 pb-2">Colony Status</h4>
                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase">Stability Index</div>
                                        <div className="text-3xl font-bold text-white flex items-baseline gap-1 drop-shadow-md">
                                            {chartData.length > 0 ? Math.round(100 - (chartData.reduce((acc: number, c: any) => acc + c.ciiScore, 0) / chartData.length)) : 0}<span className="text-sm text-primary font-normal">%</span>
                                        </div>
                                        <div className="text-xs text-success font-medium flex items-center mt-2 bg-success/10 w-fit px-2 py-0.5 rounded border border-success/20">
                                            <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                                            Nominal
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase">Risk Factor</div>
                                        <div className={`text-3xl font-bold flex items-baseline gap-1 ${chartData.some((c: any) => c.status === 'CRITICAL') ? 'text-danger animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-success drop-shadow-md'}`}>
                                            {chartData.some((c: any) => c.status === 'CRITICAL') ? 'High' : 'Low'}
                                        </div>
                                        <div className={`text-xs font-medium mt-2 ${chartData.some((c: any) => c.status === 'CRITICAL') ? 'text-danger/80' : 'text-success/80'}`}>
                                            {chartData.some((c: any) => c.status === 'CRITICAL') ? 'Deviation Tracking' : 'Stable'}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Processing Load</span>
                                        <span className="text-xs font-mono text-primary animate-pulse">{Math.floor(Math.random() * 20) + 30}ms</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-primary to-blue-400 w-[45%] shadow-[0_0_10px_#06b6d4]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl p-5 shadow-lg relative overflow-hidden group border border-primary/30 flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-blue-900/80 backdrop-blur-md"></div>
                                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-3xl group-hover:bg-white/30 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
                                <h4 className="text-sm font-bold mb-2 relative z-10 text-white drop-shadow-sm">Generate Report</h4>
                                <p className="text-xs text-blue-100/80 mb-4 relative z-10 font-light">Export full phase-space analysis data including CSV trajectory points.</p>
                                <div className="flex gap-2 relative z-10">
                                    <button onClick={() => window.print()} className="flex-1 py-2 bg-white text-primary font-bold text-xs rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-0.5">
                                        Export PDF
                                    </button>
                                    <button onClick={() => {
                                        // Build CSV from currently tracked chartData
                                        const headers = "Colony_ID,Day,Status,CII_Score,Compactness,Entropy\n";
                                        const rows = chartData.map(c => `${c.id},${currentDay},${c.status},${c.ciiScore},${c.Compactness},${c.Entropy}`).join("\n");
                                        const blob = new Blob([headers + rows], { type: 'text/csv' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.setAttribute('href', url);
                                        a.setAttribute('download', `ColonyGuard_PhaseSpace_Day${currentDay}.csv`);
                                        a.click();
                                    }} className="flex-1 py-2 bg-black/30 text-white font-semibold text-xs rounded-lg border border-white/20 hover:bg-black/50 hover:border-white/40 transition-colors">
                                        Raw Data
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
