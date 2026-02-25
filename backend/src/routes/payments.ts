import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin', 'front_desk'];

// GET /api/payments?branch_id=&member_id=&status=&page=1&limit=50
router.get('/', authenticate, async (req, res) => {
    const { branch_id, member_id, status, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
        .from('payments')
        .select('*, members!member_id(first_name, last_name), branches!branch_id(branch_name)', { count: 'exact' })
        .order('payment_date', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

    if (branch_id) query = query.eq('branch_id', branch_id);
    if (member_id) query = query.eq('member_id', member_id);
    if (status) query = query.eq('payment_status', status);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const enriched = (data || []).map((p: any) => ({
        ...p,
        member_name: p.members ? `${p.members.first_name} ${p.members.last_name}` : null,
        branch_name: p.branches?.branch_name,
    }));

    return res.json({ data: enriched, total: count });
});

// POST /api/payments — record a payment
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    // Auto-generate invoice number
    const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true });
    const invoice_number = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(5, '0')}`;

    const { data, error } = await supabase
        .from('payments')
        .insert([{ ...req.body, invoice_number, payment_date: req.body.payment_date || new Date().toISOString() }])
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PATCH /api/payments/:id/status
router.patch('/:id/status', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { payment_status } = req.body;
    const { data, error } = await supabase
        .from('payments')
        .update({ payment_status })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// GET /api/payments/summary?branch_id=&month=YYYY-MM
router.get('/summary', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
    const { branch_id, month } = req.query as Record<string, string>;
    const startDate = month ? `${month}-01` : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = month
        ? new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).toISOString().split('T')[0]
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    let query = supabase
        .from('payments')
        .select('amount, payment_status, payment_method')
        .gte('payment_date', startDate)
        .lte('payment_date', `${endDate}T23:59:59`);
    if (branch_id) query = query.eq('branch_id', branch_id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const completed = (data || []).filter(p => p.payment_status === 'completed');
    return res.json({
        total_revenue: completed.reduce((sum: number, p: any) => sum + p.amount, 0),
        total_transactions: completed.length,
        pending_amount: (data || []).filter(p => p.payment_status === 'pending').reduce((sum: number, p: any) => sum + p.amount, 0),
        by_method: completed.reduce((acc: any, p: any) => {
            acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
            return acc;
        }, {}),
    });
});

export default router;
