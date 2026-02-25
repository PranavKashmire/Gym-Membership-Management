import React, { useState, useEffect } from 'react';
import { Plus, Edit, Clock, Check, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal, EmptyState } from '../../components/ui';
import { formatCurrency } from '../../utils';
import { Package as PackageType, PackageType as PkgType } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { packageApi } from '../../lib/api';

const PKG_TYPE_COLORS: Record<PkgType, string> = {
    membership: 'bg-blue-50 border-blue-200 text-blue-700',
    personal_training: 'bg-purple-50 border-purple-200 text-purple-700',
    group_class: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    combo: 'bg-orange-50 border-orange-200 text-orange-700',
};

const EMPTY_FORM = {
    package_name: '', description: '', duration_days: 30, price: 0,
    discounted_price: 0, package_type: 'membership', features: '',
    max_freezes: 1, freeze_days_allowed: 7,
};

export const PackagesPage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [packages, setPackages] = useState<PackageType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [editPkg, setEditPkg] = useState<PackageType | null>(null);
    const [filterType, setFilterType] = useState<string>('');
    const [form, setForm] = useState(EMPTY_FORM);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const res = await packageApi.getAll();
            setPackages(res.data || []);
        } catch { toastError('Error', 'Failed to load packages'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPackages(); }, []);

    // Pre-fill form when editing
    useEffect(() => {
        if (editPkg) {
            setForm({
                package_name: editPkg.package_name,
                description: editPkg.description || '',
                duration_days: editPkg.duration_days,
                price: editPkg.price,
                discounted_price: editPkg.discounted_price || 0,
                package_type: editPkg.package_type,
                features: editPkg.features?.join('\n') || '',
                max_freezes: editPkg.max_freezes || 1,
                freeze_days_allowed: editPkg.freeze_days_allowed || 7,
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [editPkg]);

    const filtered = packages.filter(p => !filterType || p.package_type === filterType);

    const handleSave = async () => {
        if (!form.package_name || !form.price) return;
        try {
            setSaving(true);
            const payload = {
                ...form,
                duration_days: Number(form.duration_days),
                price: Number(form.price),
                discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
                max_freezes: Number(form.max_freezes),
                freeze_days_allowed: Number(form.freeze_days_allowed),
                features: form.features.split('\n').filter(Boolean),
            };
            if (editPkg) {
                await packageApi.update(editPkg.id, payload);
                success('Package Updated!', `${form.package_name} has been updated.`);
            } else {
                await packageApi.create(payload);
                success('Package Created!', `${form.package_name} has been added.`);
            }
            setShowAdd(false); setEditPkg(null); setForm(EMPTY_FORM);
            fetchPackages();
        } catch (err: any) {
            toastError('Error', err?.response?.data?.error || 'Failed to save package');
        } finally { setSaving(false); }
    };

    const toggleActive = async (pkg: PackageType) => {
        try {
            await packageApi.toggle(pkg.id, !pkg.is_active);
            setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, is_active: !p.is_active } : p));
            success(pkg.is_active ? 'Deactivated' : 'Activated', `${pkg.package_name} status updated.`);
        } catch { toastError('Error', 'Failed to update status'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
                    <p className="text-gray-500 text-sm">{packages.filter(p => p.is_active).length} active packages</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchPackages} className="btn-ghost btn-md">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowAdd(true)} className="btn-primary btn-md">
                        <Plus className="w-4 h-4" /> New Package
                    </button>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['', 'membership', 'personal_training', 'group_class', 'combo'].map(t => (
                    <button key={t}
                        onClick={() => setFilterType(t)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {t === '' ? 'All' : t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="text-center py-16 text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading packages…</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(pkg => {
                        const savings = pkg.price - (pkg.discounted_price || pkg.price);
                        const savingPct = pkg.price > 0 ? Math.round((savings / pkg.price) * 100) : 0;
                        return (
                            <div key={pkg.id} className={`card card-hover p-6 flex flex-col gap-4 relative ${!pkg.is_active ? 'opacity-60' : ''}`}>
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${PKG_TYPE_COLORS[pkg.package_type]}`}>
                                            {pkg.package_type.replace('_', ' ')}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 mt-2">{pkg.package_name}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">{pkg.description}</p>
                                    </div>
                                    {savingPct > 0 && (
                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">-{savingPct}%</span>
                                    )}
                                </div>

                                {/* Pricing */}
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(pkg.discounted_price || pkg.price)}
                                    </span>
                                    {pkg.discounted_price && (
                                        <span className="text-gray-400 line-through text-sm mb-1">{formatCurrency(pkg.price)}</span>
                                    )}
                                </div>

                                {/* Meta */}
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.duration_days} days</div>
                                    <div className="flex items-center gap-1">👥 {pkg.member_count || 0} members</div>
                                    <Badge variant={pkg.is_active ? 'active' : 'inactive'} dot>{pkg.is_active ? 'Active' : 'Inactive'}</Badge>
                                </div>

                                {/* Features */}
                                {pkg.features?.length > 0 && (
                                    <ul className="space-y-1.5">
                                        {pkg.features.slice(0, 4).map(f => (
                                            <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                                                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}
                                            </li>
                                        ))}
                                        {pkg.features.length > 4 && <li className="text-xs text-gray-400">+{pkg.features.length - 4} more features</li>}
                                    </ul>
                                )}

                                {/* Freeze policy */}
                                {pkg.max_freezes > 0 && (
                                    <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">
                                        ❄️ Freeze up to {pkg.max_freezes}x · max {pkg.freeze_days_allowed} days
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-gray-100 mt-auto">
                                    <button onClick={() => setEditPkg(pkg)} className="btn-secondary btn-sm flex-1">
                                        <Edit className="w-3 h-3" /> Edit
                                    </button>
                                    <button onClick={() => toggleActive(pkg)}
                                        className={`btn-sm flex-1 ${pkg.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'btn-success'}`}>
                                        {pkg.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && !loading && (
                        <div className="col-span-3">
                            <EmptyState icon={<span className="text-4xl">📦</span>} title="No packages found" description="Create your first package to get started" />
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={showAdd || !!editPkg} onClose={() => { setShowAdd(false); setEditPkg(null); }}
                title={editPkg ? 'Edit Package' : 'New Package'}
                size="md"
                footer={
                    <>
                        <button onClick={() => { setShowAdd(false); setEditPkg(null); }} className="btn-gray btn-md">Cancel</button>
                        <button onClick={handleSave} disabled={saving || !form.package_name || !form.price} className="btn-primary btn-md">
                            {saving ? 'Saving…' : editPkg ? 'Save Changes' : 'Create Package'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div><label className="label">Package Name *</label>
                        <input className="input" value={form.package_name} onChange={e => setForm(p => ({ ...p, package_name: e.target.value }))} placeholder="Annual Elite" /></div>
                    <div><label className="label">Description</label>
                        <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Type</label>
                            <select className="input" value={form.package_type} onChange={e => setForm(p => ({ ...p, package_type: e.target.value }))}>
                                <option value="membership">Membership</option>
                                <option value="personal_training">Personal Training</option>
                                <option value="group_class">Group Class</option>
                                <option value="combo">Combo</option>
                            </select>
                        </div>
                        <div><label className="label">Duration (days) *</label>
                            <input className="input" type="number" value={form.duration_days} onChange={e => setForm(p => ({ ...p, duration_days: Number(e.target.value) }))} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Price (₹) *</label>
                            <input className="input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} /></div>
                        <div><label className="label">Discounted Price (₹)</label>
                            <input className="input" type="number" value={form.discounted_price} onChange={e => setForm(p => ({ ...p, discounted_price: Number(e.target.value) }))} /></div>
                    </div>
                    <div><label className="label">Features (one per line)</label>
                        <textarea className="input resize-none" rows={4} value={form.features}
                            onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                            placeholder={"Unlimited Gym Access\nLocker Facility\nFree WiFi"} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Max Freezes</label>
                            <input className="input" type="number" value={form.max_freezes} onChange={e => setForm(p => ({ ...p, max_freezes: Number(e.target.value) }))} /></div>
                        <div><label className="label">Freeze Days Allowed</label>
                            <input className="input" type="number" value={form.freeze_days_allowed} onChange={e => setForm(p => ({ ...p, freeze_days_allowed: Number(e.target.value) }))} /></div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
