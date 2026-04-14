'use client';

import { Users, Target, TrendingUp, Briefcase } from 'lucide-react';

interface StatsCardsProps {
    totalContacts: number;
    leads: number;
    clients: number;
    partners: number;
}

export function StatsCards({ totalContacts, leads, clients, partners }: StatsCardsProps) {
    const stats = [
        { label: 'Total Contacts', value: totalContacts, icon: Users, accent: true, lightBg: 'bg-[rgba(255,255,255,0.16)]', textColor: 'text-white' },
        { label: 'Leads', value: leads, icon: Target, lightBg: 'bg-[rgba(249,115,22,0.12)]', textColor: 'text-orange-600' },
        { label: 'Clients', value: clients, icon: TrendingUp, lightBg: 'bg-[rgba(16,185,129,0.12)]', textColor: 'text-emerald-600' },
        { label: 'Partenaires', value: partners, icon: Briefcase, lightBg: 'bg-[rgba(124,58,237,0.12)]', textColor: 'text-violet-600' },
    ];

    const total = totalContacts || 1;
    const segments = [
        { value: leads, color: '#f97316' },
        { value: clients, color: '#10b981' },
        { value: partners, color: '#8b5cf6' },
        { value: Math.max(0, totalContacts - leads - clients - partners), color: '#3b82f6' },
    ];

    const createDonutPath = (startAngle: number, endAngle: number, radius: number = 40, cx: number = 50, cy: number = 50) => {
        const start = {
            x: cx + radius * Math.cos(startAngle),
            y: cy + radius * Math.sin(startAngle),
        };
        const end = {
            x: cx + radius * Math.cos(endAngle),
            y: cy + radius * Math.sin(endAngle),
        };
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    };

    let currentAngle = -Math.PI / 2;
    const paths = segments
        .filter((s) => s.value > 0)
        .map((segment) => {
            const angle = (segment.value / total) * 2 * Math.PI;
            const path = createDonutPath(currentAngle, currentAngle + angle);
            currentAngle += angle;
            return { path, color: segment.color };
        });

    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const isAccent = index === 0;
                    return (
                        <div
                            key={stat.label}
                            className={isAccent
                                ? 'relative overflow-hidden rounded-[1.8rem] border border-[rgba(255,255,255,0.14)] bg-[linear-gradient(135deg,#171311_0%,#2d211d_52%,#ff385c_180%)] p-4 text-white shadow-[0_24px_44px_rgba(23,19,17,0.24)] lg:p-5'
                                : 'glass-card p-4 lg:p-5'}
                        >
                            {isAccent && <div className="absolute right-[-1rem] top-[-0.5rem] h-20 w-20 rounded-full bg-white/10" />}
                            <div className="flex items-center gap-3">
                                <div className={`rounded-[1rem] p-2.5 ${stat.lightBg}`}>
                                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-medium uppercase tracking-[0.18em] ${isAccent ? 'text-white/70' : 'text-gray-500'}`}>{stat.label}</p>
                                    <p className={`text-xl font-bold ${isAccent ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Donut chart card */}
                <div className="glass-card flex items-center justify-between gap-4 p-4 lg:p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-brand-deep)]">Répartition</p>
                        <p className="mt-1 text-sm text-[var(--text-gray)]">Vue rapide des segments clés.</p>
                    </div>
                    <svg viewBox="0 0 100 100" className="h-16 w-16">
                        {paths.map((p, i) => (
                            <path key={i} d={p.path} fill="none" stroke={p.color} strokeWidth="8" strokeLinecap="round" />
                        ))}
                        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold fill-gray-700">
                            {totalContacts}
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    );
}
