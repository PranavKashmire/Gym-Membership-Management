import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CalendarCheck, Dumbbell, Bell, ArrowRight, TrendingUp, Clock, Trophy, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui';
import { formatDate, formatCurrency } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { memberApi, paymentApi, attendanceApi } from '../../lib/api';

export const MemberDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [member, setMember] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // Try to get member profile from member_id on user, or use first active member
                const memberId = (user as any)?.member_id;
                if (memberId) {
                    const res = await memberApi.getById(memberId);
                    setMember(res.data?.data || res.data || null);
                } else {
                    // Fallback: get list and pick first
                    const res = await memberApi.getAll({ limit: '1' });
                    const arr = res.data?.data || res.data || [];
                    if (arr.length > 0) setMember(arr[0]);
                }

                // Get payments for this member
                const payRes = await paymentApi.getAll({ limit: '5' });
                setPayments(payRes.data?.data || payRes.data || []);

                // Get recent attendance
                const attRes = await attendanceApi.getAll({ limit: '5' });
                setRecentAttendance(attRes.data?.data || attRes.data || []);
            } catch { /* silently fail */ }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-gray-300" /></div>;
    if (!member) return <div className="text-center py-20 text-gray-400">No member profile found</div>;

    const daysLeft = member.days_remaining ?? 0;

    return (
        <div className="space-y-5">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute right-8 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                <div className="relative flex items-start gap-4">
                    <Avatar firstName={member.first_name} lastName={member.last_name} size="lg" className="flex-shrink-0" />
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">Welcome back, {member.first_name}! 💪</h1>
                        <p className="text-blue-200 text-sm mt-0.5">{member.member_code} · {member.branch_name}</p>
                        <div className="flex flex-wrap gap-3 mt-3">
                            <Badge variant={member.status as any} dot className="bg-white/20 !text-white !border-0">
                                {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)} Member
                            </Badge>
                            {member.fitness_level && (
                                <Badge variant="info" className="bg-white/20 !text-white !border-0">
                                    {member.fitness_level?.charAt(0).toUpperCase() + member.fitness_level?.slice(1)}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Membership Card */}
            <div className="card p-6 border-l-4 border-primary-500">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Membership</p>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">{member.package_name || 'No Active Plan'}</h2>
                    </div>
                    <Badge variant={daysLeft <= 7 ? 'expiring' : 'active'} dot>
                        {daysLeft <= 7 ? 'Expiring Soon' : 'Active'}
                    </Badge>
                </div>
                <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-500">Time remaining</span>
                        <span className={`font-bold ${daysLeft <= 7 ? 'text-red-500' : 'text-primary-600'}`}>{daysLeft} days left</span>
                    </div>
                    <ProgressBar
                        value={100 - Math.min(100, (daysLeft / 365) * 100)}
                        color={daysLeft <= 7 ? 'bg-red-400' : 'bg-primary-500'}
                    />
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                    <span>🏋️ {member.total_visits} visits</span>
                    <span>🎯 {member.fitness_goals?.[0] || 'General Fitness'}</span>
                </div>
                {daysLeft <= 14 && (
                    <button onClick={() => navigate('/member/subscription')} className="mt-4 w-full btn-primary btn-md">
                        Renew Membership
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Visits', value: member.total_visits ?? 0, icon: <Trophy className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
                    { label: 'This Month', value: recentAttendance.length, icon: <CalendarCheck className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
                    { label: 'Days Left', value: daysLeft, icon: <Clock className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
                    { label: 'Payments', value: payments.length, icon: <Dumbbell className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
                ].map(s => (
                    <div key={s.label} className="card p-5">
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                        <p className="text-xs text-gray-500">{s.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'My Subscription', icon: CreditCard, bg: 'bg-primary-50', color: 'text-primary-600', path: '/member/subscription' },
                    { label: 'Attendance', icon: CalendarCheck, bg: 'bg-emerald-50', color: 'text-emerald-600', path: '/member/attendance' },
                    { label: 'PT Sessions', icon: Dumbbell, bg: 'bg-purple-50', color: 'text-purple-600', path: '/member/pt-sessions' },
                    { label: 'Notifications', icon: Bell, bg: 'bg-amber-50', color: 'text-amber-600', path: '/member/notifications' },
                ].map(action => (
                    <button key={action.label} onClick={() => navigate(action.path)}
                        className="card card-hover p-5 flex flex-col items-center gap-2 text-center">
                        <div className={`w-11 h-11 ${action.bg} rounded-xl flex items-center justify-center`}>
                            <action.icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Recent Attendance */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Recent Attendance</h3>
                    <button onClick={() => navigate('/member/attendance')} className="text-xs text-primary-600 font-medium flex items-center gap-1">
                        View all <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
                {recentAttendance.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No attendance records yet</p>
                ) : (
                    <div className="space-y-2">
                        {recentAttendance.map((r: any) => (
                            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{formatDate(r.date || r.check_in_time)}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {r.duration_minutes ? `${r.duration_minutes} min` : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment History preview */}
            {payments.length > 0 && (
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Payment History</h3>
                    </div>
                    <div className="space-y-3">
                        {payments.slice(0, 3).map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{p.package_name}</p>
                                    <p className="text-xs text-gray-400">{formatDate(p.payment_date)} · {p.payment_method}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                                    <Badge variant={p.payment_status as any}>{p.payment_status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
