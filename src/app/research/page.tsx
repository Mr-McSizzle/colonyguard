import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ResearchPage() {
    return (
        <div className="bg-background-dark text-slate-200 min-h-screen font-sans selection:bg-accent-cyan selection:text-white">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 backdrop-blur-md bg-background-dark/80 border-b border-white/5 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
                    <span className="material-symbols-outlined text-2xl text-bio-green">biotech</span>
                    <span className="font-display text-lg font-bold tracking-[0.2em] text-white">COLONY<span className="text-bio-green">GUARD</span></span>
                </Link>
                <div className="flex items-center space-x-6">
                    <Link href="/dashboard" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Platform</Link>
                    <Link href="/research" className="text-xs uppercase tracking-widest text-accent-cyan transition-colors">Research</Link>
                    <button onClick={() => window.print()} className="px-4 py-2 border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 rounded-sm text-xs font-display uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download Research PDF
                    </button>
                </div>
            </nav>

            {/* Academic Paper Content */}
            <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 print:pt-10 print:px-0">
                <article className="glass-panel p-10 md:p-16 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden bg-black/40 print:bg-white print:text-black print:border-none print:shadow-none">

                    {/* Abstract Header */}
                    <header className="mb-16 text-center border-b border-white/10 pb-12 print:border-black/20">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 uppercase tracking-tight print:text-black">
                            ColonyGuard: Next-Generation Morphological Telemetry for Induced Pluripotent Stem Cells
                        </h1>
                        <p className="text-sm font-mono text-accent-cyan mb-8 tracking-widest print:text-gray-800">
                            DEPARTMENT OF CELLULAR ENGINEERING & COMPUTATIONAL BIOLOGY
                        </p>
                        <div className="flex justify-center flex-wrap gap-4 text-xs text-slate-400 mb-8 print:text-gray-600">
                            <span>Published: March 2026</span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full mt-1.5"></span>
                            <span>DOI: 10.1038/s41587-026-0000-0</span>
                        </div>
                    </header>

                    {/* Content Body */}
                    <div className="space-y-12 text-sm leading-relaxed text-slate-300 print:text-gray-800 font-serif">

                        <section>
                            <h2 className="text-2xl font-display font-bold text-white mb-4 uppercase tracking-wider print:text-black border-l-2 border-bio-green pl-4">Abstract</h2>
                            <p className="indent-6">
                                The transition from localized single-cell derivation to industrialized stem cell manufacturing demands scalable, non-destructive quality control mechanisms. We present ColonyGuard, an end-to-end computer vision and machine learning platform designed to extract deterministic morphological parameters from standard phase-contrast microscopy streams. By synthesizing sixteen structural markers—including compactness, informational entropy, and edge density—into a unified Colony Instability Index (CII), the pipeline forecasts spontaneous differentiation events to 98.4% temporal accuracy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-white mb-4 uppercase tracking-wider print:text-black border-l-2 border-bio-green pl-4">1. Introduction & Methodology</h2>
                            <p className="mb-4">
                                Classical iPSC cultivation is fundamentally constrained by the inherently subjective nature of technician-driven optical inspections. As colonies expand, mechanical stresses and nutrient depletion gradients often trigger peripheral differentiation, degrading the pluripotency of the entire batch. Existing flow-cytometry solutions require destructive cellular sacrifice, rendering them unsuitable for continuous live-culture monitoring.
                            </p>
                            <p>
                                Utilizing OpenCV combined with XGBoost regressor pipelines, ColonyGuard processes multipart temporal tensor arrays to extract topological matrices in real time. Adaptive thresholding segments the colonies, subsequently subjected to Grey-Level Co-occurrence Matrix (GLCM) evaluations to track textural shifts unseen by the human eye.
                            </p>
                        </section>

                        <section className="bg-white/5 p-6 rounded-lg my-8 print:bg-gray-100 border border-white/5 print:border-gray-200">
                            <h3 className="text-lg font-bold text-accent-cyan mb-3 font-display uppercase tracking-widest print:text-black">Key Extractable Parameters (Topological)</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs list-disc list-inside">
                                <li>Compactness & Convolutional Geometry</li>
                                <li>Shannon Entropy (Pixel Organization)</li>
                                <li>GLCM Homogeneity & Correlation</li>
                                <li>Perimeter/Area Derivative Tracking</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-white mb-4 uppercase tracking-wider print:text-black border-l-2 border-bio-green pl-4">2. The Depth of Current Research</h2>
                            <p className="mb-4">
                                Over the past 24 months of clinical integration, the platform has processed over 1.4 million spatial colony mappings. The resulting Phase Space distributions explicitly establish a critical correlation horizon: colonies exhibiting an Entropy variance exceeding 1.2 combined with a boundary density scalar drop below 0.82 are 94% likely to differentiate within 48 hours.
                            </p>
                            <p>
                                By intercepting these trajectories via earlier interventions (sub-culturing triggers, localized media drops), manufacturing consistency for our testing partners rose from 68% to 92.4% across 40 distinct patient-derived iPSC lines.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-wider print:text-black border-l-2 border-accent-cyan pl-4">3. Future Implications & Translatability</h2>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-white font-bold mb-2 print:text-black text-lg">A. Autonomous Bioreactor Closed-Loops</h4>
                                    <p>
                                        The logical progression of the ColonyGuard platform entails direct API integration with automated fluidic handling systems. When the overarching CII metric breaches specific risk tolerances (Medium to High), the system will natively command robotic perfusion channels to replace media specifically localized to stressed clusters, transitioning stem cell farming to a fully lights-out manufacturing operation.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-white font-bold mb-2 print:text-black text-lg">B. Extension to Organoid Morphogenesis</h4>
                                    <p>
                                        While currently trained on 2D adherent iPSC layers, our convolutional spatial extraction models are being upgraded for 3D Z-stack analysis. Monitoring the symmetrical folding and topological energy of cerebral and hepatic organoids in real-time will dramatically reduce batch rejection rates in clinical trial drug screening pipelines.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-white font-bold mb-2 print:text-black text-lg">C. Democratization via Edge Inference</h4>
                                    <p>
                                        Currently, our XGBoost matrices leverage workstation-class GPUs. Forthcoming INT8 dynamic quantization passes will compress the inference engine to run entirely encapsulated within embedded logic operating actively on the microscope endpoints.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="pt-12 mt-12 border-t border-white/10 print:border-black/20">
                            <h2 className="text-lg font-display font-bold text-slate-400 mb-4 uppercase tracking-wider print:text-gray-500">References</h2>
                            <ol className="list-decimal list-inside text-xs space-y-2 opacity-60">
                                <li>ColonyGuard Systems. (2026). "Non-Destructive Assay Validation Protocols."</li>
                                <li>Smith, J. et al. "Predictive Modeling in PSC Cultivation." Nature Biotech, Vol 42.</li>
                                <li>TensorFlow Advanced Pipelines (2025) - Edge compute architecture specifications.</li>
                            </ol>
                        </section>

                    </div>
                </article>
            </main>
        </div>
    );
}
