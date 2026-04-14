'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, Users, Target, Briefcase, Calendar, DollarSign, Star, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useKpis } from '@/contexts/KpiContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ContactProfile } from './ContactProfile';
import { AddContactModal } from './AddContactModal';
import { AddEventModal } from './AddEventModal';
import { ScanContactModal } from './ScanContactModal';
import { AddContactOptionsModal } from './AddContactOptionsModal';
import { EventQRCodeModal } from './EventQRCodeModal';
import { Sidebar } from './Sidebar';
import { EventsList } from './EventsList';
import { EventProfile } from './EventProfile';
import { ContactsToolbar } from './ContactsToolbar';
import { ContactsListView } from './ContactsListView';
import { ContactsGridView } from './ContactsGridView';
import { ContactsPhotoView } from './ContactsPhotoView';
import { Opportunities } from './Opportunities';
import { Offers } from './Offers';
import { Settings } from './Settings';
import { Enterprise } from './Entreprise';
import { StatsCards } from './StatsCards';
import { StatusTabs } from './StatusTabs';
import { RecentContactsCarousel } from './RecentContactsCarousel';
import { Hero, HeroText } from './Hero';
import { Navbar } from './Navbar';
import Relances from './Relances';
import ScheduleEmailModal from './ScheduleEmailModal';
import { PersonalObjectives } from './PersonalObjectives';
import { formatCurrency } from '@/lib/currency';
import type { Contact, Event, ViewType, ViewMode, SortOption } from '@/types';

export function Dashboard() {
    const { profile, signOut } = useAuth();
    const { globalKpis, refreshKpis, loading: kpisLoading } = useKpis();
    const { refreshNotifications } = useNotifications();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewType>('dashboard');
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('date_desc');
    const [filters, setFilters] = useState({
        events: [] as string[], tags: [] as string[], relationships: [] as string[],
        cities: [] as string[], regions: [] as string[], countries: [] as string[],
        opportunityMin: null as number | null, opportunityMax: null as number | null,
    });
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [showAddOptionsModal, setShowAddOptionsModal] = useState(false);
    const [showEventQRModal, setShowEventQRModal] = useState(false);
    const [currentEventForQR, setCurrentEventForQR] = useState<Event | null>(null);
    const [showScheduleEmailModal, setShowScheduleEmailModal] = useState(false);
    const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

    useEffect(() => {
        loadContacts();
    }, []);

    // Poll contacts for updates every 20 seconds (replacing Supabase realtime)
    useEffect(() => {
        const interval = setInterval(loadContacts, 20000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (view !== 'events' && view !== 'dashboard') return;

        const interval = setInterval(loadEvents, 20000);
        return () => clearInterval(interval);
    }, [view]);

    useEffect(() => {
        filterAndSortContacts();
    }, [contacts, searchTerm, filterStatus, sortBy, filters]);

    useEffect(() => {
        extractAvailableTags();
    }, [contacts]);

    useEffect(() => {
        if (view === 'events' || view === 'dashboard') {
            loadEvents();
        }
    }, [view]);

    const loadContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            if (!res.ok) throw new Error('Failed to load contacts');
            const data = await res.json();
            setContacts(data.contacts || []);
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async () => {
        setEventsLoading(true);
        try {
            const res = await fetch('/api/events');
            if (!res.ok) throw new Error('Failed to load events');
            const data = await res.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setEventsLoading(false);
        }
    };

    const extractAvailableTags = () => {
        const tagsSet = new Set<string>();
        contacts.forEach((contact) => {
            if (contact.tags && Array.isArray(contact.tags)) {
                contact.tags.forEach((tag) => tagsSet.add(tag));
            }
        });
        setAvailableTags(Array.from(tagsSet).sort());
    };

    const filterAndSortContacts = useCallback(() => {
        let filtered = contacts;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.full_name.toLowerCase().includes(searchLower) ||
                    c.company?.toLowerCase().includes(searchLower) ||
                    c.email?.toLowerCase().includes(searchLower) ||
                    c.job_title?.toLowerCase().includes(searchLower) ||
                    c.phone?.toLowerCase().includes(searchLower) ||
                    c.city?.toLowerCase().includes(searchLower) ||
                    c.region?.toLowerCase().includes(searchLower) ||
                    c.country?.toLowerCase().includes(searchLower) ||
                    c.industry?.toLowerCase().includes(searchLower) ||
                    c.address?.toLowerCase().includes(searchLower) ||
                    c.website?.toLowerCase().includes(searchLower) ||
                    (c.tags && c.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter((c) => c.status === filterStatus);
        }

        if (filters.events.length > 0) {
            filtered = filtered.filter((c) =>
                c.events?.some((event) => filters.events.includes(event.id))
            );
        }

        if (filters.tags.length > 0) {
            filtered = filtered.filter((c) => c.tags && filters.tags.some((tag) => c.tags?.includes(tag)));
        }

        if (filters.relationships.length > 0) {
            filtered = filtered.filter((c) => c.relationship && filters.relationships.includes(c.relationship));
        }

        if (filters.cities.length > 0 && filters.cities[0]) {
            filtered = filtered.filter((c) => c.city?.toLowerCase().includes(filters.cities[0].toLowerCase()));
        }

        if (filters.regions.length > 0 && filters.regions[0]) {
            filtered = filtered.filter((c) => c.region?.toLowerCase().includes(filters.regions[0].toLowerCase()));
        }

        if (filters.countries.length > 0 && filters.countries[0]) {
            filtered = filtered.filter((c) => c.country?.toLowerCase().includes(filters.countries[0].toLowerCase()));
        }

        if (filters.opportunityMin !== null) {
            filtered = filtered.filter((c) => (c.opportunity_amount || 0) >= filters.opportunityMin!);
        }

        if (filters.opportunityMax !== null) {
            filtered = filtered.filter((c) => (c.opportunity_amount || 0) <= filters.opportunityMax!);
        }

        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name_asc': return a.full_name.localeCompare(b.full_name);
                case 'name_desc': return b.full_name.localeCompare(a.full_name);
                case 'date_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'date_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'rating_asc': return (a.rating || 0) - (b.rating || 0);
                case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
                default: return 0;
            }
        });

        setFilteredContacts(filtered);
    }, [contacts, searchTerm, filterStatus, sortBy, filters]);

    const handleContactAdded = () => {
        loadContacts();
        refreshKpis();
        refreshNotifications();
        if (view === 'events') loadEvents();
        setShowAddModal(false);
    };

    const handleContactClick = (contact: Contact) => setSelectedContactId(contact.id);
    const handleSendOffer = (contact: Contact) => { setSelectedContactId(contact.id); setView('offers'); };
    const quickActions = [
        {
            onClick: () => setShowAddModal(true),
            icon: Plus,
            title: 'Nouveau contact',
            desc: 'Ajouter un profil et enrichir votre réseau.',
            iconWrapClass: 'bg-[rgba(255,56,92,0.12)] text-[#d61f53]',
            cardClass: 'border-[rgba(255,56,92,0.14)] hover:border-[rgba(255,56,92,0.34)] hover:shadow-[0_16px_35px_rgba(255,56,92,0.12)]',
        },
        {
            onClick: () => setShowAddEventModal(true),
            icon: Calendar,
            title: 'Nouvel événement',
            desc: 'Préparez une rencontre et son point de collecte.',
            iconWrapClass: 'bg-[rgba(124,58,237,0.12)] text-violet-700',
            cardClass: 'border-[rgba(124,58,237,0.14)] hover:border-[rgba(124,58,237,0.28)] hover:shadow-[0_16px_35px_rgba(124,58,237,0.12)]',
        },
        {
            onClick: () => setView('opportunities'),
            icon: Target,
            title: 'Opportunités',
            desc: 'Suivez vos deals actifs sans changer de rythme.',
            iconWrapClass: 'bg-[rgba(16,185,129,0.12)] text-emerald-700',
            cardClass: 'border-[rgba(16,185,129,0.14)] hover:border-[rgba(16,185,129,0.28)] hover:shadow-[0_16px_35px_rgba(16,185,129,0.12)]',
        },
        {
            onClick: () => setView('offers'),
            icon: Briefcase,
            title: 'Offres',
            desc: 'Retrouvez vos propositions prêtes à être envoyées.',
            iconWrapClass: 'bg-[rgba(249,115,22,0.12)] text-orange-700',
            cardClass: 'border-[rgba(249,115,22,0.14)] hover:border-[rgba(249,115,22,0.28)] hover:shadow-[0_16px_35px_rgba(249,115,22,0.12)]',
        },
    ];

    if (selectedContactId) {
        return (
            <ContactProfile
                contactId={selectedContactId}
                onBack={() => { setSelectedContactId(null); loadContacts(); }}
                onNavigateToEnterprise={() => { setSelectedContactId(null); setView('enterprise'); }}
            />
        );
    }

    if (selectedEventId) {
        return (
            <EventProfile
                eventId={selectedEventId}
                onBack={() => { setSelectedEventId(null); loadEvents(); }}
                onContactSelect={(contactId) => { setSelectedContactId(contactId); setSelectedEventId(null); setView('contacts'); }}
            />
        );
    }

    return (
        <div className="relative flex h-screen overflow-hidden bg-[var(--bg-base)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-9rem] top-[-7rem] h-72 w-72 rounded-full bg-[rgba(255,214,221,0.55)] blur-3xl" />
                <div className="absolute right-[-6rem] top-20 h-64 w-64 rounded-full bg-[rgba(255,240,229,0.7)] blur-3xl" />
                <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-[rgba(255,56,92,0.08)] blur-3xl" />
            </div>

            <Sidebar
                view={view}
                onViewChange={(newView) => { setView(newView); setIsSidebarOpen(false); if (newView === 'events') loadEvents(); }}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                onSignOut={signOut}
                stats={{
                    total: globalKpis.totalContacts, leads: globalKpis.totalLeads, prospects: globalKpis.totalProspects,
                    clients: globalKpis.totalClients, partners: globalKpis.totalPartners,
                    collaborateurs: globalKpis.totalCollaborateurs, amis: globalKpis.totalAmis, fournisseurs: globalKpis.totalFournisseurs,
                }}
                eventsCount={globalKpis.totalEvents}
                userName={profile?.full_name || 'Utilisateur'}
                userEmail={profile?.email || ''}
                isMobileOpen={isSidebarOpen}
                onMobileClose={() => setIsSidebarOpen(false)}
            />

            <div className="relative z-10 flex flex-1 flex-col overflow-hidden lg:ml-0">
                <header className="sticky top-0 z-20 border-b border-[rgba(235,227,216,0.9)] bg-[rgba(255,251,247,0.82)] px-4 py-3 shadow-[0_10px_30px_rgba(58,40,28,0.04)] backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <img src="https://i.ibb.co/q3YDjGLC/Scanetwork.png" alt="Scanetwork" className="h-8 sm:h-9 lg:hidden object-contain flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-brand-deep)]">
                                    Espace de travail
                                </p>
                                <h2 className="display-title truncate text-[2rem] leading-none text-[var(--text-dark)] sm:text-[2.25rem] lg:text-[2.6rem]">
                                    {view === 'dashboard' && 'Tableau de bord'}
                                    {view === 'contacts' && 'Mes Contacts'}
                                    {view === 'events' && 'Événements'}
                                    {view === 'followups' && 'Relances'}
                                    {view === 'opportunities' && 'Opportunités'}
                                    {view === 'offers' && 'Offres'}
                                    {view === 'enterprise' && 'Entreprise'}
                                    {view === 'settings' && 'Paramètres'}
                                </h2>
                                <p className="mt-1 hidden truncate text-xs text-[var(--text-gray)] sm:block sm:text-sm">Bienvenue, {profile?.full_name || 'User'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-4 pb-36 sm:px-6 sm:py-5 lg:px-8 lg:py-6 lg:pb-10">
                    {view === 'contacts' && (
                        <div className="mx-auto w-full max-w-7xl space-y-6">
                            <Hero label="Networking" imageUrl="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg" imageAlt="Networking contacts">
                                <HeroText>Gérez et développez</HeroText>
                                <HeroText highlight highlightColor="purple">votre réseau</HeroText>
                                <HeroText>professionnel</HeroText>
                            </Hero>

                            <RecentContactsCarousel contacts={contacts} onContactClick={handleContactClick} />
                            <StatsCards totalContacts={globalKpis.totalContacts} leads={globalKpis.totalLeads} clients={globalKpis.totalClients} partners={globalKpis.totalPartners} />
                            <StatusTabs
                                currentStatus={filterStatus}
                                counts={{ all: globalKpis.totalContacts, lead: globalKpis.totalLeads, prospect: globalKpis.totalProspects, client: globalKpis.totalClients, partner: globalKpis.totalPartners, collaborateur: globalKpis.totalCollaborateurs, ami: globalKpis.totalAmis, fournisseur: globalKpis.totalFournisseurs }}
                                onStatusChange={setFilterStatus}
                            />
                            <ContactsToolbar
                                searchTerm={searchTerm} onSearchChange={setSearchTerm} viewMode={viewMode} onViewModeChange={setViewMode}
                                sortBy={sortBy} onSortChange={setSortBy} filters={filters} onFiltersChange={setFilters}
                                availableTags={availableTags} onAddContact={() => setShowAddModal(true)}
                            />

                            {loading ? (
                                <div className="glass-card py-16 text-center">
                                    <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[rgba(255,56,92,0.16)] border-t-[var(--accent-brand)]" />
                                    <p className="mt-4 font-semibold text-[var(--text-dark)]">Chargement des contacts...</p>
                                </div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="glass-card relative overflow-hidden py-16 text-center">
                                    <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,56,92,0.25),transparent)]" />
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(255,56,92,0.14),rgba(255,217,226,0.7))] shadow-[0_20px_40px_rgba(255,56,92,0.12)]">
                                        <Users className="h-10 w-10 text-[var(--accent-brand-deep)]" />
                                    </div>
                                    <h3 className="display-title mb-3 text-3xl text-[var(--text-dark)]">Aucun contact trouvé</h3>
                                    <p className="mx-auto mb-6 max-w-md text-[var(--text-gray)]">
                                        {searchTerm || filterStatus !== 'all' || filters.events.length > 0 || filters.tags.length > 0
                                            ? "Essayez d'ajuster vos filtres pour voir plus de résultats"
                                            : 'Commencez à construire votre réseau en ajoutant votre premier contact'}
                                    </p>
                                    {!searchTerm && filterStatus === 'all' && filters.events.length === 0 && (
                                        <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center gap-2 px-6 py-3 shadow-[0_18px_40px_rgba(255,56,92,0.18)]">
                                            <Plus className="w-5 h-5" />Ajouter votre premier contact
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {viewMode === 'grid' && <ContactsGridView contacts={filteredContacts} onContactClick={handleContactClick} onSendOffer={handleSendOffer} />}
                                    {viewMode === 'list' && <ContactsListView contacts={filteredContacts} onContactClick={handleContactClick} />}
                                    {viewMode === 'photos' && <ContactsPhotoView contacts={filteredContacts} onContactClick={handleContactClick} />}
                                </>
                            )}
                        </div>
                    )}

                    {view === 'events' && <EventsList onEventClick={setSelectedEventId} onCreateEvent={() => setShowAddEventModal(true)} refreshKey={eventsRefreshKey} />}
                    {view === 'followups' && <Relances onScheduleNew={() => setShowScheduleEmailModal(true)} />}
                    {view === 'opportunities' && <Opportunities onContactSelect={(contactId) => { setSelectedContactId(contactId); setView('contacts'); }} />}
                    {view === 'offers' && <Offers />}
                    {view === 'settings' && <Settings />}
                    {view === 'enterprise' && <Enterprise />}

                    {view === 'dashboard' && (
                        <div className="space-y-6 lg:space-y-8">
                            <Hero label="Bienvenue" imageUrl="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg" imageAlt="Dashboard business">
                                <HeroText>Pilotez votre</HeroText>
                                <HeroText highlight highlightColor="blue">activité commerciale</HeroText>
                                <HeroText>en temps réel</HeroText>
                            </Hero>

                            {/* KPI Cards */}
                            <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(235,227,216,0.9)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,244,239,0.9))] p-5 shadow-[0_24px_55px_rgba(58,40,28,0.08)] lg:p-6">
                                <div className="pointer-events-none absolute right-[-2rem] top-[-1rem] h-40 w-40 rounded-full bg-[rgba(255,56,92,0.09)] blur-3xl" />
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-8">
                                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                        {/* Total Contacts - Dark card */}
                                        <div className="group relative overflow-hidden">
                                            <div className="relative overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,#171311_0%,#2d211d_52%,#ff385c_180%)] p-4 shadow-[0_22px_40px_rgba(23,19,17,0.32)] transition-all duration-300 hover:-translate-y-0.5 lg:p-5">
                                                <div className="absolute -right-8 top-8 h-28 w-28 rounded-full border border-white/10" />
                                                <div className="absolute -right-4 top-4 h-36 w-36 rounded-full bg-white/10" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                                                        <div className="p-1.5 rounded-lg bg-white/10"><Users className="w-3.5 h-3.5 text-white/90" strokeWidth={2} /></div>
                                                        <p className="text-[10px] lg:text-xs font-medium uppercase tracking-[0.22em] text-white/70">Total Contacts</p>
                                                    </div>
                                                    <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{globalKpis.totalContacts}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CA Gagné */}
                                        <div className="group relative overflow-hidden">
                                            <div className="relative rounded-[1.6rem] border border-[rgba(235,227,216,0.85)] bg-white/90 p-4 shadow-[0_12px_28px_rgba(58,40,28,0.08)] transition-all duration-300 hover:-translate-y-0.5 lg:p-5">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                                                        <div className="rounded-xl p-2" style={{ backgroundColor: '#10b98115' }}><DollarSign className="w-3.5 h-3.5" strokeWidth={2} style={{ color: '#10b981' }} /></div>
                                                        <p className="text-[10px] lg:text-xs font-medium uppercase tracking-[0.22em] text-gray-500">CA Gagné</p>
                                                    </div>
                                                    <h3 className="text-xl font-bold tracking-tight text-gray-900 lg:text-2xl">{formatCurrency(globalKpis.wonAmount, globalKpis.userCurrency)}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Opportunités */}
                                        <div className="group relative overflow-hidden">
                                            <div className="relative rounded-[1.6rem] border border-[rgba(235,227,216,0.85)] bg-white/90 p-4 shadow-[0_12px_28px_rgba(58,40,28,0.08)] transition-all duration-300 hover:-translate-y-0.5 lg:p-5">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                                                        <div className="rounded-xl p-2" style={{ backgroundColor: '#8b5cf615' }}><Target className="w-3.5 h-3.5" strokeWidth={2} style={{ color: '#8b5cf6' }} /></div>
                                                        <p className="text-[10px] lg:text-xs font-medium uppercase tracking-[0.22em] text-gray-500">Opportunités</p>
                                                    </div>
                                                    <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">{globalKpis.activeOpportunities}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pipeline */}
                                        <div className="group relative overflow-hidden">
                                            <div className="relative rounded-[1.6rem] border border-[rgba(235,227,216,0.85)] bg-white/90 p-4 shadow-[0_12px_28px_rgba(58,40,28,0.08)] transition-all duration-300 hover:-translate-y-0.5 lg:p-5">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                                                        <div className="rounded-xl p-2" style={{ backgroundColor: '#f59e0b15' }}><TrendingUp className="w-3.5 h-3.5" strokeWidth={2} style={{ color: '#f59e0b' }} /></div>
                                                        <p className="text-[10px] lg:text-xs font-medium uppercase tracking-[0.22em] text-gray-500">Pipeline</p>
                                                    </div>
                                                    <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900">{formatCurrency(globalKpis.totalPipeline, globalKpis.userCurrency)}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="relative overflow-hidden rounded-[1.8rem] border border-[rgba(235,227,216,0.9)] bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_18px_40px_rgba(58,40,28,0.08)] backdrop-blur-xl lg:p-6">
                                        <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,56,92,0.28),transparent)]" />
                                        <div className="relative z-10">
                                            <div className="mb-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-brand-deep)]">Actions rapides</p>
                                                <h3 className="display-title mt-1 text-3xl text-[var(--text-dark)]">Gardez le rythme</h3>
                                                <p className="mt-1 text-sm text-[var(--text-gray)]">Accès direct aux actions les plus fréquentes du jour.</p>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                {quickActions.map((action) => (
                                                    <button key={action.title} onClick={action.onClick} className={`group flex items-center gap-3 rounded-[1.4rem] border bg-white/88 p-3.5 transition-all duration-200 ${action.cardClass}`}>
                                                        <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${action.iconWrapClass}`}>
                                                            <action.icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <div className="text-sm font-semibold text-gray-900">{action.title}</div>
                                                            <div className="text-xs text-[var(--text-gray)]">{action.desc}</div>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[var(--text-dark)]" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <PersonalObjectives />

                            {/* Derniers contacts ajoutés */}
                            <div className="glass-card relative overflow-hidden p-5 lg:p-6">
                                <div className="relative flex items-center justify-between mb-5">
                                    <h3 className="display-title text-3xl text-[var(--text-dark)]">Derniers contacts ajoutés</h3>
                                    <button onClick={() => setView('contacts')} className="flex items-center gap-1 text-sm font-semibold text-[var(--accent-brand-deep)] transition-all hover:text-[var(--accent-brand)]">
                                        Voir tous <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                {contacts.length === 0 ? (
                                    <div className="relative text-center py-12 px-4">
                                        <Users className="mx-auto mb-3 h-16 w-16 text-gray-300" /><p className="font-medium text-[var(--text-gray)]">Aucun contact trouvé</p>
                                    </div>
                                ) : (
                                    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                        {contacts.slice(0, 5).map((contact) => (
                                            <div key={contact.id} onClick={() => handleContactClick(contact)} className="glass-card cursor-pointer p-4 group">
                                                <div className="flex flex-col items-center text-center">
                                                    {contact.avatar_url ? (
                                                        <img src={contact.avatar_url} alt={contact.full_name} className="mb-3 h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-lg" />
                                                    ) : (
                                                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff5c7c,#d61f53)] text-lg font-semibold text-white ring-4 ring-white shadow-lg">
                                                            {contact.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </div>
                                                    )}
                                                    <h3 className="font-bold text-gray-900 text-sm truncate w-full mb-1">{contact.full_name}</h3>
                                                    {contact.company && <p className="text-xs text-gray-600 truncate w-full mb-2">{contact.company}</p>}
                                                    {contact.rating && contact.rating > 0 && (
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < contact.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} />)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Derniers événements */}
                            <div className="glass-card relative overflow-hidden p-5 lg:p-6">
                                <div className="relative flex items-center justify-between mb-5">
                                    <h3 className="display-title text-3xl text-[var(--text-dark)]">Derniers événements</h3>
                                    <button onClick={() => setView('events')} className="flex items-center gap-1 text-sm font-semibold text-[var(--accent-brand-deep)] transition-all hover:text-[var(--accent-brand)]">
                                        Voir tous <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                {eventsLoading ? (
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {[...Array(4)].map((_, i) => <div key={i} className="h-40 w-64 flex-shrink-0 rounded-[1.9rem] bg-[rgba(255,255,255,0.74)] animate-pulse" />)}
                                    </div>
                                ) : events.length === 0 ? (
                                    <div className="relative text-center py-12 px-4">
                                        <Calendar className="mx-auto mb-3 h-16 w-16 text-gray-300" /><p className="font-medium text-[var(--text-gray)]">Aucun événement trouvé</p>
                                    </div>
                                ) : (
                                    <div className="relative flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {events.slice(0, 6).map((event) => (
                                            <div key={event.id} onClick={() => setSelectedEventId(event.id)} className="glass-card group w-64 flex-shrink-0 cursor-pointer p-4 text-left">
                                                {event.image_url ? (
                                                    <div className="mb-3 h-24 w-full overflow-hidden rounded-[1.4rem] bg-gray-100 shadow-lg ring-2 ring-white/70">
                                                        <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="mb-3 flex h-24 w-full items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#171311,#ff385c)] shadow-lg ring-2 ring-white/70">
                                                        <Calendar className="w-8 h-8 text-white" />
                                                    </div>
                                                )}
                                                <h4 className="font-bold text-gray-900 line-clamp-1 mb-2">{event.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {event.start_date ? new Date(event.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Date non définie'}
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="line-clamp-1">{event.location}</span>
                                                    </div>
                                                )}
                                                <span className="rounded-full bg-[rgba(255,56,92,0.08)] px-3 py-1 text-xs font-semibold text-[var(--accent-brand-deep)]">{event.contact_count || 0} contacts</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {showAddModal && <AddContactModal onClose={() => setShowAddModal(false)} onContactAdded={handleContactAdded} onNavigateToEnterprise={() => { setShowAddModal(false); setView('enterprise'); }} />}
            {showAddEventModal && <AddEventModal onClose={() => setShowAddEventModal(false)} onSuccess={() => { setShowAddEventModal(false); loadEvents(); refreshKpis(); refreshNotifications(); setEventsRefreshKey(prev => prev + 1); }} />}
            {showScanModal && <ScanContactModal onClose={() => setShowScanModal(false)} onContactAdded={() => { setShowScanModal(false); loadContacts(); refreshKpis(); refreshNotifications(); }} />}
            {showAddOptionsModal && (
                <AddContactOptionsModal
                    onClose={() => setShowAddOptionsModal(false)}
                    onScanCard={() => setShowScanModal(true)}
                    onShowEventQR={() => {
                        const activeEvent = events.find(e => e.qr_code_token) || null;
                        if (activeEvent) { setCurrentEventForQR(activeEvent); setShowEventQRModal(true); }
                    }}
                    onManualAdd={() => setShowAddModal(true)}
                    hasActiveEvent={events.some(e => e.qr_code_token)}
                />
            )}
            {showEventQRModal && currentEventForQR && (
                <EventQRCodeModal eventName={currentEventForQR.name} qrCodeToken={currentEventForQR.qr_code_token || ''} onClose={() => { setShowEventQRModal(false); setCurrentEventForQR(null); }} />
            )}
            {showScheduleEmailModal && <ScheduleEmailModal onClose={() => setShowScheduleEmailModal(false)} onSuccess={() => { setShowScheduleEmailModal(false); }} />}

            <Navbar
                view={view}
                onViewChange={(newView) => { setView(newView); setIsSidebarOpen(false); if (newView === 'events') loadEvents(); }}
                onSignOut={signOut}
                onAddContact={() => setShowAddOptionsModal(true)}
                userName={profile?.full_name || 'Utilisateur'}
                userEmail={profile?.email || ''}
                stats={{
                    total: globalKpis.totalContacts, leads: globalKpis.totalLeads, prospects: globalKpis.totalProspects,
                    clients: globalKpis.totalClients, partners: globalKpis.totalPartners,
                    collaborateurs: globalKpis.totalCollaborateurs, amis: globalKpis.totalAmis, fournisseurs: globalKpis.totalFournisseurs,
                }}
                eventsCount={globalKpis.totalEvents}
                followUpsCount={0}
            />
        </div>
    );
}
