import { Router } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/metrics?branch_id=
router.get('/metrics', authenticate, requireRole('owner', 'admin', 'front_desk'), async (req, res) => {
    const { branch_id } = req.query as Record<string, string>;
    const branchFilter = branch_id ? { branch_id } : {};

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const [
        { count: totalMembers },
        { count: activeMembers },
        { data: revenueData },
        { data: lastMonthRevenue },
        { count: newInquiries },
        { count: activeBranches },
        { count: totalCoaches },
        { data: expiringData },
    ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }).match(branchFilter),
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active').match(branchFilter),
        supabase.from('payments').select('amount').eq('payment_status', 'completed').gte('payment_date', monthStart).match(branchFilter),
        supabase.from('payments').select('amount').eq('payment_status', 'completed').gte('payment_date', lastMonthStart).lte('payment_date', `${lastMonthEnd}T23:59:59`).match(branchFilter),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo).match(branchFilter),
        supabase.from('branches').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('coaches').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('subscriptions').select('end_date').eq('status', 'active').lte('end_date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]),
    ]);

    const monthlyRevenue = (revenueData || []).reduce((sum: number, p: any) => sum + p.amount, 0);
    const lastRevenue = (lastMonthRevenue || []).reduce((sum: number, p: any) => sum + p.amount, 0);
    const revenueTrend = lastRevenue > 0 ? ((monthlyRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    return res.json({
        total_members: totalMembers || 0,
        total_active_members: activeMembers || 0,
        monthly_revenue: monthlyRevenue,
        revenue_trend: Math.round(revenueTrend * 10) / 10,
        new_inquiries_week: newInquiries || 0,
        active_branches: activeBranches || 0,
        total_coaches: totalCoaches || 0,
        expiring_soon: (expiringData || []).length,
        pending_payments: 0,
    });
});

// GET /api/dashboard/revenue-chart?branch_id=&months=6
router.get('/revenue-chart', authenticate, requireRole('owner', 'admin'), async (req, res) => {
    const { branch_id, months = '6' } = req.query as Record<string, string>;
    const result = [];
    for (let i = parseInt(months) - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
        let q = supabase.from('payments').select('amount').eq('payment_status', 'completed').gte('payment_date', start).lte('payment_date', `${end}T23:59:59`);
        if (branch_id) q = q.eq('branch_id', branch_id);
        const { data } = await q;
        result.push({
            month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
            revenue: (data || []).reduce((sum: number, p: any) => sum + p.amount, 0),
        });
    }
    return res.json(result);
});

// GET /api/dashboard/attendance-chart?branch_id=&days=14
router.get('/attendance-chart', authenticate, requireRole('owner', 'admin', 'front_desk'), async (req, res) => {
    const { branch_id, days = '14' } = req.query as Record<string, string>;
    const result = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const date = d.toISOString().split('T')[0];
        let q = supabase.from('attendance_records').select('*', { count: 'exact', head: true }).eq('date', date);
        if (branch_id) q = q.eq('branch_id', branch_id);
        const { count } = await q;
        result.push({ date, count: count || 0 });
    }
    return res.json(result);
});

export default router;
