import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, ArrowRight, Check, Dumbbell } from 'lucide-react';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">

            {/* Subtle background shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-200/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-3xl mx-auto text-center">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full border-[3px] border-gray-900 flex items-center justify-center bg-white shadow-card">
                        <span className="font-black text-gray-900 text-sm tracking-tighter">FC</span>
                    </div>
                    <div className="text-left">
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">FitCore Pro</h1>
                        <p className="text-xs text-gray-400">Gym Management System</p>
                    </div>
                </div>

                {/* Hero */}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                    Manage Your Gym,<br />
                    <span className="text-primary-500">Empower Your Members</span>
                </h2>
                <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
                    The all-in-one platform for multi-branch fitness facilities.
                    Track attendance, manage memberships, and grow your business.
                </p>

                {/* Login Cards */}
                <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-8">

                    {/* Admin Login */}
                    <div
                        onClick={() => navigate('/admin/login')}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 p-7 cursor-pointer text-left"
                    >
                        <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                            <Shield className="w-5 h-5 text-primary-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1.5">Admin / Staff Login</h3>
                        <p className="text-gray-400 text-sm mb-5">Access dashboard, manage members, payments, and analytics</p>
                        <div className="space-y-2 mb-6">
                            {['Member management', 'Payment tracking', 'Analytics & reports'].map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-gray-500">
                                    <Check className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            Admin Login <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Member Login */}
                    <div
                        onClick={() => navigate('/member/login')}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 p-7 cursor-pointer text-left"
                    >
                        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1.5">Member Login</h3>
                        <p className="text-gray-400 text-sm mb-5">View your membership, attendance history, and PT sessions</p>
                        <div className="space-y-2 mb-6">
                            {['Subscription status', 'Attendance calendar', 'PT sessions & coach'].map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-gray-500">
                                    <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            Member Login <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <p className="text-gray-400 text-xs">© 2025 FitCore Pro · Built for modern gyms</p>
            </div>
        </div>
    );
};
