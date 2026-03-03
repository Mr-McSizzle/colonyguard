"use client";

import React, { useRef, useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Link from "next/link";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ColonyDetailPanel({ colony, onClose }: { colony: any, onClose: () => void }) {
    const chartRef = useRef<ChartJS<"line">>(null);
    const [gradientCyan, setGradientCyan] = useState<CanvasGradient | null>(null);
    const [gradientPurple, setGradientPurple] = useState<CanvasGradient | null>(null);
    const [gradientRed, setGradientRed] = useState<CanvasGradient | null>(null);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.canvas.getContext("2d");
        if (!ctx) return;

        const gradCyan = ctx.createLinearGradient(0, 0, 0, 300);
        gradCyan.addColorStop(0, "rgba(6, 182, 212, 0.4)");
        gradCyan.addColorStop(1, "rgba(6, 182, 212, 0)");
        setGradientCyan(gradCyan);

        const gradPurple = ctx.createLinearGradient(0, 0, 0, 300);
        gradPurple.addColorStop(0, "rgba(168, 85, 247, 0.4)");
        gradPurple.addColorStop(1, "rgba(168, 85, 247, 0)");
        setGradientPurple(gradPurple);

        const gradRed = ctx.createLinearGradient(0, 0, 0, 300);
        gradRed.addColorStop(0, "rgba(239, 68, 68, 0.4)");
        gradRed.addColorStop(1, "rgba(239, 68, 68, 0)");
        setGradientRed(gradRed);
    }, []);

    // Data extraction - Safety parsed for exact Day arrays
    const metrics = colony?.metrics || [];
    const latestMetric = metrics[metrics.length - 1] || {};
    const ciiScore = latestMetric['Colony Instability Index'] || 0;
    const isCritical = ciiScore > 60;
    const isWarning = ciiScore >= 40 && ciiScore <= 60;

    // Filter to Days 2-7 if present to prevent charting bugs
    const timelineMetrics = metrics.filter((m: any) => m.Day >= 2 && m.Day <= 7);

    // Map data for chart
    const chartLabels = timelineMetrics.map((m: any) => `Day ${m.Day}`);
    const compactnessData = timelineMetrics.map((m: any) => (m.Compactness || 0) * 100);
    const entropyData = timelineMetrics.map((m: any) => Math.min(100, ((m.Entropy || 0) / 10) * 100));
    const ciiData = timelineMetrics.map((m: any) => m['Colony Instability Index']);

    const data = {
        labels: chartLabels.length > 0 ? chartLabels : ["Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
        datasets: [
            {
                label: "Compactness",
                data: compactnessData.length > 0 ? compactnessData : [45, 48, 50, 52, 55, 60],
                borderColor: "#06b6d4",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: "#06b6d4",
            },
            {
                label: "Entropy",
                data: entropyData.length > 0 ? entropyData : [30, 32, 35, 40, 42, 45],
                borderColor: "#a855f7",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: "#a855f7",
            },
            {
                label: "CII Score",
                data: ciiData.length > 0 ? ciiData : [20, 22, 25, 28, 35, 45],
                borderColor: "#ef4444",
                backgroundColor: gradientRed || "rgba(239, 68, 68, 0.2)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: "#0a0f18",
                pointBorderColor: "#ef4444",
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(10, 15, 24, 0.95)",
                titleColor: "#fff",
                bodyColor: "#cbd5e1",
                titleFont: { family: "'Space Mono', monospace" },
                bodyFont: { family: "'DM Sans', sans-serif" },
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
            },
        },
        scales: {
            x: {
                grid: {
                    color: "rgba(255, 255, 255, 0.02)",
                    drawBorder: false,
                },
                ticks: {
                    color: "#64748b",
                    font: {
                        family: "'Space Mono', monospace",
                        size: 10,
                    },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 4,
                },
            },
            y: {
                grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                    drawBorder: false,
                },
                ticks: {
                    display: false,
                },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
    };

    return (
        <div className="text-gray-100 font-sans h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white relative bg-deep-bg">
            {/* Background radial gradients */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08), transparent 25%)`,
                    backgroundAttachment: "fixed"
                }}
            />

            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-[#0a0f18]/90 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0 w-full shadow-lg relative">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl neon-text">biotech</span>
                        <span className="font-bold text-xl tracking-tight text-white">ColonyGuard</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <Link onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors" href="/dashboard">Dashboard</Link>
                    <button onClick={() => alert('Launching High-Fidelity 3D Simulation Engine...')} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">Analysis / Simulation</button>
                    <button onClick={() => {
                        const blob = new Blob([JSON.stringify(colony, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('href', url);
                        a.setAttribute('download', `ColonyGuard_Archive_${colony?.id || 'COL_UNKNOWN'}.json`);
                        a.click();
                    }} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors flex items-center gap-1 active:scale-95"><span className="w-1.5 h-1.5 rounded-full bg-danger shadow-[0_0_5px_#ef4444]"></span> Archive</button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="w-2 h-2 bg-danger rounded-full animate-pulse shadow-neon-red"></span>
                        <span className="text-xs font-mono font-bold text-danger tracking-wider">SYSTEM ALERT ACTIVE</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border border-white/20 shadow-lg"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col pt-6 pb-24 px-6 overflow-hidden relative z-10 max-w-[1920px] mx-auto w-full h-full gap-6">

                {/* Top Info Bar */}
                <div className="w-full shrink-0 flex items-center justify-between glass-panel-detail rounded-2xl p-6 h-24">
                    <div className="flex items-center gap-6">
                        <div className="w-2 h-12 bg-danger rounded-full shadow-neon-red"></div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-4 font-mono">
                                {colony?.id || 'COL_UNKNOWN'}
                                {isCritical && <span className="px-3 py-1 rounded text-sm font-bold bg-danger/10 text-danger border border-danger/30 uppercase tracking-widest shadow-neon-red">Critical Status</span>}
                                {isWarning && <span className="px-3 py-1 rounded text-sm font-bold bg-warning/10 text-warning border border-warning/30 uppercase tracking-widest">Watch Status</span>}
                                {!isCritical && !isWarning && <span className="px-3 py-1 rounded text-sm font-bold bg-success/10 text-success border border-success/30 uppercase tracking-widest">Stable</span>}
                            </h1>
                            <div className="flex items-center gap-4 mt-1 text-gray-400 text-sm font-mono">
                                <span>ID: {colony ? `IPSC-${colony.id.replace('COL_', '')}` : 'IPSC-2023-X'}</span>
                                <span className="text-gray-600">•</span>
                                <span>BATCH #8922</span>
                                <span className="text-gray-600">•</span>
                                <span>Day: {latestMetric.Day || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 relative z-20">
                        <button onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert(`Copied link to clipboard for ${colony?.id || 'COL_UNKNOWN'}`);
                        }} className="p-3 bg-surface-glass-highlight hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all shadow-lg active:scale-95">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                        <button onClick={() => window.print()} className="p-3 bg-surface-glass-highlight hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all shadow-lg active:scale-95">
                            <span className="material-symbols-outlined">print</span>
                        </button>
                        <button onClick={() => alert('Opening Advanced Configuration & Settings Panel...')} className="p-3 bg-surface-glass-highlight hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all shadow-lg active:scale-95">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </div>

                {/* 2-Column Layout */}
                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden h-full">

                    {/* Left Column */}
                    <div className="col-span-12 lg:col-span-4 h-full relative">
                        <div className="absolute inset-0 overflow-y-auto pr-4 pb-4 flex flex-col gap-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-thumb]:bg-cyan-500 [&::-webkit-scrollbar-thumb]:rounded-md">

                            {/* Diff Risk & Morph Dev */}
                            <div className="grid grid-cols-2 gap-4 shrink-0">
                                <div className="glass-panel-detail rounded-2xl p-5 flex flex-col justify-between group relative min-h-[140px]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-400 text-xs uppercase tracking-wider font-bold font-mono">Diff. Risk</span>
                                        <span className="material-symbols-outlined text-gray-600 group-hover:text-danger transition-colors">psychology</span>
                                    </div>
                                    <div>
                                        <div className={`text-4xl font-bold ${isCritical ? 'text-danger neon-text-red' : (isWarning ? 'text-warning' : 'text-success')} font-mono tracking-tighter`}>{Math.min(99, Math.round(ciiScore * 1.6))}%</div>
                                        <div className="w-full bg-gray-800/50 h-1.5 mt-4 rounded-full overflow-hidden backdrop-blur-sm">
                                            <div className={`${isCritical ? 'bg-danger shadow-neon-red' : (isWarning ? 'bg-warning' : 'bg-success')} h-full relative`} style={{ width: `${Math.min(99, Math.round(ciiScore * 1.6))}%` }}>
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel-detail rounded-2xl p-5 flex flex-col justify-between group relative min-h-[140px]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-400 text-xs uppercase tracking-wider font-bold font-mono">Morph. Dev</span>
                                        <span className="material-symbols-outlined text-gray-600 group-hover:text-warning transition-colors">insights</span>
                                    </div>
                                    <div>
                                        <div className={`text-4xl font-bold ${isCritical ? 'text-danger' : (isWarning ? 'text-warning' : 'text-success')} font-mono tracking-tighter`} style={{ textShadow: isCritical ? "0 0 10px rgba(239, 68, 68, 0.4)" : (isWarning ? "0 0 10px rgba(245, 158, 11, 0.4)" : "none") }}>{isCritical ? 'CRITICAL' : (isWarning ? 'HIGH' : 'NORMAL')}</div>
                                        <div className="flex gap-1.5 mt-4">
                                            <div className={`h-1.5 flex-1 rounded-full ${isCritical ? 'bg-danger shadow-neon-red' : 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
                                            <div className={`h-1.5 flex-1 rounded-full ${isCritical ? 'bg-danger/80' : (isWarning ? 'bg-warning/50' : 'bg-white/10')}`}></div>
                                            <div className={`h-1.5 flex-1 rounded-full ${isCritical ? 'bg-danger/40' : (isWarning ? 'bg-warning/20' : 'bg-white/10')}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <button onClick={() => alert('Diagnostic protocols deployed')} className={`glass-panel-detail rounded-2xl p-6 w-full relative group overflow-hidden ${isCritical ? 'border-danger/30 hover:border-danger/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/10 hover:border-white/20'} transition-all shrink-0`}>
                                <div className={`absolute inset-0 bg-gradient-to-r ${isCritical ? 'from-danger/10' : (isWarning ? 'from-warning/10' : 'from-success/10')} via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity`}></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${isCritical ? 'bg-danger/20 text-danger border border-danger/20 shadow-neon-red' : (isWarning ? 'bg-warning/20 text-warning border border-warning/20' : 'bg-success/20 text-success border border-success/20')}`}>
                                            <span className="material-symbols-outlined">{isCritical ? 'back_hand' : (isWarning ? 'visibility' : 'verified_user')}</span>
                                        </div>
                                        <div className="text-left">
                                            <div className={`${isCritical ? 'text-danger' : (isWarning ? 'text-warning' : 'text-success')} text-xs font-bold uppercase tracking-widest mb-0.5`}>Recommendation</div>
                                            <div className="text-2xl font-bold text-white tracking-tight">{isCritical ? 'Intervene Immediately' : (isWarning ? 'Increase Monitoring' : 'Maintain Optimal Care')}</div>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward_ios</span>
                                </div>
                            </button>

                            {/* Morphology Timeline */}
                            <div className="glass-panel-detail rounded-2xl p-6 flex flex-col min-h-[250px] shrink-0">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-white font-semibold text-lg tracking-tight">Morphology Timeline</h3>
                                        <p className="text-gray-500 text-xs font-mono mt-1">Growth Patterns: Day 2 - Day 4</p>
                                    </div>
                                    <div className="flex gap-2 text-[10px] font-mono">
                                        <span className="text-cyan-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"></span>Comp</span>
                                        <span className="text-purple-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></span>Entr</span>
                                        <span className="text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-neon-red"></span>CII</span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full relative chart-grid rounded-lg overflow-hidden p-2 border border-white/5 bg-black/20 shadow-inner-glow">
                                    <Line ref={chartRef} data={data} options={options} />
                                </div>
                            </div>

                            {/* CII Breakdown */}
                            <div className="glass-panel-detail rounded-2xl p-6 flex flex-col min-h-[340px] shrink-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-white font-semibold text-lg tracking-tight">CII Component Breakdown</h3>
                                        <p className="text-gray-500 text-xs font-mono mt-1">REAL-TIME FACTOR ANALYSIS</p>
                                    </div>
                                    <button className="text-gray-500 hover:text-white">
                                        <span className="material-symbols-outlined text-sm">more_horiz</span>
                                    </button>
                                </div>
                                <div className="flex-1 flex flex-col justify-start space-y-6">

                                    {/* Item 1 */}
                                    <div className="group">
                                        <div className="flex justify-between text-xs mb-2 items-end">
                                            <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Edge Roughness</span>
                                            <span className={`${latestMetric.Edge_Density > 0.6 ? 'text-danger bg-danger/10 border-danger/20' : 'text-warning bg-warning/10 border-warning/20'} font-mono px-1.5 py-0.5 rounded border text-[10px]`}>{latestMetric.Edge_Density > 0.6 ? 'HIGH' : 'ELEVATED'}</span>
                                        </div>
                                        <div className="w-full bg-gray-800/50 h-3 rounded-sm overflow-hidden border border-white/5 relative">
                                            <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full relative" style={{ width: `${Math.min(100, (latestMetric.Edge_Density || 0.76) * 100)}%` }}>
                                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                                            <span>Ref: 0.45</span>
                                            <span>{latestMetric.Edge_Density?.toFixed(2) || '0.76'}</span>
                                        </div>
                                    </div>

                                    {/* Item 2 */}
                                    <div className="group">
                                        <div className="flex justify-between text-xs mb-2 items-end">
                                            <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Fragmentation</span>
                                            <span className={`${latestMetric.Entropy > 6.0 ? 'text-danger bg-danger/10 border-danger/20' : 'text-warning bg-warning/10 border-warning/20'} font-mono px-1.5 py-0.5 rounded border text-[10px]`}>{latestMetric.Entropy > 6.0 ? 'CRITICAL' : 'ELEVATED'}</span>
                                        </div>
                                        <div className="w-full bg-gray-800/50 h-3 rounded-sm overflow-hidden border border-white/5 relative">
                                            <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full relative" style={{ width: `${Math.min(100, (latestMetric.Entropy || 6.5) * 10)}%` }}>
                                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                                            <span>Ref: 5.00</span>
                                            <span>{latestMetric.Entropy?.toFixed(2) || '6.50'}</span>
                                        </div>
                                    </div>

                                    {/* Item 3 */}
                                    <div className="group">
                                        <div className="flex justify-between text-xs mb-2 items-end">
                                            <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Nucleus Density</span>
                                            <span className="text-warning font-mono bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20 text-[10px]">ELEVATED</span>
                                        </div>
                                        <div className="w-full bg-gray-800/50 h-3 rounded-sm overflow-hidden border border-white/5 relative">
                                            <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full relative" style={{ width: `${Math.max(0, Math.min(100, (latestMetric.Compactness || 0.65) * 100))}%` }}>
                                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                                            <span>Ref: 0.50</span>
                                            <span>{latestMetric.Compactness?.toFixed(2) || '0.65'}</span>
                                        </div>
                                    </div>

                                    {/* Item 4 */}
                                    <div className="group">
                                        <div className="flex justify-between text-xs mb-2 items-end">
                                            <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Membrane Integrity</span>
                                            <span className="text-success font-mono bg-success/10 px-1.5 py-0.5 rounded border border-success/20 text-[10px]">STABLE</span>
                                        </div>
                                        <div className="w-full bg-gray-800/50 h-3 rounded-sm overflow-hidden border border-white/5 relative">
                                            <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full relative" style={{ width: `${Math.max(0, Math.min(100, (1 - (latestMetric.Solidity || 0.8)) * 100))}%` }}>
                                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                                            <span>Ref: 0.15</span>
                                            <span>{((1 - (latestMetric.Solidity || 0.8))).toFixed(2)}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="h-4 w-full"></div>
                        </div>
                    </div>

                    {/* Right Column (Microscope Viewer) */}
                    <div className="col-span-12 lg:col-span-8 h-full flex flex-col relative">
                        <div className="glass-panel-detail rounded-2xl p-1 w-full h-full relative group border border-white/10 shadow-glass-3d">
                            <div className="relative w-full h-full bg-[#000510] rounded-xl overflow-hidden flex items-center justify-center">
                                <img
                                    alt="Microscope view of cells"
                                    className={`w-full h-full object-cover opacity-80 ${isCritical ? 'mix-blend-luminosity' : 'mix-blend-normal'} scale-105 group-hover:scale-100 transition-transform duration-700`}
                                    src={isCritical
                                        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAWOMcbru4HP0TLHysHVWK___R3D8A3aC9HqHt3eu7GAPnrwov1-qdaR5fUCvd8MUoe2202cuDbAUFRZ-ZYjPzwJTzaXZj_o-ld8knuXWV5sO1tOacqWaRrZOEj0fSV3p_syGkxYqNGucBjvveoC8te07qAXuIq_ZVRNMC4HZ3EhB1bdruJci4Q4K7w1QimTEl-hJ4LWZtFvGzHRPJzxtxAS3CtxjYx4-6C8gnLFi_e9hCf1Uf9W2De9ErFgJNAnEgb0E_JDqMY1vyx"
                                        : "https://lh3.googleusercontent.com/aida-public/AB6AXuAjSFhTIM_3cB3MSknl2ssw5-HcaLHr_fsONLEDq2N-vejierz7BANe6hTPg4ry-ssbv8aU_-Wureva2qIHjtPfeCtwsnOGw-WA7LMMhmL17tyhGZdLiexMgFZ2FlqS3bzq0IKZbGLCpJFKH0xza2imX125ySaYdQlDfEAZcRos-D05eFG5iKoskr6sM8TMAXdKzdmvD2_VqE2pktzd_wrTCBGvYm4SBbhaale6_5xLgd-qnIkkBJr5_U_Dyn6ZCG_tH_M-X9u9_Jc_"
                                    }
                                />

                                {/* SVG Overlay Grid */}
                                <div
                                    className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none"
                                    style={{ backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')` }}
                                ></div>

                                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                                    {/* Top Overlays */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <span className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-400 text-xs px-3 py-1.5 rounded font-bold animate-pulse shadow-neon-red flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span> LIVE
                                            </span>
                                            <span className="bg-black/40 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1.5 rounded font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                                40x OPTICAL
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-xs font-mono text-cyan-500/80">ISO 800 • 1/200s</div>
                                            <div className="text-xs font-mono text-cyan-500/80">TEMP: 37.2°C</div>
                                        </div>
                                    </div>

                                    {/* Center Instability Detection Reticle */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-2 border-danger/80 rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-end justify-center pb-4 backdrop-blur-[2px]">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/50 animate-[scan_2s_ease-in-out_infinite]"></div>
                                        <span className="bg-danger text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg tracking-wider">
                                            INSTABILITY DETECTED
                                        </span>
                                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                                    </div>

                                    {/* Bottom Controls */}
                                    <div className="flex justify-between items-end">
                                        <div className="text-sm text-white/80 font-mono bg-black/40 px-3 py-1 rounded border border-white/10 backdrop-blur-sm">
                                            SOURCE: PRIMARY INCUBATOR, TRAY {Math.floor(Math.random() * 4) + 1}
                                        </div>
                                        <div className="pointer-events-auto flex gap-2">
                                            <button onClick={() => alert('Filter adjusted')} className="bg-black/40 hover:bg-white/10 border border-white/20 text-white p-2 rounded-lg backdrop-blur-md transition-colors">
                                                <span className="material-symbols-outlined text-lg">filter_center_focus</span>
                                            </button>
                                            <button onClick={() => alert('Feed recording active')} className="bg-black/40 hover:bg-white/10 border border-white/20 text-white p-2 rounded-lg backdrop-blur-md transition-colors">
                                                <span className="material-symbols-outlined text-lg">videocam</span>
                                            </button>
                                            <button onClick={() => alert('Fullscreen unavailable')} className="bg-black/40 hover:bg-white/10 border border-white/20 text-white p-2 rounded-lg backdrop-blur-md transition-colors">
                                                <span className="material-symbols-outlined text-lg">fullscreen</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer / Actions Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-6">
                <footer className="max-w-[1920px] mx-auto w-full glass-panel-detail overflow-visible rounded-2xl border-t border-white/10 flex items-center justify-between px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] bg-[#0a0f18]/90 pointer-events-auto h-20">
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gray-600 font-mono uppercase tracking-wide">
                            Ignore Alert
                        </button>
                        <button className="text-gray-400 hover:text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gray-600 font-mono uppercase tracking-wide">
                            Add Note
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => alert('Report Exported')} className="flex items-center gap-2 bg-surface-glass hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl">
                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            Export Report
                        </button>
                        <Link href="/phasespace" onClick={onClose} className="flex items-center gap-3 bg-primary hover:bg-cyan-400 text-black px-8 py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <span className="material-symbols-outlined text-lg">science</span>
                            Initialize Protocol & View Graph Simulations
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </Link>
                    </div>
                </footer>
            </div>

        </div>
    );
}
