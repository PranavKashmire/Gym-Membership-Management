import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Clock, CheckCheck, Users, Zap, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { TabBar } from '../../components/ui';
import { formatDateTime } from '../../utils';
import { useToast } from '../../components/ui/Toast';
import { whatsappApi, memberApi } from '../../lib/api';

export const WhatsAppPage: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [tab, setTab] = useState<'logs' | 'templates' | 'campaign'>('logs');
    const [logs, setLogs] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [campaignForm, setCampaignForm] = useState({
        template_id: '', audience: 'all_active', custom_message: '', schedule: 'now', schedule_time: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [logsRes, templatesRes] = await Promise.all([
                whatsappApi.getLogs(),
                whatsappApi.getTemplates(),
            ]);
            setLogs(logsRes.data?.data || logsRes.data || []);
            setTemplates(templatesRes.data?.data || templatesRes.data || []);
        } catch { /* silently fail — WhatsApp may not be configured */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        memberApi.getAll({ limit: '200' }).then(res => {
            setMembers(res.data?.data || res.data || []);
        }).catch(() => { });
    }, []);

    const deliveredCount = logs.filter(l => l.status === 'delivered' || l.status === 'read').length;
    const readCount = logs.filter(l => l.status === 'read').length;
    const readRate = logs.length > 0 ? Math.round((readCount / logs.length) * 100) : 0;

    const handleSendCampaign = async () => {
        try {
            setSending(true);
            await whatsappApi.send({
                audience: campaignForm.audience,
                template_id: campaignForm.template_id || undefined,
                custom_message: campaignForm.custom_message || undefined,
                schedule: campaignForm.schedule,
                schedule_time: campaignForm.schedule_time || undefined,
            });
            success('Campaign Queued! 🚀', 'WhatsApp messages will be sent shortly to all selected members.');
            setCampaignForm({ template_id: '', audience: 'all_active', custom_message: '', schedule: 'now', schedule_time: '' });
            fetchData();
        } catch (err: any) {
            toastError('Error', err?.response?.data?.error || 'Failed to send campaign');
        } finally { setSending(false); }
    };

    const activeMembers = members.filter(m => m.status === 'active').length;
    const expiredMembers = members.filter(m => m.status === 'expired').length;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">WhatsApp Messaging</h1>
                    <p className="text-gray-500 text-sm">Automated messages, campaigns, and communication logs</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="btn-ghost btn-md"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                    <button onClick={() => setTab('campaign')} className="btn-primary btn-md">
                        <Send className="w-4 h-4" /> Send Campaign
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Messages Sent', value: logs.length, icon: <MessageCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
                    { label: 'Delivered', value: deliveredCount, icon: <CheckCheck className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
                    { label: 'Read Rate', value: `${readRate}%`, icon: <Zap className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
                    { label: 'Active Templates', value: templates.filter(t => t.is_active).length, icon: <Users className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
                ].map(s => (
                    <div key={s.label} className="card p-5">
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                        <p className="text-xs text-gray-500">{s.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? '…' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <TabBar
                tabs={[{ id: 'logs', label: '📨 Message Logs' }, { id: 'templates', label: '📝 Templates' }, { id: 'campaign', label: '🚀 Quick Send' }]}
                activeTab={tab}
                onChange={(t: any) => setTab(t)}
            />

            {/* Logs */}
            {tab === 'logs' && (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead><tr>{['Member', 'Type', 'Message Preview', 'Status', 'Sent At'].map(h => (
                            <th key={h} className="table-header text-left">{h}</th>
                        ))}</tr></thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="table-row">
                                    <td className="table-cell font-medium text-gray-900">{log.member_name}</td>
                                    <td className="table-cell">
                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium capitalize">
                                            {(log.message_type ?? log.template_name ?? 'message').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="table-cell text-sm text-gray-500 max-w-xs truncate">{log.message_body?.substring(0, 60)}…</td>
                                    <td className="table-cell"><Badge variant={log.status as any}>{log.status}</Badge></td>
                                    <td className="table-cell text-sm text-gray-500">{formatDateTime(log.sent_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && <div className="text-center py-8"><RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>}
                    {!loading && logs.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No messages sent yet</p>}
                </div>
            )}

            {/* Templates */}
            {tab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(t => (
                        <div key={t.id} className="card p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t.template_name}</h3>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium capitalize">{(t.template_type ?? '').replace('_', ' ')}</span>
                                </div>
                                <Badge variant={t.is_active ? 'active' : 'inactive'} dot>{t.is_active ? 'Active' : 'Paused'}</Badge>
                            </div>
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                                <p className="text-sm text-gray-700">{t.message_body}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Trigger: <strong className="text-gray-600">{(t.trigger_event ?? 'manual').replace('_', ' ')}</strong></span>
                                {t.delay_hours !== undefined && <span>{t.delay_hours}h delay</span>}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Sent: <strong className="text-gray-600">{t.total_sent}</strong> · Delivered: <strong className="text-emerald-600">{t.total_delivered}</strong>
                            </div>
                        </div>
                    ))}
                    {!loading && templates.length === 0 && <p className="col-span-2 text-center py-8 text-gray-400 text-sm">No templates configured</p>}
                </div>
            )}

            {/* Quick Send */}
            {tab === 'campaign' && (
                <div className="max-w-lg">
                    <div className="card p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">Send Bulk Message</h3>
                        <div><label className="label">Audience</label>
                            <select className="input" value={campaignForm.audience} onChange={e => setCampaignForm(p => ({ ...p, audience: e.target.value }))}>
                                <option value="all_active">All Active Members ({activeMembers})</option>
                                <option value="expired">Expired Members ({expiredMembers})</option>
                                <option value="expiring_7">Expiring in 7 Days</option>
                                <option value="all">All Members ({members.length})</option>
                            </select>
                        </div>
                        <div><label className="label">Template</label>
                            <select className="input" value={campaignForm.template_id} onChange={e => setCampaignForm(p => ({ ...p, template_id: e.target.value }))}>
                                <option value="">Use custom message</option>
                                {templates.filter(t => t.is_active).map(t => (
                                    <option key={t.id} value={t.id}>{t.template_name}</option>
                                ))}
                            </select>
                        </div>
                        {!campaignForm.template_id && (
                            <div><label className="label">Custom Message</label>
                                <textarea className="input resize-none" rows={4} value={campaignForm.custom_message}
                                    onChange={e => setCampaignForm(p => ({ ...p, custom_message: e.target.value }))}
                                    placeholder="Hi {name}, this is a message from FitCore Pro..." />
                                <p className="text-xs text-gray-400 mt-1">Use {'{'} name {'}'}, {'{'} expiry_date {'}'}, {'{'} days_left {'}'} as dynamic variables.</p>
                            </div>
                        )}
                        <div><label className="label">Send</label>
                            <select className="input" value={campaignForm.schedule} onChange={e => setCampaignForm(p => ({ ...p, schedule: e.target.value }))}>
                                <option value="now">Send Now</option>
                                <option value="scheduled">Schedule for Later</option>
                            </select>
                        </div>
                        {campaignForm.schedule === 'scheduled' && (
                            <div><label className="label">Schedule Time</label>
                                <input className="input" type="datetime-local" value={campaignForm.schedule_time} onChange={e => setCampaignForm(p => ({ ...p, schedule_time: e.target.value }))} /></div>
                        )}
                        <button onClick={handleSendCampaign} disabled={sending} className="btn-primary btn-md w-full">
                            <Send className="w-4 h-4" /> {sending ? 'Sending…' : campaignForm.schedule === 'now' ? 'Send Now' : 'Schedule Campaign'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
