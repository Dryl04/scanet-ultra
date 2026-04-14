'use client';

import { Star, Mail, Phone, Building2 } from 'lucide-react';
import type { Contact } from '@/types';

interface ContactCardProps {
    contact: Contact;
    onClick: () => void;
    onSendOffer?: (contact: Contact) => void;
}

export function ContactCard({ contact, onClick, onSendOffer }: ContactCardProps) {
    const statusColors: Record<string, string> = {
        lead: 'bg-orange-100 text-orange-700',
        prospect: 'bg-amber-100 text-amber-700',
        client: 'bg-emerald-100 text-emerald-700',
        partner: 'bg-violet-100 text-violet-700',
        collaborateur: 'bg-cyan-100 text-cyan-700',
        ami: 'bg-pink-100 text-pink-700',
        fournisseur: 'bg-amber-100 text-amber-700',
    };

    const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="glass-card group cursor-pointer p-5" onClick={onClick}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {contact.avatar_url ? (
                        <img src={contact.avatar_url} alt={contact.full_name} className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-lg" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#171311,#ff385c)] text-lg font-semibold text-white ring-4 ring-white shadow-lg">
                            {getInitials(contact.full_name)}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="truncate text-2xl font-semibold text-[var(--text-dark)] [font-family:var(--font-display)]">{contact.full_name}</h3>
                    </div>
                    {contact.job_title && <p className="mb-2 truncate text-sm text-[var(--text-gray)]">{contact.job_title}</p>}
                    {contact.rating && contact.rating > 0 && (
                        <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < contact.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} />
                            ))}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {contact.status && (
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[contact.status] || 'bg-gray-100 text-gray-700'}`}>
                                {contact.status}
                            </span>
                        )}
                        {contact.source && (
                            <span className="rounded-full bg-[rgba(32,27,24,0.05)] px-3 py-1 text-xs font-semibold text-[var(--text-gray)]">{contact.source}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4 border-t border-[rgba(235,227,216,0.9)] pt-3">
                <div className="flex flex-wrap gap-3 text-sm text-[var(--text-gray)]">
                    {contact.email && (
                        <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5"><Mail className="w-4 h-4 text-[var(--accent-brand-deep)]" /><span className="truncate max-w-[150px]">{contact.email}</span></div>
                    )}
                    {contact.phone && (
                        <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5"><Phone className="w-4 h-4 text-[var(--accent-brand-deep)]" /><span>{contact.phone}</span></div>
                    )}
                    {contact.company && (
                        <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5"><Building2 className="w-4 h-4 text-[var(--accent-brand-deep)]" /><span className="truncate max-w-[150px]">{contact.company}</span></div>
                    )}
                </div>
            </div>
        </div>
    );
}
