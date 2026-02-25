import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Phone, MessageCircle, UserPlus,
    Calendar, Flame, ThermometerSun, Snowflake, RefreshCw, Search
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal, SearchInput, TabBar, EmptyState } from '../../components/ui';
import { formatDate, timeAgo, clsx } from '../../utils';
import { Inquiry, InquiryStatus, InterestLevel, PipelineStage } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { inquiryApi, packageApi } from '../../lib/api';

const STAGES: { id: PipelineStage; label: string; color: string; bg: string }[] = [
    { id: 'new_lead', label: 'New Lead', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
    { id: 'contacted', label: 'Contacted', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { id: 'demo_scheduled', label: 'Demo Scheduled', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    { id: 'negotiation', label: 'Negotiation', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { id: 'won', label: 'Won', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { id: 'lost', label: 'Lost', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
];

const stageToStatus = (stage: PipelineStage): InquiryStatus => {
    const map: Record<PipelineStage, InquiryStatus> = {
        new_lead: 'new', contacted: 'contacted', demo_scheduled: 'follow-up',
        negotiation: 'follow-up', won: 'converted', lost: 'lost'
    };
    return map[stage];
};

const InterestIcon = ({ level }: { level: InterestLevel }) => {
    if (level === 'hot') return <Flame className="w-3.5 h-3.5 text-orange-500" />;
    if (level === 'warm') return <ThermometerSun className="w-3.5 h-3.5 text-amber-500" />;
    return <Snowflake className="w-3.5 h-3.5 text-sky-500" />;
};

const EMPTY_FORM = {
    full_name: '', phone: '', email: '', source: 'walk-in',
    interest_level: 'warm', interested_package: '', notes: '', follow_up_date: ''
};

export const InquiriesPage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [view, setView] = useState<'kanban' | 'list'>('kanban');
    const [search, setSearch] = useState('');
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        packageApi.getAll().then(res => setPackages(res.data?.data || res.data || [])).catch(() => { });
    }, []);

    const fetchInquiries = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = { limit: '200' };
            if (search) params.search = search;
            const res = await inquiryApi.getAll(params);
            setInquiries(res.data?.data || res.data || []);
        } catch { toastError('Error', 'Failed to load inquiries'); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => {
        const t = setTimeout(fetchInquiries, 300);
        return () => clearTimeout(t);
    }, [fetchInquiries]);

    const filtered = inquiries.filter(i =>
        !search ||
        i.full_name.toLowerCase().includes(search.toLowerCase()) ||
        i.phone.includes(search) ||
        (i.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const byStage = (stage: PipelineStage) => filtered.filter(i => i.pipeline_stage === stage);

    const handleStatusChange = async (inqId: string, newStage: PipelineStage) => {
        // Optimistic update
        setInquiries(prev => prev.map(i =>
            i.id === inqId ? { ...i, pipeline_stage: newStage, status: stageToStatus(newStage) } : i
        ));
        try {
            await inquiryApi.updateStatus(inqId, { pipeline_stage: newStage, status: stageToStatus(newStage) });
        } catch {
            toastError('Error', 'Failed to update stage');
            fetchInquiries(); // revert
        }
    };

    const handleAddInquiry = async () => {
        if (!form.full_name || !form.phone) return;
        try {
            setSaving(true);
            await inquiryApi.create({
                full_name: form.full_name, phone: form.phone, email: form.email,
                source: form.source, interest_level: form.interest_level,
                interested_package: form.interested_package, notes: form.notes,
                follow_up_date: form.follow_up_date || null,
                pipeline_stage: 'new_lead', status: 'new',
            });
            setShowAdd(false);
            setForm(EMPTY_FORM);
            success('Inquiry Added', `${form.full_name} has been added as a new lead.`);
            fetchInquiries();
        } catch (err: any) {
            toastError('Error', err?.response?.data?.error || 'Failed to add inquiry');
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inquiries & Leads</h1>
                    <p className="text-gray-500 text-sm">{inquiries.length} total leads · {inquiries.filter(i => i.pipeline_stage === 'won').length} converted</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchInquiries} className="btn-ghost btn-md">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowAdd(true)} className="btn-primary btn-md">
                        <Plus className="w-4 h-4" /> New Inquiry
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone..." className="flex-1 min-w-48 max-w-xs" />
                <TabBar
                    tabs={[{ id: 'kanban', label: 'Kanban' }, { id: 'list', label: 'List' }]}
                    activeTab={view}
                    onChange={(t: any) => setView(t)}
                />
                <div className="ml-auto text-sm text-gray-500">
                    Pipeline Value: <strong className="text-gray-900">₹{inquiries.reduce((s, i) => s + (i.pipeline_value || 0), 0).toLocaleString()}</strong>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading inquiries…</p>
                </div>
            ) : (
                <>
                    {/* Kanban View */}
                    {view === 'kanban' && (
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {STAGES.map(stage => {
                                const cards = byStage(stage.id);
                                return (
                                    <div key={stage.id} className={clsx('flex-shrink-0 w-64 rounded-xl border p-3', stage.bg)}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className={clsx('text-xs font-bold uppercase tracking-wide', stage.color)}>{stage.label}</h3>
                                            <span className={clsx('text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-sm', stage.color)}>
                                                {cards.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {cards.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No leads</p>}
                                            {cards.map(inq => (
                                                <div key={inq.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar firstName={inq.full_name.split(' ')[0]} lastName={inq.full_name.split(' ')[1] || ''} size="xs" />
                                                            <span className="text-sm font-semibold text-gray-900 leading-tight">{inq.full_name}</span>
                                                        </div>
                                                        <InterestIcon level={inq.interest_level} />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mb-2">{inq.phone}</p>
                                                    {inq.interested_package && (
                                                        <p className="text-xs text-primary-600 font-medium bg-primary-50 rounded px-2 py-0.5 mb-2 inline-block">
                                                            {inq.interested_package}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant={inq.interest_level}>{inq.interest_level}</Badge>
                                                        <select
                                                            className="text-xs border border-gray-200 rounded-lg px-1.5 py-0.5 text-gray-600 cursor-pointer bg-white"
                                                            value={inq.pipeline_stage}
                                                            onChange={e => handleStatusChange(inq.id, e.target.value as PipelineStage)}
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                        </select>
                                                    </div>
                                                    {inq.follow_up_date && (
                                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Follow up: {formatDate(inq.follow_up_date)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* List View */}
                    {view === 'list' && (
                        <div className="card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        {['Name', 'Phone', 'Source', 'Interest', 'Package', 'Stage', 'Follow-up', 'Actions'].map(h => (
                                            <th key={h} className="table-header text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(inq => (
                                        <tr key={inq.id} className="table-row">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar firstName={inq.full_name.split(' ')[0]} lastName={inq.full_name.split(' ')[1] || ''} size="sm" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{inq.full_name}</p>
                                                        <p className="text-xs text-gray-400">{timeAgo(inq.created_at)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell font-mono text-sm">{inq.phone}</td>
                                            <td className="table-cell capitalize">{inq.source.replace('-', ' ')}</td>
                                            <td className="table-cell"><Badge variant={inq.interest_level} dot>{inq.interest_level}</Badge></td>
                                            <td className="table-cell text-xs">{inq.interested_package || '—'}</td>
                                            <td className="table-cell">
                                                <select
                                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white"
                                                    value={inq.pipeline_stage}
                                                    onChange={e => handleStatusChange(inq.id, e.target.value as PipelineStage)}
                                                >
                                                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                </select>
                                            </td>
                                            <td className="table-cell text-sm">{inq.follow_up_date ? formatDate(inq.follow_up_date) : '—'}</td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors" title="Call">
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-green-50 rounded-lg text-green-500 transition-colors" title="WhatsApp">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-500 transition-colors" title="Convert to Member">
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <EmptyState icon={<Search className="w-full h-full" />} title="No inquiries found" description="Try adjusting your search or add a new lead" />
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Add Inquiry Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Inquiry" size="md"
                footer={
                    <>
                        <button onClick={() => setShowAdd(false)} className="btn-gray btn-md">Cancel</button>
                        <button onClick={handleAddInquiry} disabled={saving || !form.full_name || !form.phone} className="btn-primary btn-md">
                            {saving ? 'Saving…' : 'Add Inquiry'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Full Name *</label>
                            <input className="input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Ravi Kumar" /></div>
                        <div><label className="label">Phone *</label>
                            <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 99999 00000" /></div>
                    </div>
                    <div><label className="label">Email</label>
                        <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ravi@email.com" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Source</label>
                            <select className="input" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                                {['walk-in', 'phone', 'website', 'social', 'referral', 'other'].map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div><label className="label">Interest Level</label>
                            <select className="input" value={form.interest_level} onChange={e => setForm(p => ({ ...p, interest_level: e.target.value }))}>
                                <option value="hot">🔥 Hot</option>
                                <option value="warm">☀️ Warm</option>
                                <option value="cold">❄️ Cold</option>
                            </select>
                        </div>
                    </div>
                    <div><label className="label">Interested Package</label>
                        <select className="input" value={form.interested_package} onChange={e => setForm(p => ({ ...p, interested_package: e.target.value }))}>
                            <option value="">Select a package</option>
                            {packages.filter(p => p.is_active).map(p => (
                                <option key={p.id} value={p.id}>{p.package_name}</option>
                            ))}
                        </select></div>
                    <div><label className="label">Follow-up Date</label>
                        <input className="input" type="date" value={form.follow_up_date} onChange={e => setForm(p => ({ ...p, follow_up_date: e.target.value }))} /></div>
                    <div><label className="label">Notes</label>
                        <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes about this inquiry..." /></div>
                </div>
            </Modal>
        </div>
    );
};
