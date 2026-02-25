import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin'];

// GET /api/branches — returns branches enriched with active_members, total_coaches, monthly_revenue
router.get('/', authenticate, async (_req, res) => {
    const { data: branches, error } = await supabase
        .from('branches')
        .select('*')
        .order('branch_name');
    if (error) return res.status(500).json({ error: error.message });

    // Enrich each branch with computed stats
    const enriched = await Promise.all((branches || []).map(async (b: any) => {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        const [
            { count: activeMembers },
            { count: totalCoaches },
            { data: revData },
        ] = await Promise.all([
            supabase.from('members').select('*', { count: 'exact', head: true }).eq('branch_id', b.id).eq('status', 'active'),
            supabase.from('coaches').select('*', { count: 'exact', head: true }).eq('branch_id', b.id).eq('is_active', true),
            supabase.from('payments').select('amount').eq('branch_id', b.id).eq('payment_status', 'completed').gte('payment_date', monthStart),
        ]);

        return {
            ...b,
            active_members: activeMembers || 0,
            total_coaches: totalCoaches || 0,
            monthly_revenue: (revData || []).reduce((sum: number, p: any) => sum + p.amount, 0),
        };
    }));

    return res.json(enriched);
});

// GET /api/branches/:id
router.get('/:id', authenticate, async (req, res) => {
    const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', req.params.id)
        .single();
    if (error) return res.status(404).json({ error: 'Branch not found' });
    return res.json(data);
});

// POST /api/branches — auto-generates branch_code
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    // Auto-generate branch_code if not provided
    let branch_code = req.body.branch_code;
    if (!branch_code) {
        const { count } = await supabase.from('branches').select('*', { count: 'exact', head: true });
        branch_code = `BR-${String((count || 0) + 1).padStart(3, '0')}`;
    }

    const { data, error } = await supabase
        .from('branches')
        .insert([{ ...req.body, branch_code }])
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PUT /api/branches/:id
router.put('/:id', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('branches')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// DELETE /api/branches/:id
router.delete('/:id', authenticate, requireRole('owner'), async (req: AuthRequest, res: Response) => {
    const { error } = await supabase.from('branches').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: 'Branch deleted' });
});

export default router;
