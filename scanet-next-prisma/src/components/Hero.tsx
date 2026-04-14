'use client';

import { ReactNode } from 'react';

interface HeroProps {
    label?: string;
    children: ReactNode;
    imageUrl: string;
    imageAlt: string;
}

export function Hero({ label, children, imageUrl, imageAlt }: HeroProps) {
    return (
        <div className="relative mb-8 overflow-hidden rounded-[2.25rem] border border-[rgba(235,227,216,0.9)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,244,239,0.92))] shadow-[0_24px_60px_rgba(58,40,28,0.12)]">
            <div className="absolute inset-y-0 right-0 w-full lg:w-[52%]">
                <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover object-center opacity-95" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,251,247,1)_0%,rgba(255,251,247,0.94)_26%,rgba(255,251,247,0.16)_72%,rgba(255,251,247,0.05)_100%)]" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_44%)]" />
            <div className="relative flex min-h-[290px] flex-col justify-between gap-10 p-6 lg:min-h-[340px] lg:p-10 xl:p-12">
                <div className="max-w-[34rem]">
                    {label && (
                        <div className="mb-4 inline-block">
                            <span className="section-kicker">
                                {label}
                            </span>
                        </div>
                    )}
                    <div className="space-y-2 lg:space-y-3">{children}</div>
                </div>

                <div className="floating-panel flex w-fit items-center gap-3 px-4 py-3 text-sm text-[var(--text-gray)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,56,92,0.1)] text-[var(--accent-brand)]">01</span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-brand-deep)]">Vue rapide</p>
                        <p className="text-sm font-medium text-[var(--text-dark)]">Suivi fluide, cartes lisibles, navigation premium.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface HeroTextProps {
    children: ReactNode;
    highlight?: boolean;
    highlightColor?: 'blue' | 'purple' | 'green' | 'orange';
}

export function HeroText({ children, highlight = false, highlightColor = 'blue' }: HeroTextProps) {
    const colorClasses = {
        blue: 'bg-[#171311] text-white',
        purple: 'bg-[linear-gradient(135deg,#ff5c7c,#d61f53)] text-white',
        green: 'bg-[linear-gradient(135deg,#1fb981,#0f8c63)] text-white',
        orange: 'bg-[linear-gradient(135deg,#ffb347,#f97316)] text-white',
    };

    if (highlight) {
        return (
            <div className="inline-block">
                <span className={`${colorClasses[highlightColor]} inline-block rounded-[1.25rem] px-4 py-2 text-2xl font-bold tracking-tight shadow-[0_20px_40px_rgba(255,56,92,0.18)] lg:text-3xl xl:text-4xl`}>
                    {children}
                </span>
            </div>
        );
    }

    return (
        <div className="inline-block">
            <span className="display-title text-[2.25rem] leading-[0.92] text-[var(--text-dark)] lg:text-[3rem] xl:text-[3.6rem]">
                {children}
            </span>
        </div>
    );
}
