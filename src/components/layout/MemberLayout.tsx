import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CreditCard, CalendarCheck, Dumbbell, User, Bell, LogOut, Plus, Clock, Grid3X3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { clsx } from '../../utils';

const MEMBER_NAV = [
    { to: '/member', icon: Home, label: 'Home' },
    { to: '/member/subscription', icon: CreditCard, label: 'Subscription' },
    { to: '/member/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/member/profile', icon: User, label: 'Profile' },
];

interface MemberLayoutProps {
    children: React.ReactNode;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const firstName = user?.name?.split(' ')[0] || '';
    const lastName = user?.name?.split(' ')[1] || '';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* ── Top Navbar ─────────────────────────────── */}
            <header className="h-14 bg-white shadow-navbar flex items-center gap-3 px-4 sticky top-0 z-30 border-b border-gray-100">
                {/* Logo */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <span className="font-black text-gray-900 text-[10px] tracking-tighter">FC</span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="font-bold text-gray-900 text-sm leading-tight">FitCore Pro</p>
                        <p className="text-[10px] text-gray-400 leading-none">Member Portal</p>
                    </div>
                </div>

                <div className="flex-1" />

                {/* Icon group */}
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Clock className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Grid3X3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    </button>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-2">
                    <Avatar firstName={firstName} lastName={lastName} size="sm" />
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="p-2 hover:bg-red-50 rounded-xl text-red-400 hover:text-red-600 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* ── Sidebar + Content ───────────────────────── */}
            <div className="flex flex-1">
                {/* Narrow icon sidebar */}
                <aside className="hidden md:flex flex-col bg-white border-r border-gray-100 shadow-card fixed top-14 left-0 h-[calc(100%-3.5rem)] w-[72px] z-20 py-3">
                    {MEMBER_NAV.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/member'}
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

                <main className="flex-1 md:ml-[72px] p-4 md:p-6 page-enter min-h-[calc(100vh-3.5rem)] pb-20 md:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 md:hidden z-20 shadow-card-elevated">
                {MEMBER_NAV.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/member'}
                        className={({ isActive }) => clsx(
                            'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                            isActive ? 'text-primary-600' : 'text-gray-400'
                        )}
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};
