"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobalState } from "@/context/GlobalState";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { loadDemoData, setPendingUploadFiles } = useGlobalState();
  const [isProcessingData, setIsProcessingData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingUploadFiles(Array.from(e.target.files));
      router.push('/processing');
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const colors = ["#39ff14", "#00f0ff", "#ffffff"];

    // simple particle system
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 3 + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.3 + 0.1};
        filter: blur(${Math.random() * 2}px);
        animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
        animation-delay: -${Math.random() * 10}s;
      `;
      container.appendChild(p);
    }

    return () => {
      // cleanup on unmount
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-background-dark -z-50"></div>

      {/* Background Grids */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{ perspective: "1000px" }}
      >
        <div
          className="absolute inset-0 petri-grid"
          style={{ transform: "rotateX(20deg) scale(1.5)" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] rounded-full border border-gray-800/30 opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] rounded-full border border-gray-800/30 opacity-20"></div>
      </div>

      {/* Microscope Overlay & Particles */}
      <div className="fixed inset-0 z-50 pointer-events-none microscope-overlay opacity-30"></div>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0"
        id="micro-particles"
      >
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-bio-green rounded-full blur-[1px] opacity-40 animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-accent-cyan rounded-full blur-[2px] opacity-30 animate-float-reverse"></div>
        <div className="dna-helix top-20 right-20 animate-spin-slow"></div>
        <div
          className="dna-helix bottom-40 left-20 animate-spin-reverse opacity-20"
          style={{ transform: "scale(0.6)" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            <span className="material-symbols-outlined text-3xl text-bio-green relative z-10">
              biotech
            </span>
          </div>
          <span className="font-display text-xl font-bold tracking-[0.2em] text-white">
            COLONY<span className="text-bio-green">GUARD</span>
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-1">
          <Link
            className="px-4 py-2 text-gray-400 hover:text-accent-cyan hover:bg-white/5 rounded-sm transition-all text-xs uppercase tracking-widest font-display border border-transparent hover:border-primary/20"
            href="/dashboard"
          >
            Platform
          </Link>

          <Link
            className="px-4 py-2 text-gray-400 hover:text-accent-cyan hover:bg-white/5 rounded-sm transition-all text-xs uppercase tracking-widest font-display border border-transparent hover:border-primary/20"
            href="/dashboard"
          >
            Docs
          </Link>
          <button onClick={() => router.push('/processing')} className="ml-6 px-4 py-2 bg-white/5 hover:bg-accent-cyan/10 border border-white/10 hover:border-accent-cyan/50 text-accent-cyan rounded-sm transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">terminal</span>
            <span className="text-xs font-display uppercase">Console</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-8 md:pt-16 pb-20 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">

          {/* Left Column Text/Cta */}
          <div className="space-y-10 lg:pr-8 relative z-20">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-sm border border-bio-green/30 bg-bio-green/5 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bio-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-bio-green"></span>
              </span>
              <span className="text-bio-green text-[10px] font-display uppercase tracking-[0.2em] font-bold">
                Incubator Status: Optimal
              </span>
              <span className="text-accent-cyan/70 text-[10px] font-display border-l border-white/10 pl-3 ml-1">
                37.0°C / 5.0% CO2
              </span>
            </div>

            <div className="space-y-6">
              <h1
                className="text-6xl md:text-7xl lg:text-8xl font-bold font-display tracking-tighter text-white leading-[0.9] glass-text-effect"
                data-text="COLONY GUARD"
              >
                COLONY<br />
                <span className="text-accent-cyan/90">GUARD</span>
              </h1>
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-bio-green shadow-[0_0_10px_#39ff14]"></div>
                <p className="text-cyan-100/80 text-sm md:text-base font-display uppercase tracking-[0.25em] text-glow">
                  iPSC Instability Detection
                </p>
              </div>
            </div>

            <p className="text-gray-400 max-w-lg leading-relaxed text-lg font-light border-l border-white/10 pl-6">
              Advanced AI analysis for high-throughput screening. Detects
              micro-differentiation and karyotypic anomalies in live stem cell
              cultures before structural failure.
            </p>

            <div className="mt-12 relative group drop-zone cursor-pointer perspective-1000">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-t from-accent-cyan/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="relative microscope-stage rounded-sm p-8 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover:border-accent-cyan/60 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] overflow-hidden">
                <div className="absolute top-1/2 -left-3 w-6 h-12 -translate-y-1/2 microscope-clamp rounded-r-md z-20"></div>
                <div className="absolute top-1/2 -right-3 w-6 h-12 -translate-y-1/2 microscope-clamp rounded-l-md z-20"></div>
                <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-accent-cyan/50"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-accent-cyan/50"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-accent-cyan/50"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-accent-cyan/50"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-full h-px bg-accent-cyan"></div>
                  <div className="h-full w-px bg-accent-cyan absolute"></div>
                  <div className="w-20 h-20 border border-accent-cyan rounded-full absolute"></div>
                </div>
                <div className="w-16 h-16 relative flex items-center justify-center mb-6 z-10">
                  <div className="absolute inset-0 bg-accent-cyan/10 rounded-full blur-xl group-hover:bg-accent-cyan/20 transition-all"></div>
                  <span className="material-symbols-outlined text-accent-cyan text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                    science
                  </span>
                </div>
                <h3 className="text-white font-display text-lg mb-2 tracking-wide z-10">
                  Mount Specimen Slide
                </h3>
                <p className="text-gray-500 text-xs font-display uppercase mb-8 tracking-wider z-10">
                  Supported: Phase Contrast, Fluorescence, DIC
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center z-10">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button onClick={() => fileInputRef.current?.click()} className="relative overflow-hidden px-6 py-3 rounded-sm border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-300 font-display text-xs uppercase tracking-widest group/btn backdrop-blur-sm">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        folder_open
                      </span>
                      Upload Images
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      setIsProcessingData(true);
                      const success = await loadDemoData();
                      if (success) {
                        router.push('/processing');
                      } else {
                        setIsProcessingData(false);
                      }
                    }}
                    disabled={isProcessingData}
                    className="relative px-8 py-3 rounded-sm bg-gradient-to-r from-teal-900 to-cyan-900 border border-accent-cyan/50 text-white font-bold font-display text-xs uppercase tracking-widest hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isProcessingData ? (
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                      )}
                      {isProcessingData ? 'Ingesting Pipeline...' : 'Load Demo Dataset'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Visuals */}
          <div className="relative h-[600px] lg:h-[800px] flex items-center justify-center perspective-1000 z-10">
            <div className="relative w-[400px] h-[400px] md:w-[550px] md:h-[550px] cell-container animate-float preserve-3d">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-bio-green/5 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="absolute inset-0 pointer-events-none z-50">
                <div className="absolute top-0 w-full h-[2px] bg-accent-cyan/80 shadow-[0_0_15px_#00f0ff] animate-scan-vertical z-50 opacity-50"></div>
                <div className="absolute top-10 left-0 text-[10px] text-accent-cyan font-display px-2 bg-black/40 border-l-2 border-accent-cyan">
                  MAG: 400x
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] animate-membrane-undulate lipid-bilayer overflow-hidden z-20">
                <div className="absolute inset-0 cytoplasm-texture opacity-30"></div>
                <div className="organelle w-16 h-12 top-[25%] left-[25%] rotate-12 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
                <div className="organelle w-10 h-10 bottom-[30%] right-[20%] bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
                <div className="organelle w-8 h-20 top-[40%] right-[25%] rotate-45 bg-yellow-500/10 border border-yellow-500/20"></div>
                <div className="absolute top-[20%] right-[40%] w-12 h-6 border border-red-400/30 rounded-full rotate-[15deg] backdrop-blur-sm">
                  <div className="w-full h-full flex justify-around items-center opacity-40">
                    <div className="w-px h-4 bg-red-400"></div>
                    <div className="w-px h-4 bg-red-400"></div>
                    <div className="w-px h-4 bg-red-400"></div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] cell-nucleus rounded-full animate-pulse-nucleus z-30 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] border border-white/20 rounded-full opacity-50"></div>
                  <div className="absolute top-[35%] left-[40%] w-[25%] h-[25%] bg-white/60 blur-md rounded-full shadow-[0_0_20px_white]"></div>
                </div>
              </div>

              {/* Data tags */}
              <div
                className="absolute -right-12 top-20 glass-panel p-3 rounded-sm text-xs font-display text-accent-cyan border-l-2 border-l-bio-green animate-float-reverse shadow-lg"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-bio-green animate-spin-slow">
                    data_usage
                  </span>
                  <span className="tracking-widest font-bold text-white">
                    SPECIMEN #442
                  </span>
                </div>
                <div className="space-y-1 text-[10px] text-gray-400">
                  <div className="flex justify-between gap-4">
                    <span>LINEAGE</span> <span className="text-white">HeLa-Kyoto</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>PASSAGE</span> <span className="text-white">P:14</span>
                  </div>
                </div>
              </div>
              <div
                className="absolute -left-16 bottom-24 glass-panel p-3 rounded-sm text-[10px] font-display text-accent-cyan/80 border-r-2 border-r-accent-cyan animate-float shadow-lg"
                style={{ animationDelay: "2s" }}
              >
                <div className="mb-1 text-white font-bold tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  DETECTING ANOMALIES
                </div>
                <div className="text-gray-400 mb-1">
                  KARYOTYPE: <span className="text-white">ANALYZING...</span>
                </div>
                <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-bio-green to-accent-cyan w-[65%] animate-[pulse_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats Line */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-16 pointer-events-none text-[10px] md:text-xs font-display text-accent-cyan/60 uppercase tracking-widest hidden md:flex">
          <div className="flex flex-col items-center group">
            <span className="text-white text-lg font-bold group-hover:text-bio-green transition-colors font-sans">
              98.4%
            </span>
            <span className="border-t border-accent-cyan/20 pt-1 mt-1">
              Viability
            </span>
          </div>
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-accent-cyan/30 to-transparent"></div>
          <div className="flex flex-col items-center group">
            <span className="text-bio-green text-lg font-bold shadow-green-500/20 drop-shadow-sm font-sans">
              pH 7.4
            </span>
            <span className="border-t border-accent-cyan/20 pt-1 mt-1">
              Media Balance
            </span>
          </div>
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-accent-cyan/30 to-transparent"></div>
          <div className="flex flex-col items-center group">
            <span className="text-white text-lg font-bold group-hover:text-accent-cyan transition-colors font-sans">
              24h
            </span>
            <span className="border-t border-accent-cyan/20 pt-1 mt-1">
              Doubling Time
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
