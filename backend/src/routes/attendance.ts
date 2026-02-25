import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/attendance?branch_id=&date=&member_id=&page=1&limit=50
router.get('/', authenticate, async (req, res) => {
    const { branch_id, date, member_id, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
        .from('attendance_records')
        .select('*, members!member_id(first_name, last_name, member_code)', { count: 'exact' })
        .order('check_in', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

    if (branch_id) query = query.eq('branch_id', branch_id);
    if (date) query = query.eq('date', date);
    if (member_id) query = query.eq('member_id', member_id);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const enriched = (data || []).map((r: any) => ({
        ...r,
        member_name: r.members ? `${r.members.first_name} ${r.members.last_name}` : null,
        member_code: r.members?.member_code,
    }));

    return res.json({ data: enriched, total: count });
});

// POST /api/attendance/checkin — manual check-in by member_id/phone/code
router.post('/checkin', authenticate, async (req: AuthRequest, res: Response) => {
    const { identifier, branch_id } = req.body; // identifier = member_id, phone, or member_code
    if (!identifier || !branch_id) return res.status(400).json({ error: 'identifier and branch_id required' });

    // Find member
    let query = supabase.from('members').select('id, first_name, last_name, member_code, status');
    if (identifier.startsWith('FIT-')) {
        query = query.eq('member_code', identifier);
    } else if (/^\d{10}$/.test(identifier)) {
        query = query.eq('phone', identifier);
    } else {
        query = query.eq('id', identifier);
    }
    const { data: member, error: memberError } = await (query as any).single();
    if (memberError || !member) return res.status(404).json({ error: 'Member not found' });
    if (member.status !== 'active') return res.status(400).json({ error: `Member status is "${member.status}". Cannot check in.` });

    const today = new Date().toISOString().split('T')[0];
    // Check if already checked in today
    const { data: existing } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('member_id', member.id)
        .eq('date', today)
        .is('check_out', null)
        .single();

    if (existing) {
        // Check-out
        const { data, error } = await supabase
            .from('attendance_records')
            .update({ check_out: new Date().toISOString(), duration_minutes: Math.floor((Date.now() - new Date(existing.check_in).getTime()) / 60000) })
            .eq('id', existing.id)
            .select()
            .single();
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ action: 'checkout', record: data, member });
    }

    // New check-in
    const { data, error } = await supabase
        .from('attendance_records')
        .insert([{
            member_id: member.id,
            branch_id,
            date: today,
            check_in: new Date().toISOString(),
            check_out: null,
            status: 'present',
            source: 'manual',
        }])
        .select()
        .single();
    if (error) return res.status(500).json({ error: error.message });

    // Increment total_visits
    await supabase.rpc('increment_visits', { member_id: member.id });

    return res.status(201).json({ action: 'checkin', record: data, member });
});

// GET /api/attendance/today?branch_id=
router.get('/today', authenticate, async (req, res) => {
    const { branch_id } = req.query as Record<string, string>;
    const today = new Date().toISOString().split('T')[0];
    let query = supabase
        .from('attendance_records')
        .select('*, members!member_id(first_name, last_name, member_code)')
        .eq('date', today)
        .order('check_in', { ascending: false });
    if (branch_id) query = query.eq('branch_id', branch_id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    const enriched = (data || []).map((r: any) => ({
        ...r,
        member_name: r.members ? `${r.members.first_name} ${r.members.last_name}` : null,
        member_code: r.members?.member_code,
    }));
    return res.json(enriched);
});

export default router;
