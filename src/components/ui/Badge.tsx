import React from 'react';
import { clsx } from '../../utils';

type BadgeVariant =
    | 'active' | 'expiring' | 'expired' | 'frozen' | 'inactive'
    | 'hot' | 'warm' | 'cold'
    | 'pending' | 'paid' | 'failed' | 'refunded'
    | 'sent' | 'delivered' | 'read'
    | 'new' | 'contacted' | 'converted' | 'lost' | 'follow-up'
    | 'completed' | 'scheduled' | 'cancelled' | 'no-show'
    | 'info' | 'success' | 'warning' | 'error'
    /* program types (ShapeShift 360 reference) */
    | 'mg' | 'wl' | 'bt' | 'pt' | 'mr' | 'gym-visit' | 'dietician'
    /* appointment purpose tags */
    | 'visit-scheduled' | 'machine-purchase' | 'franchisee' | 'interview'
    /* follow-up round tags */
    | '1st-follow-up' | '2nd-follow-up' | '3rd-follow-up';

const variantMap: Record<BadgeVariant, string> = {
    /* membership */
    active: 'bg-emerald-100 text-emerald-700',
    expiring: 'bg-amber-100   text-amber-700',
    expired: 'bg-red-100     text-red-700',
    frozen: 'bg-blue-100    text-blue-700',
    inactive: 'bg-gray-100    text-gray-500',
    /* lead temperature */
    hot: 'bg-orange-100  text-orange-700',
    warm: 'bg-yellow-100  text-yellow-700',
    cold: 'bg-sky-100     text-sky-700',
    /* payment */
    pending: 'bg-yellow-100  text-yellow-700',
    paid: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100     text-red-700',
    refunded: 'bg-purple-100  text-purple-700',
    /* messaging */
    sent: 'bg-blue-100    text-blue-700',
    delivered: 'bg-teal-100    text-teal-700',
    read: 'bg-emerald-100 text-emerald-700',
    /* inquiry */
    new: 'bg-sky-100     text-sky-700',
    contacted: 'bg-blue-100    text-blue-700',
    converted: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100     text-red-700',
    'follow-up': 'bg-amber-100   text-amber-700',
    /* sessions */
    completed: 'bg-emerald-100 text-emerald-700',
    scheduled: 'bg-blue-100    text-blue-700',
    cancelled: 'bg-red-100     text-red-700',
    'no-show': 'bg-orange-100  text-orange-700',
    /* generics */
    info: 'bg-blue-100    text-blue-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100   text-amber-700',
    error: 'bg-red-100     text-red-700',
    /* ── Program type pills (ref style) ── */
    mg: 'bg-emerald-100 text-emerald-700 font-bold',   /* Mass Gain */
    wl: 'bg-orange-100  text-orange-700  font-bold',   /* Weight Loss */
    bt: 'bg-yellow-100  text-yellow-700  font-bold',   /* Body Toning */
    pt: 'bg-blue-100    text-blue-700    font-bold',   /* Personal Training */
    mr: 'bg-purple-100  text-purple-700  font-bold',   /* Membership Renewal */
    'gym-visit': 'bg-teal-100    text-teal-700    font-bold',
    dietician: 'bg-amber-100   text-amber-700   font-bold',
    /* appointment purposes */
    'visit-scheduled': 'bg-emerald-100 text-emerald-700',
    'machine-purchase': 'bg-amber-100   text-amber-700',
    franchisee: 'bg-orange-100  text-orange-700',
    interview: 'bg-blue-100    text-blue-700',
    /* follow-up rounds */
    '1st-follow-up': 'bg-emerald-100 text-emerald-700',
    '2nd-follow-up': 'bg-yellow-100  text-yellow-700',
    '3rd-follow-up': 'bg-red-100     text-red-700',
};

const dotMap: Partial<Record<BadgeVariant, string>> = {
    active: 'bg-emerald-500', expiring: 'bg-amber-500', expired: 'bg-red-500',
    frozen: 'bg-blue-500', inactive: 'bg-gray-400', hot: 'bg-orange-500',
    warm: 'bg-yellow-500', cold: 'bg-sky-500', pending: 'bg-yellow-500',
    paid: 'bg-emerald-500', failed: 'bg-red-500', refunded: 'bg-purple-500',
    sent: 'bg-blue-500', delivered: 'bg-teal-500', read: 'bg-emerald-500',
    new: 'bg-sky-500', contacted: 'bg-blue-500', converted: 'bg-emerald-500',
    lost: 'bg-red-500', 'follow-up': 'bg-amber-500', completed: 'bg-emerald-500',
    scheduled: 'bg-blue-500', cancelled: 'bg-red-500', 'no-show': 'bg-orange-500',
    info: 'bg-blue-500', success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-red-500',
};

interface BadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
    dot?: boolean;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, dot = false, className }) => (
    <span className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold',
        variantMap[variant] || 'bg-gray-100 text-gray-600',
        className
    )}>
        {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotMap[variant] || 'bg-gray-400')} />}
        {children}
    </span>
);
