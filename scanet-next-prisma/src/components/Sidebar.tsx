'use client';

import { useState, useEffect } from 'react';
import {
    Users, Calendar, CheckSquare, Filter, LogOut,
    ChevronLeft, ChevronRight, Target, Settings,
    Home, ChevronDown, ChevronUp, User, Package, Building2, Bell, X, Check
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import type { ViewType } from '@/types';

interface SidebarProps {
    view: ViewType;
    onViewChange: (view: ViewType) => void;
    filterStatus: string;
    onFilterChange: (status: string) => void;
    onSignOut: () => void;
    stats: {
        total: number; leads: number; prospects: number; clients: number; partners: number;
        collaborateurs?: number; amis?: number; fournisseurs?: number;
    };
    eventsCount?: number;
    followUpsCount?: number;
    userName?: string;
    userEmail?: string;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function Sidebar({
    view, onViewChange, filterStatus, onFilterChange, onSignOut, stats,
    eventsCount = 0, followUpsCount = 0, userName = 'Utilisateur', userEmail = '',
    isMobileOpen = false, onMobileClose,
}: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        const isMobile = window.innerWidth < 1024;
        if (saved !== null && !isMobile) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleCollapsed = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    };

    const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const menuItems = [
        { id: 'dashboard' as ViewType, label: 'Tableau de bord', icon: Home, count: null },
        { id: 'contacts' as ViewType, label: 'Contacts', icon: Users, count: stats.total },
        { id: 'events' as ViewType, label: 'Événements', icon: Calendar, count: eventsCount },
        { id: 'followups' as ViewType, label: 'Relances', icon: CheckSquare, count: followUpsCount, badge: followUpsCount > 0 },
        { id: 'opportunities' as ViewType, label: 'Opportunités', icon: Target, count: null },
        { id: 'offers' as ViewType, label: 'Offres', icon: Package, count: null },
        { id: 'enterprise' as ViewType, label: 'Entreprise', icon: Building2, count: null },
    ];

    const filterOptions = [
        { value: 'all', label: 'Tous les contacts', count: stats.total, color: 'bg-gray-100 text-gray-700' },
        { value: 'lead', label: 'Leads', count: stats.leads, color: 'bg-orange-100 text-orange-700' },
        { value: 'prospect', label: 'Prospects', count: stats.prospects, color: 'bg-amber-100 text-amber-700' },
        { value: 'client', label: 'Clients', count: stats.clients, color: 'bg-emerald-100 text-emerald-700' },
        { value: 'partner', label: 'Partenaires', count: stats.partners, color: 'bg-violet-100 text-violet-700' },
        { value: 'collaborateur', label: 'Collaborateurs', count: stats.collaborateurs || 0, color: 'bg-cyan-100 text-cyan-700' },
        { value: 'ami', label: 'Ami(e)s', count: stats.amis || 0, color: 'bg-pink-100 text-pink-700' },
        { value: 'fournisseur', label: 'Fournisseurs', count: stats.fournisseurs || 0, color: 'bg-amber-100 text-amber-700' },
    ];

    return (
        <aside className={`relative hidden h-screen flex-col border-r border-[rgba(235,227,216,0.95)] bg-[rgba(255,251,247,0.84)] backdrop-blur-xl transition-all duration-300 ease-in-out lg:flex ${isCollapsed ? 'w-16 lg:w-20' : 'w-72'}`}>
            {/* Header */}
            <div className={`border-b border-[rgba(235,227,216,0.95)] ${isCollapsed ? 'p-3' : 'p-6'}`}>
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <div className={`rounded-[1.5rem] border border-[rgba(235,227,216,0.9)] bg-white/90 shadow-[0_14px_28px_rgba(58,40,28,0.08)] ${isCollapsed ? 'p-2.5' : 'px-4 py-3'}`}>
                            <img src="https://i.ibb.co/q3YDjGLC/Scanetwork.png" alt="Scanetwork Logo" className={`${isCollapsed ? 'w-10 h-10' : 'h-12'} object-contain flex-shrink-0`} />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <button onClick={toggleCollapsed} className="hidden rounded-[1rem] border border-[rgba(235,227,216,0.9)] bg-white/80 p-2 transition-colors hover:bg-white lg:block" title="Réduire la sidebar">
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                </div>
                {isCollapsed && (
                    <button onClick={toggleCollapsed} className="mt-3 hidden w-full justify-center rounded-[1rem] border border-[rgba(235,227,216,0.9)] bg-white/80 p-2 transition-colors hover:bg-white lg:flex" title="Agrandir la sidebar">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Notifications */}
            <div className={`relative border-b border-[rgba(235,227,216,0.95)] ${isCollapsed ? 'p-2' : 'p-3'}`}>
                <button onClick={() => setShowNotifications(!showNotifications)} className={`relative w-full rounded-[1.25rem] border border-[rgba(235,227,216,0.85)] bg-white/88 px-3 py-2.5 font-medium text-gray-700 transition-all hover:bg-white ${isCollapsed ? 'flex justify-center' : 'flex items-center gap-3'}`}>
                    <div className="relative">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </div>
                    {!isCollapsed && <><span>Notifications</span>{unreadCount > 0 && <span className="ml-auto rounded-full bg-[rgba(255,56,92,0.1)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-brand-deep)]">{unreadCount}</span>}</>}
                </button>

                {showNotifications && !isCollapsed && (
                    <div className="absolute left-full top-0 z-50 ml-2 flex max-h-[600px] w-96 flex-col rounded-[1.75rem] border border-[rgba(235,227,216,0.95)] bg-[rgba(255,252,248,0.98)] shadow-[0_24px_60px_rgba(58,40,28,0.16)]">
                        <div className="flex items-center justify-between border-b border-[rgba(235,227,216,0.95)] p-4">
                            <h3 className="display-title text-2xl text-[var(--text-dark)]">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Tout marquer comme lu</button>}
                                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">Aucune notification</p></div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.priority === 'urgent' ? 'bg-red-500' : notification.priority === 'high' ? 'bg-orange-500' : notification.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                                                        <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${notification.category === 'opportunities' ? 'bg-green-100 text-green-700' : notification.category === 'contacts' ? 'bg-blue-100 text-blue-700' : notification.category === 'follow_ups' ? 'bg-orange-100 text-orange-700' : notification.category === 'events' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{notification.category}</span>
                                                        {!notification.read && (
                                                            <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                                                <Check className="w-3 h-3" />Marquer comme lu
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="mb-4">
                    {!isCollapsed && <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-brand-deep)]">Navigation</h3>}
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = view === item.id;
                        return (
                            <div key={item.id} className="relative group">
                                <button onClick={() => onViewChange(item.id)}
                                    className={`w-full rounded-[1.25rem] px-3 py-2.5 font-medium transition-all ${isCollapsed ? 'flex justify-center' : 'flex items-center justify-between'} ${isActive ? 'bg-[linear-gradient(135deg,#171311,#2d211d)] text-white shadow-[0_20px_40px_rgba(23,19,17,0.16)]' : 'border border-transparent text-gray-700 hover:border-[rgba(235,227,216,0.9)] hover:bg-white/82'}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}><Icon className="w-5 h-5 flex-shrink-0" />{!isCollapsed && <span>{item.label}</span>}</div>
                                    {!isCollapsed && item.count !== null && item.count > 0 && (
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-white/20 text-white' : item.badge ? 'bg-red-100 text-red-600' : 'bg-[rgba(32,27,24,0.06)] text-gray-700'}`}>{item.count}</span>
                                    )}
                                </button>
                                {isCollapsed && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">{item.label}</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {view === 'contacts' && !isCollapsed && (
                    <div className="border-t border-[rgba(235,227,216,0.95)] pt-4">
                        <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-brand-deep)] transition-colors hover:text-[var(--accent-brand)]">
                            <div className="flex items-center gap-2"><Filter className="w-4 h-4" />Filtres</div>
                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {showFilters && (
                            <div className="space-y-1 mt-2">
                                {filterOptions.map((option) => {
                                    const isActive = filterStatus === option.value;
                                    return (
                                        <button key={option.value} onClick={() => onFilterChange(option.value)}
                                            className={`w-full flex items-center justify-between rounded-[1rem] px-3 py-2 text-sm font-medium transition-all ${isActive ? 'border border-[rgba(255,56,92,0.16)] bg-[rgba(255,56,92,0.08)] text-[var(--accent-brand-deep)]' : 'text-gray-600 hover:bg-white/70'}`}
                                        >
                                            <span>{option.label}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-white text-[var(--accent-brand-deep)]' : option.color}`}>{option.count}</span>
                                        </button>
                                    );
                                })}
                                {filterStatus !== 'all' && <button onClick={() => onFilterChange('all')} className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-2 transition-colors">Effacer le filtre</button>}
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Bottom */}
            <div className="border-t border-[rgba(235,227,216,0.95)]">
                <div className="relative group p-2">
                    <button onClick={() => onViewChange('settings')}
                        className={`w-full rounded-[1.25rem] px-3 py-2.5 font-medium transition-all ${isCollapsed ? 'flex justify-center' : 'flex items-center gap-3'} ${view === 'settings' ? 'bg-[rgba(32,27,24,0.06)] text-gray-900' : 'text-gray-600 hover:bg-white/70'}`}
                        title={isCollapsed ? 'Paramètres' : undefined}
                    >
                        <Settings className="w-5 h-5" />{!isCollapsed && <span>Paramètres</span>}
                    </button>
                    {isCollapsed && <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Paramètres</div>}
                </div>

                <div className={`p-3 ${isCollapsed ? 'px-2' : ''}`}>
                    <div className="relative">
                        <button onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)} className={`w-full rounded-[1.25rem] border border-[rgba(235,227,216,0.85)] bg-white/88 p-2 transition-all hover:bg-white ${isCollapsed ? 'flex justify-center' : 'flex items-center gap-3'}`}>
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#171311,#ff385c)] text-sm font-semibold text-white">{getInitials(userName)}</div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 text-left"><p className="text-sm font-semibold text-gray-900 truncate">{userName}</p><p className="text-xs text-gray-500 truncate">{userEmail}</p></div>
                                    <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? '' : 'rotate-180'}`} />
                                </>
                            )}
                        </button>
                        {showUserMenu && !isCollapsed && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-[1.25rem] border border-[rgba(235,227,216,0.95)] bg-[rgba(255,252,248,0.98)] shadow-[0_20px_45px_rgba(58,40,28,0.14)]">
                                <button onClick={() => { setShowUserMenu(false); onViewChange('settings'); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"><User className="w-4 h-4" /><span className="text-sm">Mon profil</span></button>
                                <button onClick={() => { setShowUserMenu(false); onSignOut(); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4" /><span className="text-sm">Déconnexion</span></button>
                            </div>
                        )}
                    </div>
                    {isCollapsed && (
                        <div className="relative group mt-2">
                            <button onClick={onSignOut} className="w-full flex justify-center p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Déconnexion"><LogOut className="w-5 h-5" /></button>
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Déconnexion</div>
                        </div>
                    )}
                </div>
                {!isCollapsed && <p className="text-center text-xs text-gray-400 pb-3">v1.0.0</p>}
            </div>
        </aside>
    );
}
