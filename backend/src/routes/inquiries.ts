import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin', 'front_desk'];

// GET /api/inquiries?status=&branch_id=&source=&page=1&limit=50
router.get('/', authenticate, async (req, res) => {
    const { status, branch_id, source, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
        .from('inquiries')
        .select('*, branches!branch_id(branch_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);
    if (branch_id) query = query.eq('branch_id', branch_id);
    if (source) query = query.eq('source', source);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: data || [], total: count });
});

// POST /api/inquiries
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('inquiries')
        .insert([{ ...req.body, status: req.body.status || 'new' }])
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PUT /api/inquiries/:id
router.put('/:id', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('inquiries')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// PATCH /api/inquiries/:id/status
router.patch('/:id/status', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { status, notes, follow_up_date } = req.body;
    const { data, error } = await supabase
        .from('inquiries')
        .update({ status, notes, follow_up_date, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// POST /api/inquiries/:id/convert — convert inquiry to member
router.post('/:id/convert', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    // Mark inquiry as converted
    await supabase
        .from('inquiries')
        .update({ status: 'converted', updated_at: new Date().toISOString() })
        .eq('id', req.params.id);

    // Return so the frontend can open add-member flow with pre-filled data
    const { data, error } = await supabase.from('inquiries').select('*').eq('id', req.params.id).single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ inquiry: data, message: 'Marked as converted. Create member in the Members module.' });
});

export default router;
