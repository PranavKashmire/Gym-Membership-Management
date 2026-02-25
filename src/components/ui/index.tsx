import React, { useState, useRef, useEffect } from 'react';
import { clsx } from '../../utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    options, value, onChange, placeholder = 'Select...', className, disabled
}) => (
    <div className={clsx('relative', className)}>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className="input appearance-none pr-10 cursor-pointer"
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
);

// Modal
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={clsx(
                'relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col animate-fadeIn',
                sizeMap[size]
            )}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// Stats Card
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    icon: React.ReactNode;
    iconBg: string;
    onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon, iconBg, onClick }) => (
    <div
        className={clsx(
            'bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-start gap-4',
            'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
            onClick && 'cursor-pointer'
        )}
        onClick={onClick}
    >
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
            {(subtitle || trend !== undefined) && (
                <div className="flex items-center gap-1.5 mt-1">
                    {trend !== undefined && (
                        <span className={clsx(
                            'text-xs font-semibold',
                            trend >= 0 ? 'text-emerald-600' : 'text-red-500'
                        )}>
                            {trend >= 0 ? '+' : ''}{Math.abs(trend)}%
                        </span>
                    )}
                    {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
                </div>
            )}
        </div>
    </div>
);

// Empty State
interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 text-gray-300 mb-4">{icon}</div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-400 mb-4 max-w-sm">{description}</p>}
        {action}
    </div>
);

// Search Input
interface SearchInputProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Search...', className }) => (
    <div className={clsx('relative', className)}>
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="input pl-10"
        />
    </div>
);

// Tab Bar
interface TabBarProps {
    tabs: { id: string; label: string; icon?: React.ReactNode }[];
    activeTab: string;
    onChange: (tab: string) => void;
    className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onChange, className }) => (
    <div className={clsx('flex gap-1 bg-gray-100 p-1 rounded-xl', className)}>
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                )}
            >
                {tab.icon}
                {tab.label}
            </button>
        ))}
    </div>
);

// Progress Bar
interface ProgressBarProps {
    value: number; // 0-100
    color?: string;
    height?: string;
    showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value, color = 'bg-primary-500', height = 'h-2', showLabel = false
}) => (
    <div className="w-full">
        <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', height)}>
            <div
                className={clsx('h-full rounded-full transition-all duration-500', color)}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
        {showLabel && <span className="text-xs text-gray-500 mt-1">{value}%</span>}
    </div>
);
