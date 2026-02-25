import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Package, CalendarCheck, Dumbbell, CreditCard,
    BarChart3, MessageSquare, Building2, Settings, Bell, LogOut,
    Search, Menu, X, ChevronDown, Building, Plus, Clock, Grid3X3,
    UserSearch
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { Avatar } from '../ui/Avatar';
import { clsx } from '../../utils';

const NAV_ITEMS = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/inquiries', icon: UserSearch, label: 'Inquiries' },
    { to: '/admin/members', icon: Users, label: 'Members' },
    { to: '/admin/packages', icon: Package, label: 'Packages' },
    { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/admin/coaches', icon: Dumbbell, label: 'Coaches' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
    { to: '/admin/branches', icon: Building2, label: 'Branches' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const TOP_NAV = [
    { label: 'Dashboards' },
    { label: 'Pages' },
    { label: 'Apps' },
    { label: 'Help' },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const { selectedBranch, setSelectedBranch, branches } = useBranch();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [branchDropdown, setBranchDropdown] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const firstName = user?.name?.split(' ')[0] || '';
    const lastName = user?.name?.split(' ')[1] || '';

    /* ── Narrow icon sidebar ─────────────────────────── */
    const Sidebar = () => (
        <aside className="hidden md:flex flex-col bg-white border-r border-gray-100 shadow-card fixed top-14 left-0 h-[calc(100%-3.5rem)] w-[72px] z-20 py-3 overflow-y-auto">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={to === '/admin'}
                    title={label}
                    className={({ isActive }) => clsx(
                        'sidebar-item mx-2 mb-0.5',
                        isActive && 'sidebar-item-active'
                    )}
                >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
                </NavLink>
            ))}
        </aside>
    );

    /* ── Mobile sidebar ──────────────────────────────── */
    const MobileSidebar = () => (
        <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col">
                {/* Logo row */}
                <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center text-gray-900 font-black text-xs">FC</div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-tight">FitCore Pro</p>
                        <p className="text-[10px] text-gray-400">Management</p>
                    </div>
                    <button className="ml-auto p-1 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-3">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/admin'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => clsx(
                                'nav-item',
                                isActive && 'nav-item-active'
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* ── Top Navbar ─────────────────────────────── */}
            <header className="h-14 bg-white shadow-navbar flex items-center gap-3 px-4 sticky top-0 z-30 border-b border-gray-100">

                {/* Mobile menu */}
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl" onClick={() => setMobileOpen(true)}>
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {/* Logo — matches reference circle logo */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <span className="font-black text-gray-900 text-[10px] tracking-tighter">FC</span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="font-bold text-gray-900 text-sm leading-tight">FitCore Pro</p>
                        <p className="text-[10px] text-gray-400 leading-none">Management</p>
                    </div>
                </div>

                {/* Top nav tabs (desktop) */}
                <nav className="hidden lg:flex items-center gap-1 ml-4">
                    {TOP_NAV.map(({ label }) => (
                        <button
                            key={label}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors font-medium"
                        >
                            {label}
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>
                    ))}
                </nav>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search…"
                        className="w-48 lg:w-64 pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-xl focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-gray-50 transition-all"
                    />
                </div>

                {/* Icon group */}
                <div className="flex items-center gap-1">
                    {/* Clock */}
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Clock className="w-4 h-4 text-gray-500" />
                    </button>
                    {/* Grid */}
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Grid3X3 className="w-4 h-4 text-gray-500" />
                    </button>
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    </button>
                </div>

                {/* Branch selector */}
                <div className="relative hidden sm:block">
                    <button
                        onClick={() => setBranchDropdown(!branchDropdown)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-600"
                    >
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        <span className="max-w-24 truncate">
                            {selectedBranch ? selectedBranch.branch_name : 'All Branches'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {branchDropdown && (
                        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-card-elevated min-w-44 py-1.5 z-50">
                            <button
                                className={clsx('w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors', !selectedBranch && 'text-primary-600 font-semibold bg-primary-50')}
                                onClick={() => { setSelectedBranch(null); setBranchDropdown(false); }}
                            >
                                All Branches
                            </button>
                            {branches.map(b => (
                                <button
                                    key={b.id}
                                    className={clsx('w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors', selectedBranch?.id === b.id && 'text-primary-600 font-semibold bg-primary-50')}
                                    onClick={() => { setSelectedBranch(b); setBranchDropdown(false); }}
                                >
                                    {b.branch_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User avatar + Invite button */}
                <div className="relative flex items-center gap-2">
                    <button
                        onClick={() => setUserDropdown(!userDropdown)}
                        className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <Avatar firstName={firstName} lastName={lastName} size="sm" />
                    </button>
                    <button className="btn-invite hidden sm:inline-flex">
                        <Plus className="w-3.5 h-3.5" />
                        Invite
                    </button>

                    {userDropdown && (
                        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-card-elevated min-w-44 py-1.5 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Sidebar + Content ───────────────────────── */}
            <div className="flex flex-1">
                <Sidebar />
                {mobileOpen && <MobileSidebar />}

                {/* Main content area */}
                <main className="flex-1 md:ml-[72px] p-4 md:p-6 page-enter min-h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </div>

            {/* Click-outside for dropdowns */}
            {(branchDropdown || userDropdown) && (
                <div className="fixed inset-0 z-10" onClick={() => { setBranchDropdown(false); setUserDropdown(false); }} />
            )}
        </div>
    );
};
