// Run with: node backend/create-member.js
// Creates a demo member user in Supabase Auth and a corresponding profile in the members table

require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createMember() {
    const email = 'member@fitcore.com';
    const password = 'member123';
    const memberCode = 'FIT-2025-0001';

    console.log(`\nCreating demo member: ${memberCode} (${email})`);

    // 1. Get the default branch ID
    const { data: branch, error: branchErr } = await supabase
        .from('branches')
        .select('id')
        .eq('branch_code', 'BR-001')
        .single();

    if (branchErr || !branch) {
        console.error('❌ Error: Could not find branch BR-001. Run the schema seed first.');
        process.exit(1);
    }

    // 2. Create Auth User
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            role: 'member',
            name: 'Demo Member',
            member_code: memberCode
        },
    });

    let userId;
    if (authErr) {
        if (authErr.message.includes('already been registered')) {
            console.log('ℹ️ User already exists in Auth — getting ID...');
            const { data: list } = await supabase.auth.admin.listUsers();
            const existing = list?.users?.find(u => u.email === email);
            userId = existing.id;

            // Update password to be sure
            await supabase.auth.admin.updateUserById(userId, { password });
        } else {
            console.error('❌ Auth Error:', authErr.message);
            process.exit(1);
        }
    } else {
        userId = authData.user.id;
        console.log('✅ Auth user created.');
    }

    // 3. Create/Update Member Profile
    let dbMemberId;
    const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('member_code', memberCode)
        .single();

    if (existingMember) {
        console.log('ℹ️ Member profile already exists — updating...');
        dbMemberId = existingMember.id;
        const { error: updateErr } = await supabase
            .from('members')
            .update({
                user_id: userId,
                branch_id: branch.id,
                first_name: 'Demo',
                last_name: 'Member',
                email: email,
                status: 'active'
            })
            .eq('member_code', memberCode);

        if (updateErr) console.error('❌ Update Error:', updateErr.message);
        else console.log('✅ Member profile updated successfully!');
    } else {
        const { data: insertedMember, error: insertErr } = await supabase
            .from('members')
            .insert({
                user_id: userId,
                branch_id: branch.id,
                member_code: memberCode,
                first_name: 'Demo',
                last_name: 'Member',
                email: email,
                phone: '9999900001',
                status: 'active',
                joining_date: new Date().toISOString().split('T')[0]
            })
            .select('id')
            .single();

        if (insertErr) {
            console.error('❌ Insert Error:', insertErr.message);
            process.exit(1);
        } else {
            dbMemberId = insertedMember.id;
            console.log('✅ Member profile created successfully!');
        }
    }

    // 4. Update Auth User with member_id metadata
    await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
            role: 'member',
            name: 'Demo Member',
            member_id: dbMemberId,
            member_code: memberCode
        }
    });
    console.log('✅ Auth metadata synced with member_id.');

    console.log('\n📋 Member Login credentials:');
    console.log('   Member ID: ', memberCode);
    console.log('   Password:  ', password);
    console.log('\n🌐 Login at: http://localhost:5173/member/login\n');
    process.exit(0);
}

createMember();
