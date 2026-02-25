import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Users, CreditCard, BarChart3, Download, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils';
import { dashboardApi, packageApi, branchApi } from '../../lib/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const AnalyticsPage: React.FC = () => {
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [branchComparison, setBranchComparison] = useState<any[]>([]);
    const [packageDistribution, setPackageDistribution] = useState<any[]>([]);
    const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [revRes, attRes, pkgRes, brRes, metRes] = await Promise.all([
                dashboardApi.getRevenueChart({ months: '12', branch_id: '' }),
                dashboardApi.getAttendanceChart({ days: '14', branch_id: '' }),
                packageApi.getAll(),
                branchApi.getAll(),
                dashboardApi.getMetrics(),
            ]);

            // Revenue chart
            const revArr = revRes.data?.data || revRes.data || [];
            setRevenueData(revArr);

            // Attendance trend
            const attArr = attRes.data?.data || attRes.data || [];
            setAttendanceTrend(attArr);

            // Package distribution — derive from member_count
            const pkgs = (pkgRes.data?.data || pkgRes.data || []) as any[];
            setPackageDistribution(pkgs.filter((p: any) => (p.member_count || 0) > 0).map((p: any, i: number) => ({
                name: p.package_name,
                value: p.member_count || 0,
                color: COLORS[i % COLORS.length],
            })));

            // Branch comparison
            const brs = (brRes.data?.data || brRes.data || []) as any[];
            setBranchComparison(brs.map((b: any) => ({
                branch: b.branch_name?.replace('FitCore ', '') || b.branch_name,
                members: b.active_members || 0,
                revenue_lakh: Math.round((b.monthly_revenue || 0) / 100000),
            })));

            // Metrics
            setMetrics(metRes.data?.data || metRes.data || null);
        } catch { /* dashboard-level errors handled gracefully */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const totalRevenue = metrics?.total_revenue ?? revenueData.reduce((s: number, d: any) => s + (d.revenue || 0), 0);
    const newMembers = metrics?.new_members ?? '—';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="text-gray-500 text-sm">Comprehensive business intelligence dashboard</p>
                </div>
                <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${period === p ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {p}
                        </button>
                    ))}
                    <button onClick={fetchAll} className="btn-ghost btn-sm ml-2"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /></button>
                    <button className="btn-gray btn-sm"><Download className="w-3.5 h-3.5" /> Export</button>
                </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <CreditCard className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
                    { label: 'New Members', value: String(newMembers), icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
                    { label: 'Active Members', value: String(metrics?.active_members ?? '—'), icon: <TrendingUp className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
                    { label: 'Total Branches', value: String(branchComparison.length), icon: <BarChart3 className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
                ].map(k => (
                    <div key={k.label} className="card p-5">
                        <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>{k.icon}</div>
                        <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{loading ? '…' : k.value}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400"><RefreshCw className="w-8 h-8 animate-spin mx-auto" /></div>
            ) : (
                <>
                    {/* Revenue Trend */}
                    {revenueData.length > 0 && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-1">Revenue Trend</h3>
                            <p className="text-xs text-gray-400 mb-5">Monthly revenue breakdown</p>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={revenueData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                                        tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Branch Comparison */}
                        {branchComparison.length > 0 && (
                            <div className="card p-6">
                                <h3 className="font-semibold text-gray-900 mb-1">Branch Comparison</h3>
                                <p className="text-xs text-gray-400 mb-4">Members and revenue by branch</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={branchComparison} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="branch" type="category" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} width={80} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="members" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Members" />
                                        <Bar dataKey="revenue_lakh" fill="#10B981" radius={[0, 4, 4, 0]} name="Revenue (L)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Package Distribution */}
                        {packageDistribution.length > 0 && (
                            <div className="card p-6">
                                <h3 className="font-semibold text-gray-900 mb-1">Membership Distribution</h3>
                                <p className="text-xs text-gray-400 mb-4">Members by package type</p>
                                <div className="flex items-center gap-6">
                                    <ResponsiveContainer width={180} height={180}>
                                        <PieChart>
                                            <Pie data={packageDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                                paddingAngle={3} dataKey="value">
                                                {packageDistribution.map((e: any, i: number) => (
                                                    <Cell key={i} fill={e.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex-1 space-y-2">
                                        {packageDistribution.map((p: any) => (
                                            <div key={p.name} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                                                    <span className="text-gray-600 text-xs">{p.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900">{p.value}</span>
                                                    <span className="text-xs text-gray-400 ml-1">({Math.round((p.value / packageDistribution.reduce((s: number, d: any) => s + d.value, 0)) * 100)}%)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attendance Trend */}
                    {attendanceTrend.length > 0 && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-1">Attendance Trend</h3>
                            <p className="text-xs text-gray-400 mb-5">Daily check-ins over the last 2 weeks</p>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={attendanceTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Check-ins" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Empty state for all charts */}
                    {revenueData.length === 0 && branchComparison.length === 0 && attendanceTrend.length === 0 && (
                        <div className="card p-12 text-center">
                            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-700">No Analytics Data Yet</h3>
                            <p className="text-sm text-gray-400 mt-1">Data will populate once members, payments, and attendance records are added.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
