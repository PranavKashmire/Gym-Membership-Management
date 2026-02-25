import { Router, Response } from 'express';
import { supabase } from '../supabase';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    try {
        // Handle Member ID login
        if (email.startsWith('FIT-')) {
            const { data: member, error: memberErr } = await supabase
                .from('members')
                .select('email')
                .eq('member_code', email)
                .single();

            if (memberErr || !member?.email) {
                return res.status(401).json({ error: 'Member ID not found or no email associated' });
            }
            email = member.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.session) {
            return res.status(401).json({ error: error?.message || 'Invalid credentials' });
        }

        const user = data.user;
        return res.json({
            token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                role: user.user_metadata?.role || 'member',
                name: user.user_metadata?.name || '',
                branch_id: user.user_metadata?.branch_id || null,
                member_id: user.user_metadata?.member_id || null,
            },
        });
    } catch (err: any) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1]!;
    await supabase.auth.admin.signOut(token);
    return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    return res.json({ user: req.user });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token is required' });
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error || !data.session) return res.status(401).json({ error: 'Could not refresh session' });
    return res.json({ token: data.session.access_token, refresh_token: data.session.refresh_token });
});

export default router;
