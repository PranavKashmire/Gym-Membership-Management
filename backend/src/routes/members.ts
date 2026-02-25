import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin', 'front_desk'];

// GET /api/members?search=&status=&branch_id=&page=1&limit=50
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    const { search, status, branch_id, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
        .from('members')
        .select(`
            *,
            branches!branch_id(branch_name),
            subscriptions!member_id(
                id, package_id, start_date, end_date, status,
                packages!package_id(package_name)
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);
    if (branch_id) query = query.eq('branch_id', branch_id);
    if (search) {
        query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,member_code.ilike.%${search}%`
        );
    }

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Compute days_remaining from active subscription
    const enriched = (data || []).map((m: any) => {
        const activeSub = m.subscriptions?.find((s: any) => s.status === 'active');
        const days_remaining = activeSub
            ? Math.max(0, Math.ceil((new Date(activeSub.end_date).getTime() - Date.now()) / 86400000))
            : 0;
        return {
            ...m,
            branch_name: m.branches?.branch_name,
            package_name: activeSub?.packages?.package_name || null,
            days_remaining,
            active_subscription: activeSub || null,
        };
    });

    return res.json({ data: enriched, total: count, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/members/:id
router.get('/:id', authenticate, async (req, res) => {
    const { data, error } = await supabase
        .from('members')
        .select(`
            *,
            branches!branch_id(branch_name),
            subscriptions(*, packages(package_name)),
            attendance_records(id, date, check_in, check_out, status)
        `)
        .eq('id', req.params.id)
        .single();
    if (error) return res.status(404).json({ error: 'Member not found' });
    return res.json(data);
});

// POST /api/members
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { subscription, ...memberData } = req.body;

    // Auto-generate member_code
    const { count } = await supabase.from('members').select('*', { count: 'exact', head: true });
    const memberCode = `FIT-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data: member, error: memberError } = await supabase
        .from('members')
        .insert([{ ...memberData, member_code: memberCode }])
        .select()
        .single();
    if (memberError) return res.status(400).json({ error: memberError.message });

    // Create subscription if provided
    if (subscription && member) {
        await supabase.from('subscriptions').insert([{
            member_id: member.id,
            package_id: subscription.package_id,
            start_date: subscription.start_date,
            end_date: subscription.end_date,
            status: 'active',
            auto_renew: false,
        }]);
        // Update member status
        await supabase.from('members').update({ status: 'active' }).eq('id', member.id);
    }

    return res.status(201).json(member);
});

// PUT /api/members/:id
router.put('/:id', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('members')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// PATCH /api/members/:id/status
router.patch('/:id/status', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const { data, error } = await supabase
        .from('members')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// GET /api/members/:id/attendance
router.get('/:id/attendance', authenticate, async (req, res) => {
    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('member_id', req.params.id)
        .order('date', { ascending: false })
        .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

export default router;
