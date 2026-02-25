import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, CreditCard, AlertCircle, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal, StatCard, SearchInput, Select } from '../../components/ui';
import { formatCurrency, formatDate, clsx } from '../../utils';
import { Payment, PaymentMode } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { paymentApi, memberApi, packageApi } from '../../lib/api';

const PAYMENT_MODES = ['cash', 'upi', 'card', 'bank_transfer', 'online'];
const EMPTY_FORM = {
    member_id: '', package_id: '', amount: 0,
    payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0], notes: ''
};

export const PaymentsPage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [tab, setTab] = useState<'collect' | 'history' | 'dues'>('collect');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCollect, setShowCollect] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const fetchPayments = useCallback(async () => {
        try {
            setLoadingPayments(true);
            const params: Record<string, string> = { limit: '100' };
            if (search) params.search = search;
            if (statusFilter) params.payment_status = statusFilter;
            const [pRes, sRes] = await Promise.all([
                paymentApi.getAll(params),
                paymentApi.getSummary(),
            ]);
            setPayments(pRes.data?.data || pRes.data || []);
            setSummary(sRes.data || {});
        } catch { toastError('Error', 'Failed to load payments'); }
        finally { setLoadingPayments(false); }
    }, [search, statusFilter]);

    useEffect(() => {
        const t = setTimeout(fetchPayments, 300);
        return () => clearTimeout(t);
    }, [fetchPayments]);

    useEffect(() => {
        Promise.all([memberApi.getAll({ limit: '500' }), packageApi.getAll()]).then(([m, p]) => {
            setMembers(m.data?.data || m.data || []);
            setPackages(p.data || []);
        });
    }, []);

    const totalRevenue = summary.total_revenue || payments.filter(p => p.payment_status === 'completed').reduce((s, p) => s + p.amount, 0);
    const pendingAmount = summary.pending_amount || payments.filter(p => p.payment_status === 'pending').reduce((s, p) => s + p.amount, 0);
    const TODAY = new Date().toISOString().split('T')[0];
    const todayRevenue = payments.filter(p => p.payment_status === 'completed' && p.payment_date === TODAY).reduce((s, p) => s + p.amount, 0);
    const overdueMembers = members.filter(m => m.status === 'expired');

    const handleCollect = async () => {
        if (!form.member_id || !form.package_id) return;
        const selectedMember = members.find(m => m.id === form.member_id);
        try {
            setSaving(true);
            await paymentApi.create({
                member_id: form.member_id,
                branch_id: selectedMember?.branch_id,
                package_id: form.package_id,
                amount: Number(form.amount),
                payment_method: form.payment_method,
                payment_date: form.payment_date,
                payment_status: 'completed',
                notes: form.notes,
            });
            const mem = members.find(m => m.id === form.member_id);
            setShowCollect(false);
            setForm(EMPTY_FORM);
            success('Payment Collected! 💰', `₹${form.amount.toLocaleString()} collected from ${mem?.first_name || 'member'}.`);
            fetchPayments();
        } catch (err: any) {
            toastError('Error', err?.response?.data?.error || 'Failed to collect payment');
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments & Billing</h1>
                    <p className="text-gray-500 text-sm">{payments.filter(p => p.payment_status === 'completed').length} payments collected</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchPayments} className="btn-ghost btn-md">
                        <RefreshCw className={`w-4 h-4 ${loadingPayments ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowCollect(true)} className="btn-primary btn-md">
                        <Plus className="w-4 h-4" /> Collect Payment
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" />
                <StatCard title="Today's Collection" value={formatCurrency(todayRevenue)} icon={<CheckCircle className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" />
                <StatCard title="Pending Dues" value={formatCurrency(pendingAmount)} icon={<AlertCircle className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" />
                <StatCard title="Overdue Members" value={overdueMembers.length} icon={<CreditCard className="w-5 h-5 text-red-500" />} iconBg="bg-red-50" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(['collect', 'history', 'dues'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={clsx('px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                            tab === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                        {t === 'collect' ? '💳 Quick Collect' : t === 'history' ? '📋 History' : '⚠️ Dues'}
                    </button>
                ))}
            </div>

            {/* Quick Collect Tab */}
            {tab === 'collect' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Recent Payments</h3>
                        {loadingPayments ? (
                            <div className="text-center py-8 text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /></div>
                        ) : (
                            <div className="space-y-3">
                                {payments.slice(0, 8).map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                                            p.payment_status === 'completed' ? 'bg-emerald-100' : 'bg-amber-100')}>
                                            <CreditCard className={clsx('w-4 h-4', p.payment_status === 'completed' ? 'text-emerald-600' : 'text-amber-600')} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">{(p as any).member_name}</p>
                                            <p className="text-xs text-gray-400">{(p as any).package_name} · {formatDate(p.payment_date)} · {p.payment_method?.toUpperCase()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                                            <Badge variant={p.payment_status as any}>{p.payment_status}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {payments.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No payments yet</p>}
                            </div>
                        )}
                    </div>
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Payment Mode Breakdown</h3>
                        {['cash', 'upi', 'card', 'bank_transfer'].map(mode => {
                            const modeTotal = payments.filter(p => p.payment_method === mode && p.payment_status === 'completed').reduce((s, p) => s + p.amount, 0);
                            const pct = totalRevenue > 0 ? Math.round((modeTotal / totalRevenue) * 100) : 0;
                            return (
                                <div key={mode} className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-700 font-medium">{mode.replace('_', ' ')}</span>
                                        <span className="text-gray-500">{pct}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(modeTotal)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* History Tab */}
            {tab === 'history' && (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex gap-3">
                        <SearchInput value={search} onChange={setSearch} placeholder="Search by member or invoice..." className="flex-1 max-w-xs" />
                        <Select
                            options={[{ value: '', label: 'All Statuses' }, { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }]}
                            value={statusFilter} onChange={setStatusFilter} className="w-36"
                        />
                        <button className="btn-gray btn-sm ml-auto"><Download className="w-3.5 h-3.5" /> Export</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr>{['Invoice', 'Member', 'Package', 'Amount', 'Mode', 'Date', 'Status'].map(h => (
                                <th key={h} className="table-header text-left">{h}</th>
                            ))}</tr></thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id} className="table-row">
                                        <td className="table-cell font-mono text-xs text-gray-500">{(p as any).invoice_number}</td>
                                        <td className="table-cell font-medium text-gray-900">{(p as any).member_name}</td>
                                        <td className="table-cell text-sm text-gray-600">{(p as any).package_name}</td>
                                        <td className="table-cell font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                                        <td className="table-cell capitalize text-sm">{p.payment_method?.replace('_', ' ')}</td>
                                        <td className="table-cell text-sm">{formatDate(p.payment_date)}</td>
                                        <td className="table-cell"><Badge variant={p.payment_status as any}>{p.payment_status}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payments.length === 0 && !loadingPayments && (
                            <p className="text-center text-gray-400 text-sm py-10">No payments found</p>
                        )}
                    </div>
                </div>
            )}

            {/* Dues Tab */}
            {tab === 'dues' && (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-sm text-gray-600">{overdueMembers.length} members with expired memberships</p>
                    </div>
                    <table className="w-full">
                        <thead><tr>{['Member', 'Branch', 'Last Package', 'Status', 'Actions'].map(h => (
                            <th key={h} className="table-header text-left">{h}</th>
                        ))}</tr></thead>
                        <tbody>
                            {overdueMembers.map(m => (
                                <tr key={m.id} className="table-row">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar firstName={m.first_name} lastName={m.last_name} size="sm" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{m.first_name} {m.last_name}</p>
                                                <p className="text-xs text-gray-400">{m.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell text-sm text-gray-600">{m.branch_name}</td>
                                    <td className="table-cell text-sm">{m.package_name || '—'}</td>
                                    <td className="table-cell"><Badge variant="expired">Expired</Badge></td>
                                    <td className="table-cell">
                                        <button onClick={() => { setForm(p => ({ ...p, member_id: m.id })); setShowCollect(true); }} className="btn-primary btn-sm">
                                            Collect & Renew
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {overdueMembers.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No overdue members 🎉</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Collect Payment Modal */}
            <Modal isOpen={showCollect} onClose={() => setShowCollect(false)} title="Collect Payment" size="md"
                footer={
                    <>
                        <button onClick={() => setShowCollect(false)} className="btn-gray btn-md">Cancel</button>
                        <button onClick={handleCollect} disabled={saving || !form.member_id || !form.package_id} className="btn-primary btn-md">
                            {saving ? 'Processing…' : 'Collect Payment'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div><label className="label">Member *</label>
                        <select className="input" value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))}>
                            <option value="">Select member...</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.member_code})</option>)}
                        </select>
                    </div>
                    <div><label className="label">Package *</label>
                        <select className="input" value={form.package_id} onChange={e => {
                            const pkg = packages.find(p => p.id === e.target.value);
                            setForm(p => ({ ...p, package_id: e.target.value, amount: pkg?.discounted_price || pkg?.price || 0 }));
                        }}>
                            <option value="">Select package...</option>
                            {packages.filter(p => p.is_active).map(pkg => (
                                <option key={pkg.id} value={pkg.id}>{pkg.package_name} — {formatCurrency(pkg.discounted_price || pkg.price)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Amount (₹)</label>
                            <input className="input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
                        <div><label className="label">Payment Mode</label>
                            <select className="input" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="label">Payment Date</label>
                        <input className="input" type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} /></div>
                    <div><label className="label">Notes</label>
                        <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Receipt notes..." /></div>
                    {form.amount > 0 && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-emerald-700 font-medium">Total to Collect</span>
                            <span className="text-2xl font-bold text-emerald-800">{formatCurrency(form.amount)}</span>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
