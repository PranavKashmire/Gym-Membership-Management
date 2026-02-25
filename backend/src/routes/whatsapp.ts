import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const ADMIN_ROLES = ['owner', 'admin'];

// GET /api/whatsapp/logs?member_id=&page=1&limit=50
router.get('/logs', authenticate, async (req, res) => {
    const { member_id, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = supabase
        .from('whatsapp_logs')
        .select('*, members!member_id(first_name, last_name)', { count: 'exact' })
        .order('sent_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);
    if (member_id) query = query.eq('member_id', member_id);
    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: (data || []).map((l: any) => ({ ...l, member_name: l.members ? `${l.members.first_name} ${l.members.last_name}` : null })), total: count });
});

// GET /api/whatsapp/templates
router.get('/templates', authenticate, async (_req, res) => {
    const { data, error } = await supabase.from('whatsapp_templates').select('*').order('template_name');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// POST /api/whatsapp/templates
router.post('/templates', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase.from('whatsapp_templates').insert([req.body]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// POST /api/whatsapp/send — log a manual send 
// (actual WhatsApp sending requires WATI/Twilio integration — to be wired in future)
router.post('/send', authenticate, requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
    const { member_id, template_id, message_body } = req.body;
    if (!member_id || !message_body) return res.status(400).json({ error: 'member_id and message_body are required' });

    const { data, error } = await supabase.from('whatsapp_logs').insert([{
        member_id,
        template_id: template_id || null,
        message_body,
        status: 'sent',
        sent_at: new Date().toISOString(),
    }]).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // TODO: integrate WATI/Twilio API call here
    return res.status(201).json({ ...data, message: 'Message logged. WhatsApp delivery requires WATI/Twilio integration.' });
});

export default router;
