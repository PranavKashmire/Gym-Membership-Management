import React, { useState, useEffect } from 'react';
import { Plus, Star, Phone, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal, EmptyState } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils';
import { Coach, PTSession } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { coachApi, memberApi } from '../../lib/api';

export const CoachesPage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [tab, setTab] = useState<'coaches' | 'sessions'>('coaches');
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [sessions, setSessions] = useState<PTSession[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loadingCoaches, setLoadingCoaches] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        coach_id: '', member_id: '', session_date: '', session_time: '',
        duration_minutes: 60, session_type: 'strength', notes: ''
    });

    const fetchCoaches = async () => {
        try {
            setLoadingCoaches(true);
            const res = await coachApi.getAll();
            setCoaches(res.data?.data || res.data || []);
        } catch { toastError('Error', 'Failed to load coaches'); }
        finally { setLoadingCoaches(false); }
    };

    const fetchSessions = async () => {
        try {
            setLoadingSessions(true);
            // Fetch upcoming sessions for all coaches (no coach filter = all)
            const res = await coachApi.getSessions('all', 'upcoming'); // fallback
            setSessions(res.data?.data || res.data || []);
        } catch {
            // Silently fail — sessions may need coach filter
        } finally { setLoadingSessions(false); }
    };

    useEffect(() => { fetchCoaches(); }, []);
    useEffect(() => {
        memberApi.getAll({ status: 'active', limit: '200' }).then(res => {
            setMembers(res.data?.data || res.data || []);
        });
    }, []);
    useEffect(() => { if (tab === 'sessions') fetchSessions(); }, [tab]);

    const handleSchedule = async () => {
        if (!scheduleForm.coach_id || !scheduleForm.member_id || !scheduleForm.session_date) return;
        try {
            setSaving(true);
            await coachApi.createSession({
                coach_id: scheduleForm.coach_id,
                member_id: scheduleForm.member_id,
                session_date: scheduleForm.session_date,
                session_time: scheduleForm.session_time,
                duration_minutes: Number(scheduleForm.duration_minutes),
                session_type: scheduleForm.session_type,
                notes: scheduleForm.notes,
                status: 'scheduled',
            });
            success('Session Scheduled!', 'PT session has been booked successfully.');
            setShowSchedule(false);
            setScheduleForm({ coach_id: '', member_id: '', session_date: '', session_time: '', duration_minutes: 60, session_type: 'strength', notes: '' });
            if (tab === 'sessions') fetchSessions();
        } catch (err: any) {
            toastError('Error', err?.response?.data?.error || 'Failed to schedule session');
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coaches & PT Sessions</h1>
                    <p className="text-gray-500 text-sm">{coaches.length} coaches · {sessions.length} upcoming sessions</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCoaches} className="btn-ghost btn-md">
                        <RefreshCw className={`w-4 h-4 ${loadingCoaches ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowSchedule(true)} className="btn-primary btn-md">
                        <Plus className="w-4 h-4" /> Schedule Session
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(['coaches', 'sessions'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {t === 'coaches' ? '👟 Coaches' : '📅 Sessions'}
                    </button>
                ))}
            </div>

            {/* Coaches Grid */}
            {tab === 'coaches' && (
                loadingCoaches ? (
                    <div className="text-center py-16 text-gray-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {coaches.map(coach => (
                            <div key={coach.id} onClick={() => setSelectedCoach(coach)}
                                className="card card-hover p-6 cursor-pointer flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <Avatar firstName={coach.first_name} lastName={coach.last_name} size="lg" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{coach.first_name} {coach.last_name}</h3>
                                        <p className="text-sm text-primary-600 font-medium">{coach.designation}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-semibold text-gray-700">{coach.rating}</span>
                                            <span className="text-xs text-gray-400">({coach.total_reviews} reviews)</span>
                                        </div>
                                    </div>
                                    <Badge variant={coach.is_active ? 'active' : 'inactive'} dot>
                                        {coach.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {coach.specializations.slice(0, 3).map(s => (
                                        <span key={s} className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{s}</span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="font-bold text-gray-900 text-base">{coach.experience_years}y</p>
                                        <p className="text-gray-400">Experience</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="font-bold text-gray-900 text-base">{coach.active_members}</p>
                                        <p className="text-gray-400">Members</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="font-bold text-gray-900 text-base">{formatCurrency(coach.hourly_rate)}</p>
                                        <p className="text-gray-400">/hr</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{coach.phone}</span>
                                </div>
                            </div>
                        ))}
                        {coaches.length === 0 && (
                            <div className="col-span-3">
                                <EmptyState icon={<span className="text-4xl">🏋️</span>} title="No coaches found" description="Add your first coach to get started" />
                            </div>
                        )}
                    </div>
                )
            )}

            {/* Sessions Table */}
            {tab === 'sessions' && (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr>{['Date & Time', 'Member', 'Coach', 'Type', 'Duration', 'Status', 'Amount'].map(h => (
                                <th key={h} className="table-header text-left">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {sessions.map(s => (
                                <tr key={s.id} className="table-row">
                                    <td className="table-cell">
                                        <p className="text-sm font-medium text-gray-900">{formatDate(s.session_date)}</p>
                                        <p className="text-xs text-gray-400">{s.session_time}</p>
                                    </td>
                                    <td className="table-cell text-sm font-medium text-gray-900">{(s as any).member_name ?? '—'}</td>
                                    <td className="table-cell text-sm text-gray-600">{(s as any).coach_name ?? '—'}</td>
                                    <td className="table-cell capitalize text-sm">{s.notes?.split(' ')[0] ?? 'General'}</td>
                                    <td className="table-cell text-sm">{s.duration_minutes} min</td>
                                    <td className="table-cell"><Badge variant={s.status as any}>{s.status}</Badge></td>
                                    <td className="table-cell font-semibold text-gray-900">—</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loadingSessions && <div className="text-center py-8"><RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>}
                    {!loadingSessions && sessions.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No sessions scheduled</p>}
                </div>
            )}

            {/* Coach Detail Modal */}
            <Modal isOpen={!!selectedCoach} onClose={() => setSelectedCoach(null)} title="Coach Profile" size="md">
                {selectedCoach && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <Avatar firstName={selectedCoach.first_name} lastName={selectedCoach.last_name} size="xl" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedCoach.first_name} {selectedCoach.last_name}</h2>
                                <p className="text-primary-600 font-medium">{selectedCoach.designation}</p>
                                <p className="text-sm text-gray-500">{(selectedCoach as any).branch_name}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specializations</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedCoach.specializations.map(s => (
                                    <span key={s} className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Certifications</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedCoach.certifications.map(c => (
                                    <span key={typeof c === 'string' ? c : (c as any).name} className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
                                        {typeof c === 'string' ? c : `${(c as any).name} (${(c as any).org})`}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Experience', value: `${selectedCoach.experience_years} yrs` },
                                { label: 'Active Members', value: selectedCoach.active_members },
                                { label: 'Hourly Rate', value: formatCurrency(selectedCoach.hourly_rate) },
                                { label: 'Rating', value: `⭐ ${selectedCoach.rating}` },
                                { label: 'Reviews', value: selectedCoach.total_reviews },
                                { label: 'Salary', value: formatCurrency(selectedCoach.salary ?? 0) },
                            ].map(d => (
                                <div key={d.label} className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-sm font-bold text-gray-900">{d.value}</p>
                                    <p className="text-xs text-gray-400">{d.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Schedule Modal */}
            <Modal isOpen={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule PT Session" size="md"
                footer={
                    <>
                        <button onClick={() => setShowSchedule(false)} className="btn-gray btn-md">Cancel</button>
                        <button onClick={handleSchedule} disabled={saving || !scheduleForm.coach_id || !scheduleForm.member_id} className="btn-primary btn-md">
                            {saving ? 'Saving…' : 'Schedule Session'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div><label className="label">Coach</label>
                        <select className="input" value={scheduleForm.coach_id} onChange={e => setScheduleForm(p => ({ ...p, coach_id: e.target.value }))}>
                            <option value="">Select coach...</option>
                            {coaches.filter(c => c.is_active).map(c => (
                                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {formatCurrency(c.hourly_rate)}/hr</option>
                            ))}
                        </select>
                    </div>
                    <div><label className="label">Member</label>
                        <select className="input" value={scheduleForm.member_id} onChange={e => setScheduleForm(p => ({ ...p, member_id: e.target.value }))}>
                            <option value="">Select member...</option>
                            {members.slice(0, 50).map(m => (
                                <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.member_code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Date</label>
                            <input className="input" type="date" value={scheduleForm.session_date} onChange={e => setScheduleForm(p => ({ ...p, session_date: e.target.value }))} /></div>
                        <div><label className="label">Time</label>
                            <input className="input" type="time" value={scheduleForm.session_time} onChange={e => setScheduleForm(p => ({ ...p, session_time: e.target.value }))} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Duration (min)</label>
                            <input className="input" type="number" value={scheduleForm.duration_minutes} onChange={e => setScheduleForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} /></div>
                        <div><label className="label">Session Type</label>
                            <select className="input" value={scheduleForm.session_type} onChange={e => setScheduleForm(p => ({ ...p, session_type: e.target.value }))}>
                                {['strength', 'cardio', 'yoga', 'zumba', 'pilates', 'functional', 'rehabilitation', 'nutrition'].map(t => (
                                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div><label className="label">Notes</label>
                        <textarea className="input resize-none" rows={2} value={scheduleForm.notes} onChange={e => setScheduleForm(p => ({ ...p, notes: e.target.value }))} /></div>
                </div>
            </Modal>
        </div>
    );
};
