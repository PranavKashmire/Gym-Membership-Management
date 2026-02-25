import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, TrendingUp, Calendar, Clock, Users, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { StatCard, SearchInput } from '../../components/ui';
import { formatTime, formatDate, clsx } from '../../utils';
import { AttendanceRecord } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { attendanceApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TODAY = new Date().toISOString().split('T')[0];

export const AttendancePage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const { user } = useAuth();
    const branchId = user?.branch_id || undefined;

    const [tab, setTab] = useState<'checkin' | 'log' | 'stats'>('checkin');
    const [search, setSearch] = useState('');
    const [memberIdInput, setMemberIdInput] = useState('');
    const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
    const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
    const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
    const [loadingToday, setLoadingToday] = useState(true);
    const [loadingLog, setLoadingLog] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);

    const fetchToday = useCallback(async () => {
        try {
            setLoadingToday(true);
            const res = await attendanceApi.getToday(branchId);
            setTodayRecords(res.data || []);
        } catch { } finally { setLoadingToday(false); }
    }, [branchId]);

    const fetchLog = useCallback(async () => {
        try {
            setLoadingLog(true);
            const res = await attendanceApi.getAll({ limit: '100', branch_id: branchId || '' });
            setAllRecords(res.data?.data || res.data || []);
        } catch { } finally { setLoadingLog(false); }
    }, [branchId]);

    useEffect(() => { fetchToday(); }, [fetchToday]);

    useEffect(() => {
        if (tab === 'log') fetchLog();
        if (tab === 'stats') {
            // Simple last-7-days trend from all records
            const last7 = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });
            // Refetch with no limit to get stats
            attendanceApi.getAll({ limit: '500', branch_id: branchId || '' }).then(res => {
                const records = res.data?.data || res.data || [];
                const trend = last7.map(date => ({
                    date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
                    count: records.filter((r: any) => r.date === date).length,
                }));
                setAttendanceTrend(trend);
                setAllRecords(records);
            });
        }
    }, [tab, branchId]);

    const todayCheckedIn = todayRecords.filter(r => !r.check_out).length;
    const todayTotal = todayRecords.length;

    const filteredLog = allRecords.filter(r =>
        !search ||
        (r.member_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.member_code ?? '').includes(search)
    );

    const handleCheckIn = async () => {
        const trimmed = memberIdInput.trim();
        if (!trimmed) return;
        try {
            setCheckingIn(true);
            const res = await attendanceApi.checkIn(trimmed, branchId || '');
            const { action, member_name, record } = res.data;
            if (action === 'check_out') {
                setTodayRecords(prev => prev.map(r => r.id === record.id ? { ...r, check_out: record.check_out } : r));
                success('Checked Out!', `${member_name} has checked out.`);
            } else {
                setTodayRecords(prev => [record, ...prev]);
                success('Checked In! 💪', `Welcome, ${member_name}! Have a great workout!`);
            }
            setMemberIdInput('');
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Member not found!';
            toastError('Check-in Failed', msg);
        } finally { setCheckingIn(false); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-gray-500 text-sm">Track member check-ins and attendance trends</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchToday} className="btn-ghost btn-md">
                        <RefreshCw className={`w-4 h-4 ${loadingToday ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex gap-2">
                        {(['checkin', 'log', 'stats'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={clsx('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors', tab === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                                {t === 'checkin' ? 'Check-in' : t === 'log' ? 'Log' : 'Analytics'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Currently Inside" value={todayCheckedIn} icon={<Users className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" />
                <StatCard title="Today's Total" value={todayTotal} icon={<Calendar className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" />
                <StatCard title="Checked Out" value={todayTotal - todayCheckedIn} icon={<XCircle className="w-5 h-5 text-gray-500" />} iconBg="bg-gray-50" />
                <StatCard title="Peak Hour" value="7–9 AM" icon={<Clock className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" />
            </div>

            {/* Check-in Tab */}
            {tab === 'checkin' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Check-in Form */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Check-in</h3>
                        <div className="flex gap-3">
                            <input
                                className="input flex-1"
                                value={memberIdInput}
                                onChange={e => setMemberIdInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCheckIn()}
                                placeholder="Member ID or Phone number..."
                                autoFocus
                            />
                            <button
                                onClick={handleCheckIn}
                                disabled={checkingIn || !memberIdInput.trim()}
                                className="btn-primary btn-md"
                            >
                                {checkingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {checkingIn ? '' : 'Check In'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Enter member code (FIT-2024-XXXX) or phone number · Press Enter to confirm</p>

                        {/* Live inside */}
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Currently Inside ({todayCheckedIn})</h4>
                            {loadingToday ? (
                                <div className="text-center py-6 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {todayRecords.filter(r => !r.check_out).map(r => (
                                        <div key={r.id} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <Avatar firstName={(r.member_name ?? '').split(' ')[0]} lastName={(r.member_name ?? '').split(' ')[1] || ''} size="sm" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{r.member_name}</p>
                                                <p className="text-xs text-emerald-700 font-medium">Checked in {formatTime(r.check_in ?? '')}</p>
                                            </div>
                                            <Badge variant="active" dot>In</Badge>
                                        </div>
                                    ))}
                                    {todayRecords.filter(r => !r.check_out).length === 0 && (
                                        <p className="text-sm text-gray-400 text-center py-4">No one currently checked in</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today's log */}
                    <div className="card p-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Today's Activity</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {todayRecords.map(r => (
                                <div key={r.id} className={clsx('flex items-center gap-3 p-3 rounded-xl border', r.check_out ? 'bg-gray-50 border-gray-100' : 'bg-emerald-50 border-emerald-100')}>
                                    <Avatar firstName={(r.member_name ?? '').split(' ')[0]} lastName={(r.member_name ?? '').split(' ')[1] || ''} size="sm" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{r.member_name}</p>
                                        <p className="text-xs text-gray-400">Checked in {formatTime(r.check_in ?? '')}</p>
                                    </div>
                                    {r.check_out
                                        ? <p className="text-xs text-gray-400">Out: {formatTime(r.check_out)}</p>
                                        : <Badge variant="active" dot>In</Badge>
                                    }
                                </div>
                            ))}
                            {todayRecords.length === 0 && !loadingToday && (
                                <p className="text-sm text-gray-400 text-center py-6">No check-ins yet today</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Log Tab */}
            {tab === 'log' && (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <SearchInput value={search} onChange={setSearch} placeholder="Search member..." className="max-w-xs" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    {['Member', 'Code', 'Date', 'Check-in', 'Check-out', 'Status'].map(h => (
                                        <th key={h} className="table-header text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLog.map(r => (
                                    <tr key={r.id} className="table-row">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar firstName={(r.member_name ?? '').split(' ')[0]} lastName={(r.member_name ?? '').split(' ')[1] || ''} size="sm" />
                                                <span className="font-medium text-gray-900">{r.member_name}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell font-mono text-xs text-gray-500">{r.member_code}</td>
                                        <td className="table-cell text-sm">{formatDate(r.date)}</td>
                                        <td className="table-cell text-sm text-emerald-700 font-medium">{formatTime(r.check_in ?? '')}</td>
                                        <td className="table-cell text-sm text-gray-500">{r.check_out ? formatTime(r.check_out) : '—'}</td>
                                        <td className="table-cell">
                                            <Badge variant={r.check_out ? 'inactive' : 'active'} dot>
                                                {r.check_out ? 'Completed' : 'Inside'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {loadingLog && <div className="text-center py-8"><RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>}
                        {!loadingLog && filteredLog.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No attendance records</p>}
                    </div>
                </div>
            )}

            {/* Stats Tab */}
            {tab === 'stats' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-1">Daily Check-ins</h3>
                        <p className="text-xs text-gray-400 mb-4">Last 7 days</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={attendanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Check-ins" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Total Check-ins (this week)', value: attendanceTrend.reduce((s, d) => s + d.count, 0) },
                                { label: "Today's Check-ins", value: todayTotal },
                                { label: 'Currently Inside', value: todayCheckedIn },
                                { label: 'Checked Out Today', value: todayTotal - todayCheckedIn },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">{item.label}</span>
                                    <span className="text-lg font-bold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
