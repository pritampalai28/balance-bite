"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MacroRingProps {
    label: string;
    current: number;
    target: number;
    color: string;
}

export default function MacroRing({ label, current, target, color }: MacroRingProps) {
    const percentage = Math.min(100, Math.round((current / target) * 100)) || 0;
    const remaining = Math.max(0, target - current);

    const data = {
        labels: ['Consumed', 'Remaining'],
        datasets: [
            {
                data: [current, remaining],
                backgroundColor: [color, 'rgba(255,255,255,0.1)'],
                borderWidth: 0,
                borderRadius: 20,
            },
        ],
    };

    const options = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 group">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full blur-xl opacity-20 transition-opacity duration-300 group-hover:opacity-40" style={{ backgroundColor: color }}></div>
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-white drop-shadow-md">{percentage}%</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
                </div>
            </div>
            <div className="mt-3 text-center">
                <p className="text-xs font-medium text-gray-400">{Math.round(current)} / {Math.round(target)}g</p>
            </div>
        </div>
    );
}
