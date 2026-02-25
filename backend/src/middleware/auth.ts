import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        branch_id?: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        // Fetch role from user metadata
        req.user = {
            id: user.id,
            email: user.email!,
            role: user.user_metadata?.role || 'member',
            branch_id: user.user_metadata?.branch_id,
        };
        next();
    } catch {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
