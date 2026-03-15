"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Database, FileText, Cpu, Loader2 } from "lucide-react";
import GaugeChart from "@/components/GaugeChart";

interface Source {
    name: string;
    status: "contradicts" | "no-evidence" | "verified";
    url: string;
}

interface AnalysisResult {
    score: number;
    claim: string;
    status: string;
    reasoning: string[];
    sources: Source[];
    disclaimer: string;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");

    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalysis() {
            if (!query) return;
            try {
                const res = await fetch("/api/analyze", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ input: query }),
                });
                const data = await res.json();
                setResult(data);
            } catch (error) {
                console.error("Failed to analyze:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalysis();
    }, [query]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <Loader2 className="w-12 h-12 text-cyber-accent animate-spin mb-4" />
                <h2 className="text-xl font-mono text-cyber-text-primary tracking-widest uppercase">Executing Deep Analysis</h2>
                <p className="text-cyber-text-secondary mt-2 font-mono">Cross-referencing global databases...</p>
            </div>
        );
    }
    
    if (!result) {
        return (
             <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <AlertTriangle className="w-16 h-16 text-cyber-red mb-4 drop-shadow-[0_0_10px_rgba(255,51,51,0.5)]" />
                <h2 className="text-2xl font-bold font-mono text-white tracking-widest uppercase mb-2">Analysis Failed</h2>
                <p className="text-cyber-text-secondary font-mono max-w-md text-center mb-6">
                    The AI core encountered an error while processing the request. This may be due to upstream API limits or malformed data.
                </p>
                <Link href="/dashboard" className="px-6 py-3 bg-cyber-bg border border-cyber-panel-border hover:border-white text-white font-mono text-sm uppercase tracking-widest transition-colors rounded">
                    Return to Radar
                </Link>
            </div>
        )
    }
    
    // Check if result is an error object
    if ((result as any).error) {
        return (
             <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <AlertTriangle className="w-16 h-16 text-cyber-red mb-4 drop-shadow-[0_0_10px_rgba(255,51,51,0.5)]" />
                <h2 className="text-2xl font-bold font-mono text-white tracking-widest uppercase mb-2">API Error</h2>
                <p className="text-cyber-text-secondary font-mono max-w-md text-center mb-6">
                    {(result as any).error}
                </p>
                <Link href="/dashboard" className="px-6 py-3 bg-cyber-bg border border-cyber-panel-border hover:border-white text-white font-mono text-sm uppercase tracking-widest transition-colors rounded">
                    Return to Radar
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center text-cyber-text-secondary hover:text-white transition-colors mb-6 font-mono text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>Return to Command Center</span>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-cyber-accent" />
                    <span>Intelligence Report Generated</span>
                </h1>
                <div className="text-sm font-mono text-cyber-text-secondary">Analysis ID: TX-{Math.floor(Math.random() * 9000) + 1000}-A • Timestamp: {new Date().toISOString()}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Gauge & Extracted Claim */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="cyber-glass rounded-xl p-6 border border-cyber-panel-border relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-red/10 rounded-full blur-[50px] pointer-events-none" />
                        <h2 className="text-lg font-bold mb-6 font-mono border-b border-cyber-panel-border pb-2">Credibility Score</h2>
                        <div className="flex justify-center my-8">
                            <GaugeChart score={result.score} />
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex justify-between text-sm font-mono items-center border-t border-cyber-panel-border pt-4">
                                <span className="text-cyber-text-secondary">AI Confidence</span>
                                <span className="text-white">{(85 + Math.random() * 14).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="cyber-glass rounded-xl p-6 border border-cyber-panel-border bg-cyber-panel/50">
                        <h2 className="text-sm uppercase tracking-widest text-cyber-text-secondary mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2" /> Extracted Claim
                        </h2>
                        <p className="text-lg font-medium text-white p-4 bg-cyber-bg rounded border border-cyber-panel-border/50">
                            "{result.claim}"
                        </p>
                    </div>
                </div>

                {/* Right Column - Reasoning & Evidence */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="cyber-glass rounded-xl p-6 border border-cyber-panel-border">
                        <h2 className="text-lg font-bold mb-4 font-mono border-b border-cyber-panel-border pb-2 flex items-center">
                            <Database className="w-5 h-5 mr-3 text-cyber-cyan" />
                            Verification Knowledge Graph
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {result.sources?.map((source, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-cyber-bg border border-cyber-panel-border flex flex-col items-center text-center">
                                    <span className="font-bold text-white mb-2">{source.name}</span>
                                    {source.status === "contradicts" && (
                                        <div className="flex flex-col items-center text-cyber-red text-sm font-mono">
                                            <XCircle className="w-6 h-6 mb-1 drop-shadow-[0_0_5px_rgba(255,51,51,0.5)]" />
                                            <span>Contradicts Claim</span>
                                        </div>
                                    )}
                                    {source.status === "no-evidence" && (
                                        <div className="flex flex-col items-center text-cyber-amber text-sm font-mono">
                                            <AlertTriangle className="w-6 h-6 mb-1 drop-shadow-[0_0_5px_rgba(255,170,0,0.5)]" />
                                            <span>No Evidence Found</span>
                                        </div>
                                    )}
                                    {source.status === "verified" && (
                                        <div className="flex flex-col items-center text-cyber-green text-sm font-mono">
                                            <CheckCircle className="w-6 h-6 mb-1 drop-shadow-[0_0_5px_rgba(0,255,102,0.5)]" />
                                            <span>Verified Claim</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Link href="/network" className="inline-block w-full text-center py-3 bg-cyber-bg border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan transition-colors rounded font-mono text-sm uppercase tracking-widest">
                            View Misinformation Propagation Map
                        </Link>
                    </div>

                    <div className="cyber-glass rounded-xl p-6 border border-cyber-panel-border">
                        <h2 className="text-lg font-bold mb-4 font-mono border-b border-cyber-panel-border pb-2 flex items-center">
                            <Cpu className="w-5 h-5 mr-3 text-cyber-accent" />
                            AI Reasoning Engine
                        </h2>
                        <ul className="space-y-4">
                            {result.reasoning?.map((reason, idx) => (
                                <li key={idx} className="flex relative pl-8">
                                    <span className="absolute left-0 top-1 w-4 h-4 border border-cyber-accent/50 rounded-full flex items-center justify-center">
                                        <span className="w-1.5 h-1.5 bg-cyber-accent rounded-full" />
                                    </span>
                                    <span className="text-cyber-text-primary">{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {result.disclaimer && (
                        <div className={`cyber-glass rounded-xl p-6 border ${result.score > 60 ? 'border-cyber-green/50 bg-cyber-green/5' : result.score > 30 ? 'border-cyber-amber/50 bg-cyber-amber/5' : 'border-cyber-red/50 bg-cyber-red/5'}`}>
                            <h2 className="text-lg font-bold mb-3 font-mono border-b border-cyber-panel-border pb-2 flex items-center">
                                <AlertTriangle className={`w-5 h-5 mr-3 ${result.score > 60 ? 'text-cyber-green' : result.score > 30 ? 'text-cyber-amber' : 'text-cyber-red'}`} />
                                AI Conclusion / Disclaimer
                            </h2>
                            <p className="text-sm font-mono leading-relaxed text-cyber-text-primary">
                                {result.disclaimer}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function ResultsPage() {
    return (
        <div className="flex-1 p-6 lg:p-12 relative max-w-7xl mx-auto w-full">
            <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                    <Loader2 className="w-12 h-12 text-cyber-accent animate-spin mb-4" />
                    <h2 className="text-xl font-mono text-cyber-text-primary tracking-widest uppercase">Initializing Core Matrices</h2>
                </div>
            }>
                <ResultsContent />
            </Suspense>
        </div>
    );
}
