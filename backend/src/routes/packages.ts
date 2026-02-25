import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin'];

// GET /api/packages
router.get('/', authenticate, async (_req, res) => {
    const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// GET /api/packages/:id
router.get('/:id', authenticate, async (req, res) => {
    const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', req.params.id)
        .single();
    if (error) return res.status(404).json({ error: 'Package not found' });
    return res.json(data);
});

// POST /api/packages
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('packages')
        .insert([req.body])
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PUT /api/packages/:id
router.put('/:id', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('packages')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// PATCH /api/packages/:id/toggle
router.patch('/:id/toggle', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { is_active } = req.body;
    const { data, error } = await supabase
        .from('packages')
        .update({ is_active })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// DELETE /api/packages/:id
router.delete('/:id', authenticate, requireRole('owner'), async (req: AuthRequest, res: Response) => {
    const { error } = await supabase.from('packages').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: 'Package deleted' });
});

export default router;
