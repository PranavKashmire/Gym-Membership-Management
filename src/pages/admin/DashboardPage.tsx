import React, { useState, useEffect } from 'react';
import {
    Users, TrendingUp, CreditCard, MessageCircle, Building2,
    AlertCircle, ArrowRight, Plus, RefreshCw
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { StatCard } from '../../components/ui';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatCurrency, formatDate, timeAgo } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, paymentApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 text-white rounded-xl p-3 text-xs shadow-xl border border-gray-700">
            <p className="font-semibold mb-2 text-gray-300">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.name}: {p.dataKey === 'revenue' || p.dataKey === 'expenses' ? formatCurrency(p.value) : p.value}
                </p>
            ))}
        </div>
    );
};

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const branchId = user?.branch_id || undefined;

    const [metrics, setMetrics] = useState<any>(null);
    const [revenueChart, setRevenueChart] = useState<any[]>([]);
    const [attendanceChart, setAttendanceChart] = useState<any[]>([]);
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [metricsRes, revenueRes, attendanceRes, paymentsRes] = await Promise.all([
                dashboardApi.getMetrics(branchId),
                dashboardApi.getRevenueChart({ branch_id: branchId || '', months: '12' }),
                dashboardApi.getAttendanceChart({ branch_id: branchId || '', days: '7' }),
                paymentApi.getAll({ limit: '4' }),
            ]);
            setMetrics(metricsRes.data);
            setRevenueChart(revenueRes.data);
            setAttendanceChart(attendanceRes.data);
            setRecentPayments(paymentsRes.data?.data || []);
            setLastFetched(new Date());
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-10 h-10 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3 }} />
                <p className="text-gray-400 text-sm">Loading dashboard…</p>
            </div>
        </div>
    );

    const m = metrics || {};

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-0.5">
                        Welcome back{user?.name ? `, ${user.name}` : ''}!
                        {lastFetched && <span className="ml-1 text-gray-300">· Updated {timeAgo(lastFetched.toISOString())}</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchAll} className="btn-ghost btn-md hidden md:flex">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button onClick={() => navigate('/admin/members/new')} className="btn-primary btn-md hidden md:flex">
                        <Plus className="w-4 h-4" /> Add Member
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                    title="Active Members" value={(m.total_active_members || 0).toLocaleString()}
                    subtitle={`of ${m.total_members || 0} total`} trend={m.revenue_trend}
                    icon={<Users className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50"
                    onClick={() => navigate('/admin/members')}
                />
                <StatCard
                    title="Monthly Revenue" value={formatCurrency(m.monthly_revenue || 0)}
                    subtitle="this month" trend={m.revenue_trend}
                    icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50"
                    onClick={() => navigate('/admin/payments')}
                />
                <StatCard
                    title="Pending Payments" value={formatCurrency(m.pending_payments || 0)}
                    subtitle="overdue"
                    icon={<CreditCard className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50"
                    onClick={() => navigate('/admin/payments')}
                />
                <StatCard
                    title="New Inquiries" value={m.new_inquiries_week || 0}
                    subtitle="this week"
                    icon={<MessageCircle className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50"
                    onClick={() => navigate('/admin/inquiries')}
                />
                <StatCard
                    title="Active Branches" value={m.active_branches || 0}
                    icon={<Building2 className="w-5 h-5 text-cyan-600" />} iconBg="bg-cyan-50"
                    onClick={() => navigate('/admin/branches')}
                />
                <StatCard
                    title="Expiring Soon" value={m.expiring_soon || 0}
                    subtitle="within 7 days"
                    icon={<AlertCircle className="w-5 h-5 text-red-500" />} iconBg="bg-red-50"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Revenue Trend */}
                <div className="card p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Last 12 months</p>
                        </div>
                        <Badge variant="active" dot>Live</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={revenueChart} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} dot={false} name="Revenue" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Attendance chart */}
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-1">Weekly Attendance</h3>
                    <p className="text-xs text-gray-400 mb-4">Check-ins last 7 days</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={attendanceChart} margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                                tickFormatter={d => d ? new Date(d).toLocaleDateString('en', { weekday: 'short' }) : ''} />
                            <YAxis hide />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Check-ins" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expiring Memberships placeholder */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Expiring This Week</h3>
                        <button onClick={() => navigate('/admin/members')} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 text-center py-6">
                        {m.expiring_soon > 0
                            ? `${m.expiring_soon} membership${m.expiring_soon > 1 ? 's' : ''} expiring — check Members page`
                            : 'No memberships expiring this week 🎉'}
                    </p>
                </div>

                {/* Recent Payments */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Recent Payments</h3>
                        <button onClick={() => navigate('/admin/payments')} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    {recentPayments.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No payments yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentPayments.map(p => (
                                <div key={p.id} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.payment_status === 'completed' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                        <CreditCard className={`w-4 h-4 ${p.payment_status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{p.member_name}</p>
                                        <p className="text-xs text-gray-400">{timeAgo(p.payment_date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                                        <Badge variant={p.payment_status as any}>{p.payment_status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
