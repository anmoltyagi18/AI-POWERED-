"use client";

import { useEffect, useState } from "react";

interface GaugeChartProps {
    score: number;
}

export default function GaugeChart({ score }: GaugeChartProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedScore(score);
        }, 300);
        return () => clearTimeout(timeout);
    }, [score]);

    // Determine color and status based on score
    // User requested: 80-100 green, 50-79 yellow/orange, 0-49 red
    let color = "#00ff66"; // Reliable (Green)
    let status = "Reliable";

    if (score < 50) {
        color = "#ff3333"; // Fake (Red)
        status = "Likely Fake";
    } else if (score < 80) {
        color = "#ffaa00"; // Misleading (Amber)
        status = "Misleading";
    }

    // Calculate SVG arc (half circle)
    const radius = 90;
    const circumference = Math.PI * radius; // Half circle circumference
    // The dashoffset controls how much of the stroke is hidden
    // Full offset = circumference (0% visible)
    // Zero offset = 0 (100% visible)
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* We rotate the entire SVG 180 degrees so the arc starts from the left side */}
            <svg className="w-64 h-36 transform rotate-180" viewBox="0 0 200 100">
                {/* Background Arc */}
                <path
                    d="M 10 10 
                       A 90 90 0 0 0 190 10"
                    fill="none"
                    stroke="var(--color-cyber-panel-border)"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {/* Foreground Arc - Glow effect */}
                <path
                    d="M 10 10 
                       A 90 90 0 0 0 190 10"
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
                />
            </svg>

            {/* Absolute positioning for text inside the arc */}
            {/* Moved slightly up relative to the bounding box since the arc curves downwards in the viewBox (which is then rotated) */}
            <div className="absolute top-[20%] flex flex-col items-center justify-center w-full">
                <span className="text-5xl font-bold font-mono" style={{ color, textShadow: `0 0 15px ${color}80` }}>
                    {Math.round(animatedScore)}
                </span>
                <span className="text-cyber-text-secondary text-sm font-mono mt-1 uppercase tracking-widest">
                    / 100
                </span>
            </div>

            <div className="mt-4 text-center">
                <div className="text-xs text-cyber-text-secondary uppercase tracking-widest mb-1">Status</div>
                <div className="text-xl font-bold font-mono tracking-wider" style={{ color, textShadow: `0 0 10px ${color}50` }}>
                    {status}
                </div>
            </div>
        </div>
    );
}
