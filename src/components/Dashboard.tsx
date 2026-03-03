"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ColonyCard, { ColonyStatus, StressLevel } from "./ColonyCard";
import ColonyDetailPanel from "./ColonyDetailPanel";
import { useGlobalState } from "@/context/GlobalState";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, YAxis } from "recharts";
import AIAssistant from "./AIAssistant";

export default function Dashboard() {
    const { colonies, summaryStats, selectedColony, setSelectedColony, isLoading } = useGlobalState();
    const [batchCount, setBatchCount] = useState(1);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    // If global state is still loading the dataset, show a simple spinner.
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark text-cyan-400">
                <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
            </div>
        );
    }

    // Process fetched data for display
    const activeColonies = colonies.map((colony: any) => {
        const metrics = colony.metrics || [];
        const latestMetric = metrics[metrics.length - 1] || {};

        const ciiScore = latestMetric['Colony Instability Index'] || 0;

        let status: ColonyStatus = "STABLE";
        if (ciiScore > 60) status = "CRITICAL";
        else if (ciiScore >= 40) status = "WATCH";

        // Pseudo subId
        const subId = `ID: #${colony.id.replace('COL_', '')} // SECTOR-${Math.floor(Math.random() * 9) + 1}`;

        // Hardcoded example image based on status since CSV lacks images
        const imageSrc = status === "CRITICAL" ?
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAWOMcbru4HP0TLHysHVWK___R3D8A3aC9HqHt3eu7GAPnrwov1-qdaR5fUCvd8MUoe2202cuDbAUFRZ-ZYjPzwJTzaXZj_o-ld8knuXWV5sO1tOacqWaRrZOEj0fSV3p_syGkxYqNGucBjvveoC8te07qAXuIq_ZVRNMC4HZ3EhB1bdruJci4Q4K7w1QimTEl-hJ4LWZtFvGzHRPJzxtxAS3CtxjYx4-6C8gnLFi_e9hCf1Uf9W2De9ErFgJNAnEgb0E_JDqMY1vyx" :
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAjSFhTIM_3cB3MSknl2ssw5-HcaLHr_fsONLEDq2N-vejierz7BANe6hTPg4ry-ssbv8aU_-Wureva2qIHjtPfeCtwsnOGw-WA7LMMhmL17tyhGZdLiexMgFZ2FlqS3bzq0IKZbGLCpJFKH0xza2imX125ySaYdQlDfEAZcRos-D05eFG5iKoskr6sM8TMAXdKzdmvD2_VqE2pktzd_wrTCBGvYm4SBbhaale6_5xLgd-qnIkkBJr5_U_Dyn6ZCG_tH_M-X9u9_Jc_";

        return {
            id: colony.id,
            subId: subId,
            status: status,
            imageSrc: imageSrc,
            ciiScore: ciiScore,
            stressLevel: latestMetric['Stress Condition'] || 'UNKNOWN',
            rawColony: colony // Reference for detail panel
        };
    });

    // Calculate interactive risk distribution matrix for visual analysis
    const riskDistribution = useMemo(() => {
        let low = 0, med = 0, high = 0, crit = 0;
        activeColonies.forEach(c => {
            if (c.ciiScore < 20) low++;
            else if (c.ciiScore < 40) med++;
            else if (c.ciiScore < 60) high++;
            else crit++;
        });
        return [
            { name: 'Low (0-20)', value: low, color: '#10b981' },
            { name: 'Med (20-40)', value: med, color: '#f59e0b' },
            { name: 'High (40-60)', value: high, color: '#f97316' },
            { name: 'Crit (>60)', value: crit, color: '#ef4444' }
        ];
    }, [activeColonies]);

    return (
        <div className="font-display min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* Backgrounds */}
            <div className="fixed inset-0 bg-background-dark z-[-2]"></div>
            <div className="fixed inset-0 bg-hex-pattern opacity-30 z-[-1] animate-pulse-glow"></div>
            <div className="fixed inset-0 bg-particles opacity-20 z-[-1]"></div>

            {/* Telemetry overlay */}
            <div className="telemetry-bg">
                <div className="telemetry-line top-[15%] left-0 w-full"></div>
                <div className="telemetry-line top-[85%] left-0 w-full"></div>
                <div className="telemetry-line top-0 left-[10%] h-full w-px bg-gradient-to-b from-transparent via-cyan-900/30 to-transparent"></div>
                <div className="telemetry-line top-0 right-[10%] h-full w-px bg-gradient-to-b from-transparent via-cyan-900/30 to-transparent"></div>
                <div className="telemetry-text top-[16%] left-[2%]">SYS.MONITORING.ACTIVE</div>
                <div className="telemetry-text top-[16%] right-[2%]">NODE.LINK.ESTABLISHED</div>
                <div className="telemetry-text bottom-[16%] left-[2%]">GRID.REF.{Math.floor(Math.random() * 900) + 100}</div>
                <div className="telemetry-text bottom-[16%] right-[2%]">LATENCY: {Math.floor(Math.random() * 20) + 5}ms</div>
            </div>

            <div className="relative z-10 flex flex-col h-screen overflow-hidden">
                {/* Navigation */}
                <nav className="w-full glass-panel-3d border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] cursor-pointer">
                            <span className="material-symbols-outlined text-3xl">biotech</span>
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                COLONY<span className="text-cyan-400 text-glow">GUARD</span>
                            </h1>
                        </Link>
                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent mx-2"></div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-success shadow-[0_0_10px_#10b981]"></span>
                            </span>
                            <span className="text-xs font-mono font-bold text-success tracking-wider drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                                LIVE ANALYSIS
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_5px_#10b981]"></span>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase leading-none mb-0.5">AI Engine</span>
                                    <div className="flex items-baseline gap-1 leading-none">
                                        <span className="text-white font-bold text-xs">XGBoost Max</span>
                                        <span className="text-success text-xs font-mono">94.2% R²</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/"
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-sm"
                            onClick={() => setIsNotificationsOpen(false)}
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Analysis
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`p-2 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                {activeColonies.filter(c => c.status === "CRITICAL").length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full shadow-[0_0_5px_#ef4444] animate-pulse"></span>
                                )}
                                <span className={`material-symbols-outlined ${isNotificationsOpen ? 'text-white' : 'text-slate-300'}`}>notifications</span>
                            </button>

                            {/* Critical Notifications Popup */}
                            {isNotificationsOpen && (
                                <div className="absolute top-full right-0 mt-4 w-80 bg-[#0a0f18] border border-white/10 shadow-2xl rounded-xl z-50 overflow-hidden backdrop-blur-xl">
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                                        <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                                            <span className="material-symbols-outlined text-danger text-sm text-shadow">warning</span>
                                            CRITICAL ALERTS
                                        </h3>
                                        <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {activeColonies.filter(c => c.status === "CRITICAL").length === 0 ? (
                                            <div className="p-6 text-slate-400 text-sm text-center">No critical instabilities detected in active batch.</div>
                                        ) : (
                                            activeColonies.filter(c => c.status === "CRITICAL").map((colony) => (
                                                <div
                                                    key={colony.id}
                                                    className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors flex flex-col gap-2 group"
                                                    onClick={() => {
                                                        setSelectedColony(colony);
                                                        setIsNotificationsOpen(false);
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">{colony.id}</span>
                                                        <span className="text-xs font-mono bg-danger/20 text-danger border border-danger/30 px-2 py-0.5 rounded shadow-[0_0_5px_rgba(239,68,68,0.2)]">
                                                            CII: {colony.ciiScore.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 leading-relaxed font-mono truncate">
                                                        Trajectory exceeding 60% instability threshold.
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {activeColonies.filter(c => c.status === "CRITICAL").length > 0 && (
                                        <div className="p-3 bg-black/60 border-t border-danger/20 text-center">
                                            <button className="text-xs text-danger hover:text-red-400 font-mono tracking-wider transition-colors inline-flex items-center gap-1">
                                                <span>ISOLATE ALL CRITICAL</span>
                                                <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 perspective-1000">
                    <div className="max-w-[1400px] mx-auto space-y-8">

                        {/* Top Stat Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Total Colonies */}
                            <div className="glass-stat-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                                    <span className="material-symbols-outlined text-6xl text-white transform rotate-12">grid_view</span>
                                </div>
                                <h3 className="text-slate-400 text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"></span> Total Colonies
                                </h3>
                                <div className="flex items-end gap-3 relative z-10">
                                    <span className="text-5xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">{summaryStats.total}</span>
                                    <span className="text-xs font-mono text-success mb-2 flex items-center bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
                                        <span className="material-symbols-outlined text-sm mr-1">trending_up</span> +5%
                                    </span>
                                </div>
                                <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-cyan-500 w-3/4 shadow-[0_0_10px_#06b6d4]"></div>
                                </div>
                            </div>

                            {/* High Instability */}
                            <div className="glass-stat-card p-6 rounded-2xl relative overflow-hidden group border-l-4 border-l-danger hover:-translate-y-1 transition-transform duration-300 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-danger/10 rounded-full blur-2xl"></div>
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <span className="material-symbols-outlined text-6xl text-danger animate-pulse">warning</span>
                                </div>
                                <h3 className="text-red-300 text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-danger rounded-full shadow-[0_0_5px_#ef4444]"></span> High Instability
                                </h3>
                                <div className="flex items-end gap-3 relative z-10">
                                    <span className="text-5xl font-bold text-danger text-glow-red">{summaryStats.critical}</span>
                                    <span className="text-xs font-mono text-danger mb-2 flex items-center bg-danger/10 px-1.5 py-0.5 rounded border border-danger/20">
                                        <span className="material-symbols-outlined text-sm mr-1">priority_high</span> 2%
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs text-red-300/70 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-danger animate-ping"></span> ACTION REQUIRED
                                </div>
                            </div>

                            {/* Avg CII Score */}
                            <div className="glass-stat-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                                    <span className="material-symbols-outlined text-6xl text-cyan-400 transform rotate-12">speed</span>
                                </div>
                                <h3 className="text-slate-400 text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"></span> Avg CII Score
                                </h3>
                                <div className="flex items-end gap-3 relative z-10">
                                    <span className="text-5xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">58.4</span>
                                    <span className="text-xs font-mono text-slate-400 mb-2">/ 100</span>
                                </div>
                                <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-success to-yellow-400 w-[58%] shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                                </div>
                            </div>

                            {/* Early Warning */}
                            <div className="glass-stat-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                                    <span className="material-symbols-outlined text-6xl text-purple-400 transform rotate-12">timer</span>
                                </div>
                                <h3 className="text-slate-400 text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_5px_#a855f7]"></span> Early Warning
                                </h3>
                                <div className="flex items-end gap-3 relative z-10">
                                    <span className="text-5xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                                        72<span className="text-xl font-normal text-slate-500 ml-1">hrs</span>
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-between text-xs text-slate-400 font-mono">
                                    <span>Status: ACTIVE</span>
                                    <span className="text-success drop-shadow-[0_0_3px_#10b981]">OPTIMAL</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column (Active Colonies) */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="flex justify-between items-center px-2 border-b border-white/5 pb-2">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        <span className="material-symbols-outlined text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]">blur_on</span>
                                        <span className="tracking-wide">ACTIVE COLONIES</span>
                                    </h2>
                                    <button className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center transition-colors uppercase tracking-wider gap-1 group">
                                        Full Database <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Map over our data to render ColonyCard components */}
                                    {activeColonies.map((col) => (
                                        <ColonyCard
                                            key={col.id}
                                            id={col.id}
                                            subId={col.subId}
                                            status={col.status}
                                            imageSrc={col.imageSrc}
                                            ciiScore={col.ciiScore}
                                            stressLevel={col.stressLevel}
                                            onClick={() => setSelectedColony(col)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Right Column (Widgets) */}
                            <div className="flex flex-col gap-6">

                                {/* Cost Optimization */}
                                <div className="glass-panel-3d p-6 rounded-2xl border border-cyan-500/10 bg-[linear-gradient(180deg,rgba(6,182,212,0.05)_0%,rgba(15,23,42,0.4)_100%)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <span className="material-symbols-outlined text-8xl text-cyan-500 -mt-4 -mr-4">savings</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 tracking-wider">
                                        <span className="material-symbols-outlined text-cyan-400">savings</span>
                                        <span>COST OPTIMIZATION</span>
                                    </h3>
                                    <div className="mb-8 text-center relative z-10">
                                        <div className="text-5xl font-mono font-bold text-white text-glow mb-2">
                                            {(batchCount * 200000 * 0.25).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                        </div>
                                        <p className="text-xs text-cyan-400/60 font-mono border-t border-cyan-500/10 pt-2 inline-block">
                                            EST. QUARTERLY RECOVERY
                                        </p>
                                    </div>
                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-mono mb-3 text-cyan-300/70 tracking-widest">
                                                <span>FACILITY BATCH VOLUME</span>
                                                <span className="text-white bg-cyan-900/50 px-1 rounded">{batchCount} BATCH{batchCount !== 1 ? 'ES' : ''}/MO</span>
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute -inset-1 bg-cyan-500/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                                                <input
                                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer relative z-10 hover:scale-[1.01] transition-transform [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#22d3ee] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                                                    max="50"
                                                    min="1"
                                                    type="range"
                                                    value={batchCount}
                                                    onChange={(e) => setBatchCount(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Resource Eff.</span>
                                                <span className="text-xs font-bold text-success font-mono">HIGH</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden shadow-inner">
                                                <div className="bg-success h-full w-[85%] shadow-[0_0_10px_#10b981]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-time Batch Risk Distribution */}
                                <div className="glass-panel-3d p-6 rounded-2xl flex-1 flex flex-col relative overflow-hidden group">
                                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-700"></div>
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between tracking-wider relative z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-cyan-400">bar_chart</span>
                                            <span>BATCH RISK DISTRIBUTION</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_5px_#10b981] animate-pulse"></span>
                                            <span className="text-[10px] text-success font-mono">LIVE SYNC</span>
                                        </div>
                                    </h3>
                                    <div className="relative rounded-xl overflow-hidden flex-1 min-h-[180px] bg-black/40 border border-white/5 pt-4 pb-2 px-2 shadow-inner">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={riskDistribution}>
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="#475569"
                                                    fontSize={9}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={10}
                                                    fontFamily="monospace"
                                                />
                                                <YAxis hide domain={[0, 'dataMax + 5']} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                                    labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1500}>
                                                    {riskDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-xs font-mono px-1 space-x-2">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 mb-1 leading-none uppercase tracking-wider text-[9px]">Population Variance</span>
                                            <span className="text-white font-bold tracking-wider">{summaryStats.total} TOTAL</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-slate-500 mb-1 leading-none uppercase tracking-wider text-[9px]">Mean Index</span>
                                            <span className="text-white font-bold tracking-wider">{summaryStats?.avgInstability?.toFixed(1) || '0.0'} CII</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-[110]">
                <button
                    onClick={() => setIsAssistantOpen(!isAssistantOpen)}
                    className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 text-white rounded-full shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-white/20 relative group"
                >
                    <span className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20"></span>
                    <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-500">science</span>
                </button>
            </div>

            <AIAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

            {/* Slide-in panel backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-500 ${selectedColony ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSelectedColony(null)}
            ></div>

            {/* Slide-in panel for selected colony */}
            <div className={`fixed inset-y-0 right-0 z-[100] w-full lg:w-[85%] border-l border-white/10 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] transform transition-transform duration-500 ease-in-out ${selectedColony ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedColony && (
                    <ColonyDetailPanel
                        colony={selectedColony.rawColony}
                        onClose={() => setSelectedColony(null)}
                    />
                )}
            </div>
        </div>
    );
}
