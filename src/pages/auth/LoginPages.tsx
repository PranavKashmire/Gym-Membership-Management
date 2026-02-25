import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Shared layout wrapper ──────────────────────────────────── */
const AuthCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-md">
            {children}
        </div>
    </div>
);

/* ─── Admin Login ────────────────────────────────────────────── */
export const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('admin@fitcore.com');
    const [password, setPassword] = useState('Admin@1234');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password, 'admin');
        setLoading(false);
        if (result.success) navigate('/admin/dashboard');
        else setError(result.error || 'Login failed');
    };

    return (
        <AuthCard>
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-6 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Staff / Admin Login</h2>
                        <p className="text-xs text-gray-400">FitCore Pro Management</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Email Address</label>
                        <input
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@fitcore.com"
                            className="input"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input pr-11"
                                required
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary btn-lg w-full mt-2"
                    >
                        {loading ? (
                            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center mb-3">Demo credentials</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Admin', email: 'admin@fitcore.com', pass: 'Admin@1234' },
                            { label: 'Owner', email: 'owner@fitcore.com', pass: 'owner123' },
                        ].map(c => (
                            <button key={c.label} type="button"
                                onClick={() => { setEmail(c.email); setPassword(c.pass); }}
                                className="bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 text-left transition-colors"
                            >
                                <p className="text-sm font-semibold text-gray-700">{c.label}</p>
                                <p className="text-xs text-gray-400 font-mono">{c.pass}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </AuthCard>
    );
};

/* ─── Member Login ───────────────────────────────────────────── */
export const MemberLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [memberId, setMemberId] = useState('FIT-2025-0001');
    const [password, setPassword] = useState('member123');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(memberId, password, 'member');
        setLoading(false);
        if (result.success) navigate('/member/dashboard');
        else setError(result.error || 'Invalid Member ID or password');
    };

    return (
        <AuthCard>
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-6 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Member Login</h2>
                        <p className="text-xs text-gray-400">Access your fitness portal</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Member ID or Email</label>
                        <input
                            type="text"
                            value={memberId}
                            onChange={e => setMemberId(e.target.value)}
                            placeholder="FIT-2025-0001"
                            className="input font-mono"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input pr-11"
                                required
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-blue btn-lg w-full mt-2"
                    >
                        {loading ? (
                            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Demo: ID <span className="font-mono text-gray-600 font-semibold">FIT-2025-0001</span>
                        {' '} / Pass <span className="font-mono text-gray-600 font-semibold">member123</span>
                    </p>
                </div>
            </div>
        </AuthCard>
    );
};
