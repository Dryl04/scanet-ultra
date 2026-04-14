'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Target, Filter, ChevronDown, RefreshCw, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    type PersonalObjective,
    OBJECTIVE_TYPE_CONFIG,
    PERIOD_LABELS,
    calculateObjectiveValue,
} from '@/lib/objectiveCalculator';
import { ObjectiveProgressCard } from './ObjectiveProgressCard';
import { AddObjectiveModal } from './AddObjectiveModal';

interface PersonalObjectivesProps {
    compact?: boolean;
}

export function PersonalObjectives({ compact = false }: PersonalObjectivesProps) {
    const { profile } = useAuth();
    const [objectives, setObjectives] = useState<PersonalObjective[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editObjective, setEditObjective] = useState<PersonalObjective | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'achieved'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const initialRefreshDone = useRef(false);

    const loadObjectives = useCallback(async () => {
        try {
            const res = await fetch('/api/objectives');
            if (!res.ok) throw new Error('Failed to load objectives');
            const data = await res.json();
            const raw = data.objectives || [];
            // Map snake_case API response to camelCase PersonalObjective interface
            setObjectives(raw.map((o: any) => ({
                ...o,
                objectiveType: o.objective_type ?? o.objectiveType,
                targetValue: o.target_value ?? o.targetValue ?? 0,
                currentValue: o.current_value ?? o.currentValue ?? 0,
                contactStatusFilter: o.contact_status_filter ?? o.contactStatusFilter,
                periodType: o.period_type ?? o.periodType,
                periodStart: o.period_start ?? o.periodStart,
                periodEnd: o.period_end ?? o.periodEnd,
                eventId: o.event_id ?? o.eventId,
                achievedAt: o.achieved_at ?? o.achievedAt,
                createdAt: o.created_at ?? o.createdAt,
                updatedAt: o.updated_at ?? o.updatedAt,
                userId: o.user_id ?? o.userId,
            })));
        } catch (error) {
            console.error('Error loading objectives:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/objectives/refresh', { method: 'POST' });
            if (res.ok) {
                await loadObjectives();
            }
        } catch (error) {
            console.error('Error refreshing objectives:', error);
        } finally {
            setRefreshing(false);
        }
    }, [loadObjectives]);

    useEffect(() => { loadObjectives(); }, [loadObjectives]);

    useEffect(() => {
        if (!loading && objectives.length > 0 && !initialRefreshDone.current) {
            initialRefreshDone.current = true;
            handleRefresh();
        }
    }, [loading, objectives.length, handleRefresh]);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/objectives/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setObjectives(prev => prev.filter(o => o.id !== id));
            }
        } catch (error) {
            console.error('Error deleting objective:', error);
        }
    };

    const handleReactivate = async (id: string) => {
        try {
            const res = await fetch(`/api/objectives/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active', achieved_at: null, notified: false }),
            });
            if (res.ok) await loadObjectives();
        } catch (error) {
            console.error('Error reactivating objective:', error);
        }
    };

    const filteredObjectives = objectives.filter(o => {
        if (filterStatus === 'active') return o.status === 'active';
        if (filterStatus === 'achieved') return o.status === 'achieved';
        return true;
    });

    const activeCount = objectives.filter(o => o.status === 'active').length;
    const achievedCount = objectives.filter(o => o.status === 'achieved').length;
    const totalProgress = activeCount > 0
        ? Math.round(objectives.filter(o => o.status === 'active').reduce((sum, o) => sum + Math.min(100, (o.currentValue / (o.targetValue || 1)) * 100), 0) / activeCount)
        : 0;

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                    <div className="space-y-2"><div className="w-32 h-4 bg-gray-100 rounded animate-pulse" /><div className="w-48 h-3 bg-gray-100 rounded animate-pulse" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="glass-card relative overflow-hidden p-5 lg:p-6">
                <svg className="absolute right-0 top-0 h-48 w-48 opacity-[0.04]" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" stroke="#ff385c" strokeWidth="2" fill="none" />
                    <path d="M100 20 L100 100 L160 100" stroke="#ff385c" strokeWidth="2" fill="none" />
                    <circle cx="100" cy="100" r="5" fill="#ff385c" />
                </svg>

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#171311,#ff385c)] shadow-[0_18px_32px_rgba(255,56,92,0.16)]"><Target className="w-5 h-5 text-white" /></div>
                        <div>
                            <h3 className="display-title text-3xl text-[var(--text-dark)]">Mes objectifs</h3>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-gray)]">
                                <span>{activeCount} actif{activeCount > 1 ? 's' : ''}</span>
                                {achievedCount > 0 && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span className="text-emerald-600 font-medium">{achievedCount} atteint{achievedCount > 1 ? 's' : ''}</span></>)}
                                {activeCount > 0 && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span className="font-medium">{totalProgress}% global</span></>)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleRefresh} disabled={refreshing} className="rounded-[1rem] border border-[rgba(235,227,216,0.9)] bg-white/80 p-2 transition-colors hover:bg-white" title="Actualiser les valeurs">
                            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        {!compact && (
                            <div className="relative">
                                <button onClick={() => setShowFilters(!showFilters)} className="floating-panel flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-white">
                                    <Filter className="w-3.5 h-3.5" />{filterStatus === 'all' ? 'Tous' : filterStatus === 'active' ? 'Actifs' : 'Atteints'}<ChevronDown className="w-3 h-3" />
                                </button>
                                {showFilters && (
                                    <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-[1.25rem] border border-[rgba(235,227,216,0.95)] bg-[rgba(255,252,248,0.98)] shadow-[0_18px_40px_rgba(58,40,28,0.16)]">
                                        {[{ value: 'all', label: 'Tous' }, { value: 'active', label: 'Actifs' }, { value: 'achieved', label: 'Atteints' }].map((f) => (
                                            <button key={f.value} onClick={() => { setFilterStatus(f.value as 'all' | 'active' | 'achieved'); setShowFilters(false); }} className={`w-full px-3 py-2 text-left text-sm transition-colors ${filterStatus === f.value ? 'bg-[rgba(255,56,92,0.08)] font-medium text-[var(--accent-brand-deep)]' : 'text-gray-600 hover:bg-gray-50'}`}>{f.label}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={() => { setEditObjective(null); setShowAddModal(true); }} className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shadow-[0_18px_36px_rgba(255,56,92,0.16)] transition-colors">
                            <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Ajouter</span>
                        </button>
                    </div>
                </div>

                {filteredObjectives.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[rgba(255,56,92,0.08)]"><Trophy className="w-8 h-8 text-[var(--accent-brand-deep)]" /></div>
                        <h4 className="mb-1 font-semibold text-gray-700">{filterStatus !== 'all' ? 'Aucun objectif dans cette catégorie' : 'Aucun objectif défini'}</h4>
                        <p className="mx-auto mb-4 max-w-sm text-sm text-gray-500">{filterStatus !== 'all' ? "Changez le filtre pour voir d'autres objectifs" : 'Fixez-vous des objectifs mesurables pour suivre votre progression en temps réel'}</p>
                        {filterStatus === 'all' && (
                            <button onClick={() => { setEditObjective(null); setShowAddModal(true); }} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
                                <Plus className="w-4 h-4" />Créer mon premier objectif
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                        {filteredObjectives.map((objective) => (
                            <ObjectiveProgressCard key={objective.id} objective={objective} onEdit={(obj) => { setEditObjective(obj); setShowAddModal(true); }} onDelete={handleDelete} onReactivate={handleReactivate} />
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddObjectiveModal onClose={() => { setShowAddModal(false); setEditObjective(null); }} onSuccess={() => { setShowAddModal(false); setEditObjective(null); loadObjectives(); handleRefresh(); }} editObjective={editObjective} />
            )}
        </>
    );
}
