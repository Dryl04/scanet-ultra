'use client';

interface StatusTabsProps {
    currentStatus: string;
    counts: {
        all: number;
        lead: number;
        prospect: number;
        client: number;
        partner: number;
        collaborateur?: number;
        ami?: number;
        fournisseur?: number;
    };
    onStatusChange: (status: string) => void;
}

export function StatusTabs({ currentStatus, counts, onStatusChange }: StatusTabsProps) {
    const tabs = [
        { id: 'lead', label: 'Leads', count: counts.lead, color: 'orange' },
        { id: 'prospect', label: 'Prospects', count: counts.prospect, color: 'blue' },
        { id: 'client', label: 'Clients', count: counts.client, color: 'emerald' },
        { id: 'partner', label: 'Partenaires', count: counts.partner, color: 'violet' },
        { id: 'collaborateur', label: 'Collaborateurs', count: counts.collaborateur || 0, color: 'cyan' },
        { id: 'ami', label: 'Ami(e)s', count: counts.ami || 0, color: 'pink' },
        { id: 'fournisseur', label: 'Fournisseurs', count: counts.fournisseur || 0, color: 'amber' },
    ];

    const getTabClasses = (tabId: string, color: string) => {
        const isActive = currentStatus === tabId;
        const colorClasses: Record<string, string> = {
            orange: isActive ? 'bg-[linear-gradient(135deg,#171311,#ff7a45)] text-white shadow-[0_16px_30px_rgba(249,115,22,0.18)]' : 'text-gray-600 hover:bg-[rgba(249,115,22,0.08)]',
            blue: isActive ? 'bg-[linear-gradient(135deg,#171311,#4f7cff)] text-white shadow-[0_16px_30px_rgba(79,124,255,0.18)]' : 'text-gray-600 hover:bg-[rgba(79,124,255,0.08)]',
            emerald: isActive ? 'bg-[linear-gradient(135deg,#171311,#10b981)] text-white shadow-[0_16px_30px_rgba(16,185,129,0.18)]' : 'text-gray-600 hover:bg-[rgba(16,185,129,0.08)]',
            violet: isActive ? 'bg-[linear-gradient(135deg,#171311,#7c3aed)] text-white shadow-[0_16px_30px_rgba(124,58,237,0.18)]' : 'text-gray-600 hover:bg-[rgba(124,58,237,0.08)]',
            cyan: isActive ? 'bg-[linear-gradient(135deg,#171311,#06b6d4)] text-white shadow-[0_16px_30px_rgba(6,182,212,0.18)]' : 'text-gray-600 hover:bg-[rgba(6,182,212,0.08)]',
            pink: isActive ? 'bg-[linear-gradient(135deg,#171311,#ff385c)] text-white shadow-[0_16px_30px_rgba(255,56,92,0.18)]' : 'text-gray-600 hover:bg-[rgba(255,56,92,0.08)]',
            amber: isActive ? 'bg-[linear-gradient(135deg,#171311,#f59e0b)] text-white shadow-[0_16px_30px_rgba(245,158,11,0.18)]' : 'text-gray-600 hover:bg-[rgba(245,158,11,0.08)]',
        };
        return `px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border border-transparent ${colorClasses[color] || ''}`;
    };

    return (
        <div className="mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 min-w-max pb-1">
                <button
                    onClick={() => onStatusChange('all')}
                    className={`px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border border-transparent ${currentStatus === 'all'
                        ? 'bg-[linear-gradient(135deg,#171311,#2d211d)] text-white shadow-[0_16px_30px_rgba(23,19,17,0.16)]'
                        : 'text-gray-600 hover:bg-white/70'
                        }`}
                >
                    Tous
                    <span className="ml-1.5 sm:ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs">{counts.all}</span>
                </button>
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => onStatusChange(tab.id)} className={getTabClasses(tab.id, tab.color)}>
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="inline sm:hidden">{tab.label.length > 6 ? tab.label.substring(0, 5) + '.' : tab.label}</span>
                        <span className={`ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${currentStatus === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
