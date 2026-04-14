'use client';

import { DollarSign, Users, UserPlus, Trophy, Calendar, Target, MoreVertical, Pencil, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import {
    type PersonalObjective,
    getObjectiveProgress,
    OBJECTIVE_TYPE_CONFIG,
    CONTACT_STATUS_LABELS,
    PERIOD_LABELS,
} from '@/lib/objectiveCalculator';

interface ObjectiveProgressCardProps {
    objective: PersonalObjective;
    onEdit: (objective: PersonalObjective) => void;
    onDelete: (id: string) => void;
    onReactivate: (id: string) => void;
}

const ICONS: Record<string, typeof Target> = { DollarSign, Users, UserPlus, Trophy, Calendar };

export function ObjectiveProgressCard({ objective, onEdit, onDelete, onReactivate }: ObjectiveProgressCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const progress = getObjectiveProgress(objective);
    const config = OBJECTIVE_TYPE_CONFIG[objective.objectiveType];
    const Icon = ICONS[config.icon] || Target;
    const isAchieved = objective.status === 'achieved';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatValue = (value: number) => {
        if (objective.unit === 'currency') return formatCurrency(value, objective.currency);
        if (objective.unit === 'percentage') return `${Math.round(value)}%`;
        return Math.round(value).toString();
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getSubtitle = () => {
        const parts: string[] = [];
        if (objective.objectiveType === 'contacts_by_status' && objective.contactStatusFilter) {
            parts.push(CONTACT_STATUS_LABELS[objective.contactStatusFilter] || objective.contactStatusFilter);
        }
        if (objective.periodType === 'custom' && objective.periodStart && objective.periodEnd) {
            parts.push(`${formatDate(objective.periodStart as unknown as string)} - ${formatDate(objective.periodEnd as unknown as string)}`);
        } else if (PERIOD_LABELS[objective.periodType]) {
            parts.push(PERIOD_LABELS[objective.periodType]);
        }
        return parts.join(' - ');
    };

    const getProgressColor = () => {
        if (isAchieved) return '#10b981';
        if (progress >= 75) return config.color;
        if (progress >= 50) return '#f59e0b';
        if (progress >= 25) return '#f97316';
        return '#ef4444';
    };

    const progressColor = getProgressColor();

    return (
        <div className={`group relative rounded-[1.5rem] border p-4 transition-all duration-300 hover:-translate-y-0.5 ${isAchieved ? 'border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(255,255,255,0.94))] shadow-[0_18px_36px_rgba(16,185,129,0.12)]' : 'border-[rgba(235,227,216,0.92)] bg-white/92 shadow-[0_16px_30px_rgba(58,40,28,0.08)] hover:shadow-[0_20px_40px_rgba(58,40,28,0.12)]'}`}>
            {isAchieved && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                </div>
            )}

            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[0.9rem]" style={{ backgroundColor: `${config.color}15` }}>
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="truncate text-lg font-semibold text-gray-900 [font-family:var(--font-display)]">{objective.title}</h4>
                        <p className="truncate text-xs text-gray-500">{getSubtitle()}</p>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="rounded-lg p-1 opacity-0 transition-colors hover:bg-gray-100 group-hover:opacity-100"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                    {showMenu && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-[1.15rem] border border-[rgba(235,227,216,0.95)] bg-[rgba(255,252,248,0.98)] shadow-[0_18px_40px_rgba(58,40,28,0.16)]">
                            <button onClick={() => { onEdit(objective); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Pencil className="w-3.5 h-3.5" /> Modifier</button>
                            {isAchieved && <button onClick={() => { onReactivate(objective.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"><RotateCcw className="w-3.5 h-3.5" /> Réactiver</button>}
                            <button onClick={() => { onDelete(objective.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-end justify-between mb-2">
                <div>
                    <span className="text-xl font-bold text-gray-900">{formatValue(objective.currentValue)}</span>
                    <span className="text-sm text-gray-400 ml-1">/ {formatValue(objective.targetValue)}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: progressColor }}>{progress}%</span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, backgroundColor: progressColor }} />
            </div>

            {objective.priority === 'high' && !isAchieved && (
                <div className="mt-2 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-[10px] font-medium text-red-600 uppercase tracking-wider">Priorité haute</span></div>
            )}

            {isAchieved && objective.achievedAt && (
                <div className="mt-2"><span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Atteint le {new Date(objective.achievedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
            )}
        </div>
    );
}
