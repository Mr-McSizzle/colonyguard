import React from "react";

export type ColonyStatus = "STABLE" | "WATCH" | "CRITICAL";
export type StressLevel = string; // Adjusting to take dynamic strings

export interface ColonyCardProps {
    id: string;
    subId: string;
    status: ColonyStatus;
    imageSrc: string;
    ciiScore: number;
    stressLevel: StressLevel;
    onClick?: () => void;
}

export default function ColonyCard({
    id,
    subId,
    status,
    imageSrc,
    ciiScore,
    stressLevel,
    onClick,
}: ColonyCardProps) {
    const isCritical = status === "CRITICAL";
    const isWarning = status === "WATCH";
    const isStable = status === "STABLE";

    // Dynamic styling based on status
    const cardPanelClass = isCritical
        ? "glass-panel-critical cursor-pointer group animate-float-delayed"
        : isWarning
            ? "glass-panel-3d cursor-pointer group animate-float-delayed border-transparent hover:border-yellow-500/30"
            : "glass-panel-3d cursor-pointer group animate-float";

    const statusBadgeBg = isCritical
        ? "bg-danger/10 text-danger border-danger animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        : isWarning
            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
            : "bg-success/10 text-success border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]";

    const statusDotBg = isCritical
        ? "bg-danger animate-ping"
        : isWarning
            ? "bg-yellow-500 shadow-[0_0_8px_#eab308]"
            : "bg-success shadow-[0_0_8px_#10b981]";

    const nameColorClass = isCritical
        ? "group-hover:text-danger text-glow-red"
        : isWarning
            ? "group-hover:text-yellow-400"
            : "group-hover:text-cyan-300";

    const subIdColorClass = isCritical
        ? "text-red-400/70"
        : isWarning
            ? "text-yellow-500/70"
            : "text-cyan-500/70";

    const imageContainerBorder = isCritical
        ? "border-danger/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        : isWarning
            ? "border-slate-700/50 group-hover:border-yellow-500/30"
            : "border-slate-700/50 group-hover:border-cyan-500/30";

    const imageFilters = isCritical
        ? "opacity-90 sepia-[.2] hue-rotate-[-40deg]"
        : "opacity-80 grayscale-[0.2]";

    const ciiBadgeClass = isCritical
        ? "bg-danger text-white shadow-[0_0_10px_#ef4444]"
        : isWarning
            ? "bg-yellow-900/80 text-yellow-200 border border-yellow-500/20"
            : "bg-black/70 text-cyan-400 border border-cyan-500/20";

    const progressBgClass = isCritical
        ? "bg-danger shadow-[0_0_8px_#ef4444]"
        : isWarning
            ? "bg-yellow-500 shadow-[0_0_8px_#eab308]"
            : "bg-success shadow-[0_0_8px_#10b981]";

    const progressWidth = Math.min((ciiScore / 10) * 100, 100);

    const stressTextClass = isCritical
        ? "text-danger animate-pulse"
        : isWarning
            ? "text-yellow-500"
            : "text-slate-400";

    return (
        <div className={`rounded-xl p-4 relative overflow-hidden ${cardPanelClass}`} onClick={onClick}>
            {/* Background glow effects for specific states */}
            {!isCritical && !isWarning && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            )}
            {isCritical && (
                <div className="absolute inset-0 bg-danger/5 animate-pulse-glow pointer-events-none"></div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusDotBg}`}></div>
                    <div>
                        <h4
                            className={`font-bold text-lg text-white transition-colors tracking-tight ${nameColorClass}`}
                        >
                            {id}
                        </h4>
                        <p className={`text-[10px] font-mono ${subIdColorClass}`}>
                            {subId}
                        </p>
                    </div>
                </div>
                <span
                    className={`px-2 py-1 rounded text-[10px] font-bold font-mono border ${statusBadgeBg}`}
                >
                    {status}
                </span>
            </div>

            {/* Image Container */}
            <div
                className={`relative h-40 rounded-lg overflow-hidden border microscope-img-container transition-colors ${imageContainerBorder}`}
            >
                <div
                    className={`scan-line animate-scanline ${isCritical
                        ? "bg-gradient-to-b from-transparent via-red-500/50 to-transparent"
                        : isWarning
                            ? "bg-gradient-to-b from-transparent via-yellow-500/50 to-transparent"
                            : ""
                        }`}
                    style={{ animationDelay: isStable ? "1s" : isWarning ? "1.5s" : "0s" }}
                ></div>
                <img
                    alt={`Microscope view of colony ${status.toLowerCase()}`}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${imageFilters}`}
                    src={imageSrc}
                />

                {isCritical && <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay"></div>}

                {/* Reticles for Stable */}
                {isStable && (
                    <div className="absolute inset-0 border border-white/5 p-2 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between">
                            <div className="w-2 h-2 border-l border-t border-cyan-500/50"></div>
                            <div className="w-2 h-2 border-r border-t border-cyan-500/50"></div>
                        </div>
                        <div className="flex justify-between">
                            <div className="w-2 h-2 border-l border-b border-cyan-500/50"></div>
                            <div className="w-2 h-2 border-r border-b border-cyan-500/50"></div>
                        </div>
                    </div>
                )}

                <div
                    className={`absolute bottom-2 right-2 backdrop-blur-md px-2 py-1 rounded text-xs font-mono font-bold shadow-lg ${ciiBadgeClass}`}
                >
                    CII: {ciiScore.toFixed(1)}
                </div>
            </div>

            {/* Footer / Footer stats */}
            <div className="mt-4 flex justify-between items-center text-xs relative z-10">
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mr-4 shadow-inner">
                    <div
                        className={`h-full ${progressBgClass}`}
                        style={{ width: `${progressWidth}%` }}
                    ></div>
                </div>
                <span className={`font-mono whitespace-nowrap font-bold ${stressTextClass}`}>
                    STR: {stressLevel}
                </span>
            </div>
        </div>
    );
}
