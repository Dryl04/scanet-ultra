'use client';

import type { Contact } from '@/types';

interface RecentContactsCarouselProps {
    contacts: Contact[];
    onContactClick?: (contact: Contact) => void;
}

export function RecentContactsCarousel({ contacts, onContactClick }: RecentContactsCarouselProps) {
    const recentContacts = contacts.slice(0, 10);

    if (recentContacts.length === 0) return null;

    const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const gradients = [
        'from-blue-400 via-blue-500 to-blue-600',
        'from-violet-400 via-violet-500 to-violet-600',
        'from-emerald-400 via-emerald-500 to-emerald-600',
        'from-orange-400 via-orange-500 to-orange-600',
        'from-pink-400 via-pink-500 to-pink-600',
        'from-teal-400 via-teal-500 to-teal-600',
        'from-cyan-400 via-cyan-500 to-cyan-600',
        'from-rose-400 via-rose-500 to-rose-600',
    ];

    return (
        <div className="glass-card mb-6 overflow-hidden p-4 lg:bg-transparent lg:p-0 lg:shadow-none lg:border-0">
            <div className="mb-3 flex items-center justify-between px-1 lg:px-0">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-brand-deep)]">Présence récente</p>
                    <p className="text-sm text-[var(--text-gray)]">Vos derniers échanges à portée de main.</p>
                </div>
            </div>
            <div className="scrollbar-hide -mx-2 flex items-center gap-3 overflow-x-auto px-2 pb-0 lg:gap-4">
                {recentContacts.map((contact, index) => (
                    <button
                        key={contact.id}
                        onClick={() => onContactClick?.(contact)}
                        className="flex-shrink-0 group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-full"
                        title={contact.full_name}
                    >
                        <div className="relative text-center">
                            <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} shadow-md ring-2 ring-white/80 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:ring-4 group-hover:ring-white sm:h-14 sm:w-14 lg:h-16 lg:w-16`}>
                                {contact.avatar_url ? (
                                    <img src={contact.avatar_url} alt={contact.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-xs sm:text-sm lg:text-base font-bold">{getInitials(contact.full_name)}</span>
                                )}
                            </div>
                            <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-sm sm:h-3.5 sm:w-3.5" />
                            <p className="mt-2 max-w-[68px] truncate text-[11px] font-medium text-[var(--text-gray)] lg:max-w-[80px]">{contact.full_name.split(' ')[0]}</p>
                        </div>
                    </button>
                ))}
                {contacts.length > recentContacts.length && (
                    <div className="floating-panel ml-2 flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-gray-600 lg:px-5 lg:py-2.5 lg:text-sm">
                        +{contacts.length - recentContacts.length}
                    </div>
                )}
            </div>
        </div>
    );
}
