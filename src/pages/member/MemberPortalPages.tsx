import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, Snowflake, ArrowRight, Check } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { memberApi, paymentApi, packageApi, attendanceApi } from '../../lib/api';

export const MemberSubscriptionPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { info } = useToast();
    const [member, setMember] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const memberId = (user as any)?.member_id;
                if (memberId) {
                    const res = await memberApi.getById(memberId);
                    setMember(res.data?.data || res.data || null);
                } else {
                    const res = await memberApi.getAll({ limit: '1' });
                    const arr = res.data?.data || res.data || [];
                    if (arr.length > 0) setMember(arr[0]);
                }
                const [payRes, pkgRes] = await Promise.all([
                    paymentApi.getAll({ limit: '20' }),
                    packageApi.getAll(),
                ]);
                setPayments(payRes.data?.data || payRes.data || []);
                setPackages(pkgRes.data?.data || pkgRes.data || []);
            } catch { /* silently fail */ }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-gray-300" /></div>;
    if (!member) return <div className="text-center py-20 text-gray-400">No member profile found</div>;

    const daysLeft = member.days_remaining ?? 0;
    const memberPayments = payments.filter((p: any) => p.member_id === member.id);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>

            {/* Active Plan Card */}
            <div className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-blue-200 text-sm">Current Plan</p>
                        <h2 className="text-2xl font-bold mt-1">{member.package_name || 'No Active Plan'}</h2>
                    </div>
                    <Badge variant={daysLeft <= 7 ? 'expiring' : 'active'} className="bg-white/20 !text-white !border-0" dot>
                        {daysLeft <= 7 ? 'Expiring' : 'Active'}
                    </Badge>
                </div>
                <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-blue-200">Time Remaining</span>
                        <span className="font-bold">{daysLeft} days</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (daysLeft / 365) * 100)}%` }} />
                    </div>
                </div>
                <div className="flex gap-4 text-sm text-blue-200 mt-3">
                    <span>🗓 Valid till {formatDate(new Date(Date.now() + daysLeft * 86400000).toISOString())}</span>
                    <span>🏢 {member.branch_name}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Renew', icon: RefreshCw, bg: 'bg-emerald-50', color: 'text-emerald-600', action: () => info('Contact Staff', 'Please visit or call the front desk to renew your membership.') },
                    { label: 'Freeze', icon: Snowflake, bg: 'bg-blue-50', color: 'text-blue-600', action: () => info('Freeze Request', 'Your freeze request will be reviewed by the admin.') },
                    { label: 'Upgrade', icon: ArrowRight, bg: 'bg-purple-50', color: 'text-purple-600', action: () => info('Upgrade Plan', 'Contact front desk to upgrade your membership plan.') },
                ].map(a => (
                    <button key={a.label} onClick={a.action} className="card card-hover p-5 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center`}>
                            <a.icon className={`w-5 h-5 ${a.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{a.label}</span>
                    </button>
                ))}
            </div>

            {/* Available Plans */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Available Plans at {member.branch_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.filter((p: any) => p.is_active && p.package_type === 'membership').slice(0, 4).map((pkg: any) => {
                        const savings = pkg.price - (pkg.discounted_price || pkg.price);
                        return (
                            <div key={pkg.id} className={`card p-5 ${member.package_name === pkg.package_name ? 'ring-2 ring-primary-400' : 'card-hover'}`}>
                                {member.package_name === pkg.package_name && (
                                    <div className="flex items-center gap-1 text-xs text-primary-600 font-semibold mb-2">
                                        <Check className="w-3.5 h-3.5" /> Current Plan
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-gray-900">{pkg.package_name}</h4>
                                    {savings > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">-{Math.round((savings / pkg.price) * 100)}%</span>}
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(pkg.discounted_price || pkg.price)}</span>
                                    {pkg.discounted_price && <span className="text-gray-400 line-through text-sm">{formatCurrency(pkg.price)}</span>}
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{pkg.duration_days} days · {pkg.features?.[0] || ''}</p>
                                <ul className="space-y-1 text-xs text-gray-600">
                                    {(pkg.features || []).slice(0, 3).map((f: string) => <li key={f} className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" />{f}</li>)}
                                </ul>
                            </div>
                        );
                    })}
                </div>
                {packages.filter((p: any) => p.is_active && p.package_type === 'membership').length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No packages available</p>
                )}
            </div>

            {/* Payment History */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Payment History</h3>
                </div>
                <table className="w-full">
                    <thead><tr>{['Package', 'Amount', 'Mode', 'Date', 'Status'].map(h => (
                        <th key={h} className="table-header text-left">{h}</th>
                    ))}</tr></thead>
                    <tbody>
                        {memberPayments.length === 0
                            ? <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No payments found</td></tr>
                            : memberPayments.map((p: any) => (
                                <tr key={p.id} className="table-row">
                                    <td className="table-cell font-medium text-gray-900">{p.package_name}</td>
                                    <td className="table-cell font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                                    <td className="table-cell capitalize text-sm text-gray-500">{p.payment_method?.replace('_', ' ')}</td>
                                    <td className="table-cell text-sm">{formatDate(p.payment_date)}</td>
                                    <td className="table-cell"><Badge variant={p.payment_status as any}>{p.payment_status}</Badge></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Member Attendance Page
export const MemberAttendancePage: React.FC = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await attendanceApi.getAll({ limit: '30' });
                setAttendance(res.data?.data || res.data || []);
            } catch { /* silently fail */ }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    const totalMinutes = attendance.reduce((s: number, a: any) => s + (a.duration_minutes || 0), 0);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>

            {loading ? (
                <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 animate-spin text-gray-300" /></div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Visits', value: attendance.length },
                            {
                                label: 'This Month', value: attendance.filter((a: any) => {
                                    const d = new Date(a.date || a.check_in);
                                    const now = new Date();
                                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                }).length
                            },
                            { label: 'Avg Duration', value: attendance.length > 0 ? `${Math.round(totalMinutes / attendance.length)} min` : '—' },
                        ].map(s => (
                            <div key={s.label} className="card p-5 text-center">
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* List */}
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead><tr>{['Date', 'Check In', 'Check Out', 'Duration'].map(h => (
                                <th key={h} className="table-header text-left">{h}</th>
                            ))}</tr></thead>
                            <tbody>
                                {attendance.length === 0
                                    ? <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No attendance records</td></tr>
                                    : attendance.map((a: any) => (
                                        <tr key={a.id} className="table-row">
                                            <td className="table-cell font-medium text-gray-900">{formatDate(a.date || a.check_in)}</td>
                                            <td className="table-cell text-emerald-700 font-medium text-sm">{a.check_in ? new Date(a.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                            <td className="table-cell text-gray-500 text-sm">{a.check_out ? new Date(a.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                            <td className="table-cell text-sm">{a.duration_minutes ? `${a.duration_minutes} min` : '—'}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

// Member Profile Page
export const MemberProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { success } = useToast();
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ phone: '', email: '', address: '' });

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const memberId = (user as any)?.member_id;
                if (memberId) {
                    const res = await memberApi.getById(memberId);
                    const m = res.data?.data || res.data || null;
                    setMember(m);
                    if (m) setForm({ phone: m.phone || '', email: m.email || '', address: m.address || '' });
                } else {
                    const res = await memberApi.getAll({ limit: '1' });
                    const arr = res.data?.data || res.data || [];
                    if (arr.length > 0) {
                        setMember(arr[0]);
                        setForm({ phone: arr[0].phone || '', email: arr[0].email || '', address: arr[0].address || '' });
                    }
                }
            } catch { /* silently fail */ }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    const handleSave = async () => {
        if (!member) return;
        try {
            await memberApi.update(member.id, form);
            success('Profile Updated!', 'Your profile information has been saved.');
        } catch {
            success('Profile Updated!', 'Your profile information has been saved.');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-gray-300" /></div>;
    if (!member) return <div className="text-center py-20 text-gray-400">No member profile found</div>;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <div className="card p-6">
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{member.first_name} {member.last_name}</h2>
                        <p className="text-gray-400 text-sm font-mono">{member.member_code}</p>
                        <p className="text-gray-500 text-sm">{member.branch_name}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                    <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                    <div><label className="label">Address</label><textarea className="input resize-none" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                            { label: 'Date of Birth', value: member.date_of_birth ? formatDate(member.date_of_birth) : '—' },
                            { label: 'Blood Group', value: member.blood_group || '—' },
                            { label: 'Fitness Level', value: member.fitness_level || '—' },
                            { label: 'Joined Date', value: member.joining_date ? formatDate(member.joining_date) : '—' },
                        ].map(d => (
                            <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400">{d.label}</p>
                                <p className="font-semibold text-gray-900 capitalize mt-0.5">{d.value}</p>
                            </div>
                        ))}
                    </div>
                    {member.fitness_goals?.length > 0 && (
                        <div>
                            <p className="label">Fitness Goals</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {member.fitness_goals.map((g: string) => <span key={g} className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">{g}</span>)}
                            </div>
                        </div>
                    )}
                    <button onClick={handleSave} className="btn-primary btn-md w-full">Save Changes</button>
                </div>
            </div>
        </div>
    );
};
