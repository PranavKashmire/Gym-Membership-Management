// Run with: node backend/create-admin.js
// Creates an admin user in Supabase Auth with role metadata

require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createAdmin() {
    const email = 'admin@fitcore.com';
    const password = 'Admin@1234';

    console.log(`\nCreating admin user: ${email}`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,          // skip email confirmation
        user_metadata: {
            role: 'admin',
            name: 'Admin User',
        },
    });

    if (error) {
        if (error.message.includes('already been registered')) {
            console.log('✅ User already exists — updating metadata...');
            const { data: list } = await supabase.auth.admin.listUsers();
            const existing = list?.users?.find(u => u.email === email);
            if (existing) {
                await supabase.auth.admin.updateUserById(existing.id, {
                    user_metadata: { role: 'admin', name: 'Admin User' },
                    password,
                });
                console.log('✅ Admin user updated successfully!');
            }
        } else {
            console.error('❌ Error:', error.message);
        }
    } else {
        console.log('✅ Admin user created successfully!');
        console.log('   ID:', data.user.id);
    }

    console.log('\n📋 Login credentials:');
    console.log('   Email:   ', email);
    console.log('   Password:', password);
    console.log('\n🌐 Open: http://localhost:5173\n');
    process.exit(0);
}

createAdmin();
