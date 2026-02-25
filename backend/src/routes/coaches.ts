import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin'];

// GET /api/coaches?branch_id=&search=
router.get('/', authenticate, async (req, res) => {
    const { branch_id, search } = req.query as Record<string, string>;
    let query = supabase
        .from('coaches')
        .select('*, branches!branch_id(branch_name)')
        .order('first_name');
    if (branch_id) query = query.eq('branch_id', branch_id);
    if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map((c: any) => ({ ...c, branch_name: c.branches?.branch_name })));
});

// GET /api/coaches/:id
router.get('/:id', authenticate, async (req, res) => {
    const { data, error } = await supabase
        .from('coaches')
        .select('*, branches!branch_id(branch_name), pt_sessions(id, session_date, session_time, status, members!member_id(first_name, last_name))')
        .eq('id', req.params.id)
        .single();
    if (error) return res.status(404).json({ error: 'Coach not found' });
    return res.json(data);
});

// POST /api/coaches
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase.from('coaches').insert([req.body]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PUT /api/coaches/:id
router.put('/:id', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('coaches')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// GET /api/coaches/:id/sessions
router.get('/:id/sessions', authenticate, async (req, res) => {
    const { status } = req.query as Record<string, string>;
    let query = supabase
        .from('pt_sessions')
        .select('*, members!member_id(first_name, last_name)')
        .eq('coach_id', req.params.id)
        .order('session_date', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// POST /api/coaches/sessions — schedule a session
router.post('/sessions', authenticate, requireRole(...ADMIN_ROLES, 'coach'), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase.from('pt_sessions').insert([req.body]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PATCH /api/coaches/sessions/:id — update session status
router.patch('/sessions/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('pt_sessions')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

export default router;
