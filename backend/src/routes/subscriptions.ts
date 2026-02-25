import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin', 'front_desk'];

// GET /api/subscriptions?member_id=&status=
router.get('/', authenticate, async (req, res) => {
    const { member_id, status } = req.query as Record<string, string>;
    let query = supabase
        .from('subscriptions')
        .select('*, packages(package_name, price, duration_days), members(first_name, last_name, member_code)')
        .order('created_at', { ascending: false });
    if (member_id) query = query.eq('member_id', member_id);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// POST /api/subscriptions — renew or create
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { member_id, package_id, start_date, end_date } = req.body;
    // Expire any existing active subscription
    await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('member_id', member_id)
        .eq('status', 'active');

    const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ member_id, package_id, start_date, end_date, status: 'active', auto_renew: false }])
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });

    // Keep member status active
    await supabase.from('members').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', member_id);
    return res.status(201).json(data);
});

// PATCH /api/subscriptions/:id/freeze
router.patch('/:id/freeze', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { freeze_start, freeze_end, freeze_reason } = req.body;
    const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'frozen', freeze_start, freeze_end, freeze_reason })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    await supabase.from('members').update({ status: 'frozen' }).eq('id', data.member_id);
    return res.json(data);
});

// PATCH /api/subscriptions/:id/unfreeze
router.patch('/:id/unfreeze', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', freeze_start: null, freeze_end: null })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    await supabase.from('members').update({ status: 'active' }).eq('id', data.member_id);
    return res.json(data);
});

export default router;
