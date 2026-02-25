import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal, SearchInput, StatCard, EmptyState, Select, ProgressBar } from '../../components/ui';
import { formatDate, formatCurrency, clsx } from '../../utils';
import { Member, MemberStatus } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { Users, UserCheck, UserX, Snowflake, UserPlus, RefreshCw } from 'lucide-react';
import { memberApi, packageApi, branchApi } from '../../lib/api';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'inactive', label: 'Inactive' },
];

const EMPTY_FORM = {
    first_name: '', last_name: '', phone: '', email: '', date_of_birth: '',
    gender: 'male', address: '', emergency_contact: '', blood_group: 'O+',
    medical_conditions: '', fitness_goals: 'Weight Loss',
    fitness_level: 'beginner', branch_id: '', package_id: '',
    start_date: new Date().toISOString().split('T')[0],
    referral_source: 'Walk-in'
};

export const MembersPage: React.FC = () => {
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(EMPTY_FORM);

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (branchFilter) params.branch_id = branchFilter;
            const res = await memberApi.getAll(params);
            setMembers(res.data?.data || res.data || []);
        } catch { toastError('Error', 'Failed to load members'); }
        finally { setLoading(false); }
    }, [search, statusFilter, branchFilter]);

    useEffect(() => {
        const t = setTimeout(fetchMembers, 300);
        return () => clearTimeout(t);
    }, [fetchMembers]);

    useEffect(() => {
        Promise.all([branchApi.getAll(), packageApi.getAll()]).then(([b, p]) => {
            setBranches(b.data || []);
            const pkgs = p.data || [];
            setPackages(pkgs);
            if (pkgs.length) setForm(f => ({ ...f, package_id: pkgs[0].id, branch_id: b.data?.[0]?.id || '' }));
        });
    }, []);

    const stats = {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        expired: members.filter(m => m.status === 'expired').length,
        frozen: members.filter(m => m.status === 'frozen').length,
    };

    const handleAddMember = async () => {
        if (!form.first_name || !form.phone || !form.branch_id || !form.package_id) return;
        try {
            setSaving(true);
            const pkg = packages.find((p: any) => p.id === form.package_id);
            const startDate = form.start_date || new Date().toISOString().split('T')[0];
            const endDate = pkg ? new Date(new Date(startDate).getTime() + pkg.duration_days * 86400000).toISOString().split('T')[0] : startDate;
            await memberApi.create({
                first_name: form.first_name, last_name: form.last_name,
                phone: form.phone, email: form.email,
                date_of_birth: form.date_of_birth || null,
                gender: form.gender, address: form.address,
                emergency_contact: form.emergency_contact,
                blood_group: form.blood_group,
                medical_conditions: form.medical_conditions,
                fitness_goals: [form.fitness_goals],
                fitness_level: form.fitness_level,
                branch_id: form.branch_id,
                referral_source: form.referral_source,
                joining_date: startDate,
                subscription: {
                    package_id: form.package_id,
                    start_date: startDate,
                    end_date: endDate,
                },
            });
            setShowAdd(false); setStep(1); setForm(EMPTY_FORM);
            success('Member Added!', `${form.first_name} ${form.last_name} registered successfully.`);
            fetchMembers();
        } catch (err: any) {
            toastError('Error', err?.response?.data?.error || 'Failed to add member');
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Members</h1>
                    <p className="text-gray-500 text-sm">{stats.total} total members registered</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchMembers} className="btn-ghost btn-md">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowAdd(true)} className="btn-primary btn-md">
                        <UserPlus className="w-4 h-4" /> Add Member
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Members" value={stats.total} icon={<Users className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" />
                <StatCard title="Active" value={stats.active} icon={<UserCheck className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" />
                <StatCard title="Expired" value={stats.expired} icon={<UserX className="w-5 h-5 text-red-500" />} iconBg="bg-red-50" />
                <StatCard title="Frozen" value={stats.frozen} icon={<Snowflake className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-50" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, ID..." className="flex-1 min-w-52 max-w-sm" />
                <Select options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses" className="w-40" />
                <Select
                    options={[{ value: '', label: 'All Branches' }, ...branches.map(b => ({ value: b.id, label: b.branch_name }))]}
                    value={branchFilter} onChange={setBranchFilter} placeholder="All Branches" className="w-44"
                />
                {loading && <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr>
                                {['Member', 'Code', 'Branch', 'Package', 'Days Left', 'Status', 'Visits', 'Actions'].map(h => (
                                    <th key={h} className="table-header text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                                <tr key={m.id} className="table-row" onClick={() => setSelectedMember(m)}>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            <Avatar firstName={m.first_name} lastName={m.last_name} size="sm" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{m.first_name} {m.last_name}</p>
                                                <p className="text-xs text-gray-400">{m.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell font-mono text-xs text-gray-600">{m.member_code}</td>
                                    <td className="table-cell text-sm text-gray-600">{(m as any).branch_name || '—'}</td>
                                    <td className="table-cell text-sm">{(m as any).package_name || '—'}</td>
                                    <td className="table-cell">
                                        {(m as any).days_remaining !== undefined ? (
                                            <div className="w-20">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className={(m as any).days_remaining <= 7 ? 'text-red-500 font-semibold' : 'text-gray-600'}>{(m as any).days_remaining}d</span>
                                                </div>
                                                <ProgressBar
                                                    value={Math.min(100, ((m as any).days_remaining / 365) * 100)}
                                                    color={(m as any).days_remaining <= 7 ? 'bg-red-400' : (m as any).days_remaining <= 30 ? 'bg-amber-400' : 'bg-emerald-500'}
                                                />
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td className="table-cell">
                                        <Badge variant={m.status as any} dot>{m.status}</Badge>
                                    </td>
                                    <td className="table-cell text-sm font-medium text-gray-700">{m.total_visits}</td>
                                    <td className="table-cell">
                                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                            <button className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-500" onClick={() => setSelectedMember(m)}>
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && members.length === 0 && (
                        <EmptyState icon={<Users className="w-full h-full" />} title="No members found" description="Try adjusting your search or add a new member" />
                    )}
                    {loading && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading members…
                        </div>
                    )}
                </div>
            </div>

            {/* Member Detail Modal */}
            <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title="Member Profile" size="lg"
                footer={
                    <div className="flex gap-2 w-full">
                        <button className="btn-gray btn-md" onClick={() => setSelectedMember(null)}>Close</button>
                        <button className="btn-primary btn-md ml-auto">Renew Subscription</button>
                    </div>
                }
            >
                {selectedMember && (
                    <div className="space-y-5">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <Avatar firstName={selectedMember.first_name} lastName={selectedMember.last_name} size="xl" />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-xl font-bold text-gray-900">{selectedMember.first_name} {selectedMember.last_name}</h2>
                                    <Badge variant={selectedMember.status as any} dot>{selectedMember.status}</Badge>
                                </div>
                                <p className="text-sm text-gray-500 font-mono mt-0.5">{selectedMember.member_code}</p>
                                <p className="text-sm text-gray-600 mt-1">{(selectedMember as any).branch_name}</p>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                    <span>📞 {selectedMember.phone}</span>
                                    {selectedMember.email && <span>✉️ {selectedMember.email}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Package', value: (selectedMember as any).package_name || '—' },
                                { label: 'Days Left', value: `${(selectedMember as any).days_remaining ?? '—'} days` },
                                { label: 'Joined', value: formatDate(selectedMember.joining_date) },
                                { label: 'Total Visits', value: String(selectedMember.total_visits) },
                                { label: 'Fitness Level', value: selectedMember.fitness_level },
                                { label: 'Blood Group', value: selectedMember.blood_group },
                            ].map(item => (
                                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        {selectedMember.fitness_goals?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fitness Goals</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMember.fitness_goals.map(g => (
                                        <span key={g} className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">{g}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedMember.medical_conditions && selectedMember.medical_conditions !== 'None' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Medical Conditions</p>
                                <p className="text-sm text-amber-800">{selectedMember.medical_conditions}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Add Member Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setStep(1); }} title={`Add Member — Step ${step} of 3`} size="lg"
                footer={
                    <div className="flex gap-2 w-full">
                        {step > 1 && <button onClick={() => setStep(s => s - 1)} className="btn-gray btn-md">Back</button>}
                        <button onClick={() => setShowAdd(false)} className="btn-gray btn-md">Cancel</button>
                        {step < 3
                            ? <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && (!form.first_name || !form.phone)} className="btn-primary btn-md ml-auto">Next →</button>
                            : <button onClick={handleAddMember} disabled={saving || !form.package_id} className="btn-primary btn-md ml-auto">
                                {saving ? 'Saving…' : 'Register Member'}
                            </button>
                        }
                    </div>
                }
            >
                <div className="flex gap-2 mb-6">
                    {['Personal Info', 'Health & Fitness', 'Membership'].map((s, i) => (
                        <div key={s} className={clsx('flex-1 h-1.5 rounded-full transition-colors', step > i ? 'bg-primary-500' : 'bg-gray-200')} />
                    ))}
                </div>
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">First Name *</label><input className="input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" /></div>
                            <div><label className="label">Last Name</label><input className="input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 99999 00000" /></div>
                            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Gender</label>
                                <select className="input" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                </select>
                            </div>
                            <div><label className="label">Date of Birth</label><input className="input" type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
                        </div>
                        <div><label className="label">Address</label><textarea className="input resize-none" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address" /></div>
                        <div><label className="label">Emergency Contact</label><input className="input" value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} placeholder="Name + phone number" /></div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Blood Group</label>
                                <select className="input" value={form.blood_group} onChange={e => setForm(p => ({ ...p, blood_group: e.target.value }))}>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
                                </select>
                            </div>
                            <div><label className="label">Fitness Level</label>
                                <select className="input" value={form.fitness_level} onChange={e => setForm(p => ({ ...p, fitness_level: e.target.value }))}>
                                    <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div><label className="label">Medical Conditions / Allergies</label><textarea className="input resize-none" rows={2} value={form.medical_conditions} onChange={e => setForm(p => ({ ...p, medical_conditions: e.target.value }))} placeholder="Any medical conditions (or None)" /></div>
                        <div><label className="label">Fitness Goals</label>
                            <select className="input" value={form.fitness_goals} onChange={e => setForm(p => ({ ...p, fitness_goals: e.target.value }))}>
                                {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness', 'Sports Performance'].map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4">
                        <div><label className="label">Branch</label>
                            <select className="input" value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Package *</label>
                            <select className="input" value={form.package_id} onChange={e => setForm(p => ({ ...p, package_id: e.target.value }))}>
                                {packages.filter(p => p.is_active).map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.package_name} — ₹{pkg.discounted_price || pkg.price} ({pkg.duration_days} days)</option>
                                ))}
                            </select>
                        </div>
                        <div><label className="label">Start Date</label><input className="input" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                        <div><label className="label">Referral Source</label>
                            <select className="input" value={form.referral_source} onChange={e => setForm(p => ({ ...p, referral_source: e.target.value }))}>
                                {['Walk-in', 'Phone Call', 'Instagram', 'Facebook', 'Google', 'Referral', 'Website', 'Other'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        {form.first_name && (
                            <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                                <p className="text-xs font-semibold text-primary-700 mb-1">📋 Summary</p>
                                <p className="text-sm text-primary-800"><strong>{form.first_name} {form.last_name}</strong> · {form.phone}</p>
                                <p className="text-sm text-primary-700">{packages.find(p => p.id === form.package_id)?.package_name} · Starting {formatDate(form.start_date)}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
