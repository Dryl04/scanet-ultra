'use client';

import { useState } from 'react';
import { Home, Users, Calendar, Target, Package, Building2, Settings, Bell, LogOut, User, Plus, X, CheckSquare, MoreHorizontal } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import type { ViewType } from '@/types';

interface NavbarProps {
    view: ViewType;
    onViewChange: (view: ViewType) => void;
    onSignOut: () => void;
    onAddContact: () => void;
    userName?: string;
    userEmail?: string;
    stats: { total: number; leads: number; prospects: number; clients: number; partners: number; collaborateurs?: number; amis?: number; fournisseurs?: number; };
    eventsCount?: number;
    followUpsCount?: number;
}

export function Navbar({ view, onViewChange, onSignOut, onAddContact, userName = 'Utilisateur', userEmail = '', stats, eventsCount = 0, followUpsCount = 0 }: NavbarProps) {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    const mainNavItems = [
        { id: 'dashboard' as ViewType, label: 'Accueil', icon: Home },
        { id: 'contacts' as ViewType, label: 'Contacts', icon: Users, badge: stats.total },
        { id: 'events' as ViewType, label: 'Événements', icon: Calendar, badge: eventsCount },
        { id: 'more', label: 'Plus', icon: MoreHorizontal },
    ];

    const moreMenuItems = [
        { id: 'followups' as ViewType, label: 'Relances', icon: CheckSquare, badge: followUpsCount > 0 ? followUpsCount : null },
        { id: 'opportunities' as ViewType, label: 'Opportunités', icon: Target },
        { id: 'offers' as ViewType, label: 'Offres', icon: Package },
        { id: 'enterprise' as ViewType, label: 'Entreprise', icon: Building2 },
        { id: 'settings' as ViewType, label: 'Paramètres', icon: Settings },
    ];

    const handleNavClick = (itemId: string) => { itemId === 'more' ? setShowMoreMenu(true) : onViewChange(itemId as ViewType); };
    const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            <nav className="fixed bottom-3 left-3 right-3 z-40 lg:hidden">
                <div className="relative rounded-[2rem] border border-[rgba(235,227,216,0.92)] bg-[rgba(255,255,255,0.88)] px-4 pb-3 pt-2 shadow-[0_22px_45px_rgba(58,40,28,0.14)] backdrop-blur-xl safe-area-bottom">
                    <button onClick={onAddContact} className="absolute left-1/2 top-0 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[linear-gradient(135deg,#171311,#ff385c)] shadow-[0_20px_40px_rgba(255,56,92,0.24)] transition-transform hover:scale-105 active:scale-95 border-4 border-[var(--bg-base)]" aria-label="Ajouter un contact">
                        <Plus className="h-7 w-7 text-white" />
                    </button>
                    {mainNavItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = view === item.id;
                        return (
                            <button key={item.id} onClick={() => handleNavClick(item.id)}
                                className={`relative flex max-w-[76px] flex-1 flex-col items-center justify-center rounded-[1.3rem] py-3 transition-all ${index === 1 ? 'mr-8' : ''} ${index === 2 ? 'ml-8' : ''} ${isActive ? 'bg-[rgba(255,56,92,0.08)] text-[var(--accent-brand-deep)]' : 'text-gray-500'}`}
                            >
                                <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                                <span className={`mt-1 text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute right-2 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-brand)] text-[9px] font-semibold text-white">{item.badge > 9 ? '9+' : item.badge}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* More Menu Modal */}
            {showMoreMenu && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMoreMenu(false)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-[2rem] bg-[rgba(255,252,248,0.98)] shadow-[0_-24px_60px_rgba(58,40,28,0.18)] lg:hidden">
                        <div className="sticky top-0 z-10 rounded-t-[2rem] border-b border-[rgba(235,227,216,0.9)] bg-[rgba(255,252,248,0.96)] backdrop-blur-xl">
                            <div className="flex items-center justify-between p-4">
                                <h3 className="display-title text-3xl text-[var(--text-dark)]">Menu</h3>
                                <button onClick={() => setShowMoreMenu(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-600" /></button>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            <button onClick={() => { setShowNotifications(true); setShowMoreMenu(false); }} className="w-full flex items-center justify-between rounded-[1.5rem] border border-[rgba(235,227,216,0.9)] bg-white/90 p-4 transition-colors hover:bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[rgba(255,56,92,0.08)]">
                                        <Bell className="h-5 w-5 text-[var(--accent-brand-deep)]" />
                                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                    </div>
                                    <div className="text-left"><p className="font-medium text-gray-900">Notifications</p>{unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>}</div>
                                </div>
                            </button>
                            <div className="h-px bg-gray-200 my-2" />
                            {moreMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = view === item.id;
                                return (
                                    <button key={item.id} onClick={() => { onViewChange(item.id); setShowMoreMenu(false); }}
                                        className={`w-full flex items-center justify-between rounded-[1.5rem] p-4 transition-colors ${isActive ? 'bg-[linear-gradient(135deg,#171311,#2d211d)] text-white shadow-[0_20px_40px_rgba(23,19,17,0.16)]' : 'border border-transparent bg-white/70 hover:border-[rgba(235,227,216,0.9)] hover:bg-white'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-[1rem] ${isActive ? 'bg-white/20' : 'bg-[rgba(255,56,92,0.08)]'}`}><Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--accent-brand-deep)]'}`} /></div>
                                            <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>{item.label}</span>
                                        </div>
                                        {item.badge && <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{item.badge}</span>}
                                    </button>
                                );
                            })}
                            <div className="h-px bg-gray-200 my-2" />
                            <div className="rounded-[1.7rem] border border-[rgba(235,227,216,0.9)] bg-[rgba(255,248,244,0.82)] p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#171311,#ff385c)] text-white font-semibold">{getInitials(userName)}</div>
                                    <div className="flex-1"><p className="font-semibold text-gray-900">{userName}</p><p className="text-sm text-gray-500">{userEmail}</p></div>
                                </div>
                                <button onClick={() => { setShowMoreMenu(false); onViewChange('settings'); }} className="w-full flex items-center gap-2 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors mb-2"><User className="w-5 h-5 text-gray-600" /><span className="text-sm font-medium text-gray-700">Mon profil</span></button>
                                <button onClick={() => { setShowMoreMenu(false); onSignOut(); }} className="w-full flex items-center gap-2 p-3 bg-white rounded-lg hover:bg-red-50 transition-colors text-red-600"><LogOut className="w-5 h-5" /><span className="text-sm font-medium">Déconnexion</span></button>
                            </div>
                        </div>
                        <div className="h-16" />
                    </div>
                </>
            )}

            {/* Notifications Modal */}
            {showNotifications && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowNotifications(false)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-t-[2rem] bg-[rgba(255,252,248,0.98)] shadow-[0_-24px_60px_rgba(58,40,28,0.18)] lg:hidden">
                        <div className="sticky top-0 z-10 rounded-t-[2rem] border-b border-[rgba(235,227,216,0.9)] bg-[rgba(255,252,248,0.96)] backdrop-blur-xl">
                            <div className="flex items-center justify-between p-4">
                                <h3 className="display-title text-3xl text-[var(--text-dark)]">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && <button onClick={() => markAllAsRead()} className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50">Tout marquer</button>}
                                    <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-600" /></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">Aucune notification</p></div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className={`p-4 ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.priority === 'urgent' ? 'bg-red-500' : notification.priority === 'high' ? 'bg-orange-500' : notification.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                                                        <button onClick={() => deleteNotification(notification.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="w-4 h-4" /></button>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                        <span className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                        {!notification.read && <button onClick={() => markAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Marquer comme lu</button>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="h-16" />
                    </div>
                </>
            )}
        </>
    );
}
