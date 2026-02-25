import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';
import { MemberStatus } from '../types';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateStr: string, fmt = 'dd MMM yyyy'): string => {
    try {
        return format(parseISO(dateStr), fmt);
    } catch {
        return dateStr;
    }
};

export const formatDateTime = (dateStr: string): string => {
    try {
        return format(parseISO(dateStr), 'dd MMM yyyy, h:mm a');
    } catch {
        return dateStr;
    }
};

export const formatTime = (dateStr: string): string => {
    try {
        return format(parseISO(dateStr), 'h:mm a');
    } catch {
        return dateStr;
    }
};

export const formatTimeFromISO = (isoString: string): string => {
    try {
        return format(parseISO(isoString), 'h:mm a');
    } catch {
        return isoString;
    }
};

export const getDaysRemaining = (endDate: string): number => {
    return Math.max(0, differenceInDays(parseISO(endDate), new Date()));
};

export const getMemberStatus = (endDate: string, currentStatus: MemberStatus): MemberStatus => {
    if (currentStatus === 'frozen' || currentStatus === 'inactive') return currentStatus;
    const days = getDaysRemaining(endDate);
    if (days === 0) return 'expired';
    return 'active';
};

export const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
        active: 'badge-active',
        expiring: 'badge-expiring',
        expired: 'badge-expired',
        frozen: 'badge-frozen',
        inactive: 'badge-inactive',
        hot: 'badge-hot',
        warm: 'badge-warm',
        cold: 'badge-cold',
        new: 'badge-inactive',
        contacted: 'badge-frozen',
        converted: 'badge-active',
        lost: 'badge-expired',
        'follow-up': 'badge-warm',
        completed: 'badge-active',
        scheduled: 'badge-frozen',
        cancelled: 'badge-expired',
        'no-show': 'badge-expiring',
        pending: 'badge-pending',
        paid: 'badge-paid',
        failed: 'badge-failed',
        refunded: 'badge-refunded',
        sent: 'badge-frozen',
        delivered: 'badge-active',
        read: 'badge-active',
    };
    return map[status] || 'badge-inactive';
};

export const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMemberCode = (index: number): string => {
    return `FIT-${new Date().getFullYear()}-${String(index).padStart(4, '0')}`;
};

export const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${num}`;
};

export const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getAvatarColor = (name: string): string => {
    const colors = [
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-purple-500 to-violet-600',
        'from-orange-500 to-red-500',
        'from-pink-500 to-rose-600',
        'from-cyan-500 to-blue-500',
        'from-amber-500 to-orange-600',
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
};

export const timeAgo = (dateStr: string): string => {
    const date = parseISO(dateStr);
    const now = new Date();
    const diff = differenceInDays(now, date);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
    return `${Math.floor(diff / 365)} years ago`;
};

export const isDatePast = (dateStr: string) => isBefore(parseISO(dateStr), new Date());
export const isDateFuture = (dateStr: string) => isAfter(parseISO(dateStr), new Date());

export const clsx = (...classes: (string | undefined | null | false)[]): string =>
    classes.filter(Boolean).join(' ');

export const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`;
};

export const truncate = (str: string, n: number): string =>
    str.length > n ? str.substring(0, n) + '…' : str;
