import React, { useState } from 'react';
import { Settings, Building2, CreditCard, Bell, Shield, User, Save, Palette } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { TabBar } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const TABS = [
    { id: 'general', label: 'General' },
    { id: 'billing', label: 'Billing' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'profile', label: 'My Profile' },
];

export const SettingsPage: React.FC = () => {
    const { success } = useToast();
    const { user } = useAuth();
    const [tab, setTab] = useState('general');
    const [gymSettings, setGymSettings] = useState({
        gym_name: 'FitCore Pro', tagline: 'Empower Your Fitness Journey',
        phone: '+91 98765 43210', email: 'contact@fitcore.com',
        website: 'www.fitcore.com', address: 'Andheri West, Mumbai',
        currency: 'INR', timezone: 'Asia/Kolkata',
        late_fee: 200, grace_period_days: 3,
        auto_freeze_allowed: true, max_freeze_per_year: 2,
    });
    const [notifications, setNotifications] = useState({
        expiry_reminder_7: true, expiry_reminder_3: true, expiry_reminder_1: true,
        birthday_message: true, payment_confirmation: true, welcome_message: true,
        inquiry_follow_up: true, whatsapp_enabled: true, email_enabled: false, sms_enabled: false,
    });
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '', email: user?.email || '',
        phone: '', current_password: '', new_password: '', confirm_password: ''
    });

    const handleSave = () => success('Settings Saved!', 'Your changes have been saved successfully.');

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your gym system preferences and configuration</p>
            </div>

            <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />

            {/* General Settings */}
            {tab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary-500" /> Gym Information</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label">Gym Name</label><input className="input" value={gymSettings.gym_name} onChange={e => setGymSettings(p => ({ ...p, gym_name: e.target.value }))} /></div>
                                    <div><label className="label">Tagline</label><input className="input" value={gymSettings.tagline} onChange={e => setGymSettings(p => ({ ...p, tagline: e.target.value }))} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label">Phone</label><input className="input" value={gymSettings.phone} onChange={e => setGymSettings(p => ({ ...p, phone: e.target.value }))} /></div>
                                    <div><label className="label">Email</label><input className="input" value={gymSettings.email} onChange={e => setGymSettings(p => ({ ...p, email: e.target.value }))} /></div>
                                </div>
                                <div><label className="label">Address</label><input className="input" value={gymSettings.address} onChange={e => setGymSettings(p => ({ ...p, address: e.target.value }))} /></div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary-500" /> Billing Rules</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label">Currency</label>
                                        <select className="input" value={gymSettings.currency} onChange={e => setGymSettings(p => ({ ...p, currency: e.target.value }))}>
                                            <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
                                        </select>
                                    </div>
                                    <div><label className="label">Grace Period (days)</label>
                                        <input className="input" type="number" value={gymSettings.grace_period_days} onChange={e => setGymSettings(p => ({ ...p, grace_period_days: Number(e.target.value) }))} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label">Late Fee (₹)</label>
                                        <input className="input" type="number" value={gymSettings.late_fee} onChange={e => setGymSettings(p => ({ ...p, late_fee: Number(e.target.value) }))} />
                                    </div>
                                    <div><label className="label">Max Freezes/Year</label>
                                        <input className="input" type="number" value={gymSettings.max_freeze_per_year} onChange={e => setGymSettings(p => ({ ...p, max_freeze_per_year: Number(e.target.value) }))} />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={gymSettings.auto_freeze_allowed} onChange={e => setGymSettings(p => ({ ...p, auto_freeze_allowed: e.target.checked }))} className="w-4 h-4 text-primary-600 rounded" />
                                    <span className="text-sm text-gray-700">Allow members to self-request freezes</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Palette className="w-4 h-4 text-primary-500" /> Appearance</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center justify-between">
                                    <span>Dark Mode</span>
                                    <span className="text-xs text-gray-400">Coming soon</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Accent Color</span>
                                    <div className="flex gap-1.5">
                                        {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'].map(c => (
                                            <button key={c} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">System Info</h3>
                            <div className="space-y-2 text-sm">
                                {[['Version', 'FitCore Pro v1.0'], ['Build', '2025.02.24'], ['Database', 'PostgreSQL 15'], ['Region', 'Asia/Kolkata']].map(([k, v]) => (
                                    <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-medium text-gray-700">{v}</span></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
                <div className="max-w-2xl space-y-5">
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-primary-500" /> WhatsApp / SMS Triggers</h3>
                        <div className="space-y-4">
                            {[
                                { key: 'welcome_message', label: 'Welcome Message', desc: 'Sent when a new member registers' },
                                { key: 'payment_confirmation', label: 'Payment Confirmation', desc: 'After successful payment' },
                                { key: 'expiry_reminder_7', label: 'Expiry Reminder (7 days)', desc: '7 days before membership expires' },
                                { key: 'expiry_reminder_3', label: 'Expiry Reminder (3 days)', desc: '3 days before membership expires' },
                                { key: 'expiry_reminder_1', label: 'Expiry Reminder (1 day)', desc: 'Day before membership expires' },
                                { key: 'birthday_message', label: 'Birthday Message', desc: 'Sent on member\'s birthday' },
                                { key: 'inquiry_follow_up', label: 'Inquiry Follow-up', desc: 'Auto follow-up for new leads' },
                            ].map(n => (
                                <label key={n.key} className="flex items-start gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={(notifications as any)[n.key]}
                                        onChange={e => setNotifications(p => ({ ...p, [n.key]: e.target.checked }))}
                                        className="w-4 h-4 mt-0.5 text-primary-600 rounded" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{n.label}</p>
                                        <p className="text-xs text-gray-400">{n.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Channels</h3>
                        <div className="space-y-3">
                            {[
                                { key: 'whatsapp_enabled', label: '💬 WhatsApp', desc: 'Via WhatsApp Business API' },
                                { key: 'email_enabled', label: '📧 Email', desc: 'Via SMTP / SendGrid' },
                                { key: 'sms_enabled', label: '📱 SMS', desc: 'Via Twilio (additional charges)' },
                            ].map(c => (
                                <label key={c.key} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{c.label}</p>
                                        <p className="text-xs text-gray-400">{c.desc}</p>
                                    </div>
                                    <input type="checkbox" checked={(notifications as any)[c.key]}
                                        onChange={e => setNotifications(p => ({ ...p, [c.key]: e.target.checked }))}
                                        className="w-4 h-4 text-primary-600 rounded" />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile */}
            {tab === 'profile' && (
                <div className="max-w-lg space-y-5">
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary-500" /> My Profile</h3>
                        <div className="space-y-4">
                            <div><label className="label">Full Name</label><input className="input" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} /></div>
                            <div><label className="label">Email</label><input className="input" type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} /></div>
                            <div><label className="label">Phone</label><input className="input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} /></div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-500" /> Change Password</h3>
                        <div className="space-y-4">
                            <div><label className="label">Current Password</label><input className="input" type="password" value={profileForm.current_password} onChange={e => setProfileForm(p => ({ ...p, current_password: e.target.value }))} /></div>
                            <div><label className="label">New Password</label><input className="input" type="password" value={profileForm.new_password} onChange={e => setProfileForm(p => ({ ...p, new_password: e.target.value }))} /></div>
                            <div><label className="label">Confirm New Password</label><input className="input" type="password" value={profileForm.confirm_password} onChange={e => setProfileForm(p => ({ ...p, confirm_password: e.target.value }))} /></div>
                        </div>
                    </div>
                </div>
            )}

            {tab !== 'security' && (
                <div className="flex justify-end pt-2">
                    <button onClick={handleSave} className="btn-primary btn-md">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};
