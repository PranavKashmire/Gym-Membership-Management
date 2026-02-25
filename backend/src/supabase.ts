import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
    console.warn('\n⚠️  [Supabase] Using placeholder credentials.');
    console.warn('   Add real keys to backend/.env to connect to your database.\n');
}

// Service-role client — NEVER expose this on the frontend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
