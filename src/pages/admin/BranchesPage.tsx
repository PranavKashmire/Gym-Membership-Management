import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Phone, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal, StatCard } from '../../components/ui';
import { formatCurrency } from '../../utils';
import { Branch } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { branchApi } from '../../lib/api';

export const BranchesPage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [form, setForm] = useState({
        branch_name: '', address: '', city: '', state: 'Maharashtra',
        pincode: '', phone: '', email: '', capacity: 100,
        manager_name: '', monthly_rent: 0, established_date: ''
    });

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const res = await branchApi.getAll();
            setBranches(res.data?.data || res.data || []);
        } catch { toastError('Error', 'Failed to load branches'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBranches(); }, []);

    const handleAdd = async () => {
        if (!form.branch_name || !form.city) return;
        try {
            setSaving(true);
            await branchApi.create({
                branch_name: form.branch_name, address: form.address,
                city: form.city, state: form.state, pincode: form.pincode,
                phone: form.phone, email: form.email, capacity: Number(form.capacity),
                manager_name: form.manager_name, monthly_rent: Number(form.monthly_rent),
                established_date: form.established_date || undefined,
            });
            setShowAdd(false);
            setForm({ branch_name: '', address: '', city: '', state: 'Maharashtra', pincode: '', phone: '', email: '', capacity: 100, manager_name: '', monthly_rent: 0, established_date: '' });
            success('Branch Added!', `${form.branch_name} has been added successfully.`);
            fetchBranches();
        } catch (err: any) {
            toastError('Error', err?.response?.data?.error || 'Failed to add branch');
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Multi-Branch Management</h1>
                    <p className="text-gray-500 text-sm">{branches.filter(b => b.is_active).length} active branches across {[...new Set(branches.map(b => b.city))].length} cities</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchBranches} className="btn-ghost btn-md"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                    <button onClick={() => setShowAdd(true)} className="btn-primary btn-md">
                        <Plus className="w-4 h-4" /> Add Branch
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Branches" value={branches.length} icon={<Building2 className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" />
                <StatCard title="Total Capacity" value={branches.reduce((s, b) => s + b.capacity, 0).toLocaleString()} icon={<Users className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" />
                <StatCard title="Total Members" value={branches.reduce((s, b) => s + b.active_members, 0).toLocaleString()} icon={<Users className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" />
                <StatCard title="Combined Revenue" value={formatCurrency(branches.reduce((s, b) => s + b.monthly_revenue, 0))} icon={<TrendingUp className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" />
            </div>

            {/* Branches Grid */}
            {loading ? (
                <div className="text-center py-16 text-gray-400"><RefreshCw className="w-8 h-8 animate-spin mx-auto" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {branches.map(b => {
                        const occupancy = b.capacity > 0 ? Math.round((b.active_members / b.capacity) * 100) : 0;
                        return (
                            <div key={b.id} onClick={() => setSelectedBranch(b)} className="card card-hover p-6 cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{b.branch_name}</h3>
                                            <p className="text-xs text-gray-400 font-mono">{b.branch_code}</p>
                                        </div>
                                    </div>
                                    <Badge variant={b.is_active ? 'active' : 'inactive'} dot>{b.is_active ? 'Active' : 'Inactive'}</Badge>
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 mb-4">
                                    <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" /><span>{b.address}, {b.city}</span></div>
                                    {b.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{b.phone}</span></div>}
                                    {b.manager_name && <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /><span>Manager: {b.manager_name}</span></div>}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                                    <div className="bg-blue-50 rounded-xl p-2.5">
                                        <p className="font-bold text-blue-800 text-base">{b.active_members}</p>
                                        <p className="text-blue-500">Members</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-2.5">
                                        <p className="font-bold text-emerald-800 text-base">{b.total_coaches}</p>
                                        <p className="text-emerald-500">Coaches</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-2.5">
                                        <p className="font-bold text-purple-800 text-base">{occupancy}%</p>
                                        <p className="text-purple-500">Occupied</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Occupancy</span><span>{b.active_members}/{b.capacity}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${occupancy > 80 ? 'bg-red-400' : occupancy > 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(100, occupancy)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(b.monthly_revenue)}<span className="text-xs font-normal text-gray-400 ml-1">this month</span></p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Branch Detail Modal */}
            <Modal isOpen={!!selectedBranch} onClose={() => setSelectedBranch(null)} title="Branch Details" size="md">
                {selectedBranch && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedBranch.branch_name}</h2>
                                <p className="text-xs text-gray-500 font-mono">{selectedBranch.branch_code}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'City', value: selectedBranch.city },
                                { label: 'State', value: selectedBranch.state },
                                { label: 'Phone', value: selectedBranch.phone || '—' },
                                { label: 'Email', value: selectedBranch.email || '—' },
                                { label: 'Capacity', value: `${selectedBranch.capacity} members` },
                                { label: 'Manager', value: selectedBranch.manager_name || '—' },
                                { label: 'Monthly Rent', value: selectedBranch.monthly_rent ? formatCurrency(selectedBranch.monthly_rent) : '—' },
                                { label: 'Monthly Revenue', value: formatCurrency(selectedBranch.monthly_revenue) },
                            ].map(d => (
                                <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400">{d.label}</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{d.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Branch Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Branch" size="md"
                footer={<>
                    <button onClick={() => setShowAdd(false)} className="btn-gray btn-md">Cancel</button>
                    <button onClick={handleAdd} disabled={!form.branch_name || !form.city || saving} className="btn-primary btn-md">
                        {saving ? 'Adding…' : 'Add Branch'}
                    </button>
                </>}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Branch Name *</label><input className="input" value={form.branch_name} onChange={e => setForm(p => ({ ...p, branch_name: e.target.value }))} placeholder="FitCore Bandra" /></div>
                        <div><label className="label">City *</label><input className="input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" /></div>
                    </div>
                    <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street address" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                        <div><label className="label">Email</label><input className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Capacity</label><input className="input" type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} /></div>
                        <div><label className="label">Monthly Rent (₹)</label><input className="input" type="number" value={form.monthly_rent} onChange={e => setForm(p => ({ ...p, monthly_rent: Number(e.target.value) }))} /></div>
                    </div>
                    <div><label className="label">Manager Name</label><input className="input" value={form.manager_name} onChange={e => setForm(p => ({ ...p, manager_name: e.target.value }))} /></div>
                </div>
            </Modal>
        </div>
    );
};
