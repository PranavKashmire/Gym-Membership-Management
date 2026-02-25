-- ============================================================
-- FitCore Pro — Supabase PostgreSQL Schema
-- Run this entire file in the Supabase SQL Editor
-- supabase.com → Your Project → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. BRANCHES
-- ============================================================
create table if not exists branches (
    id uuid primary key default uuid_generate_v4(),
    branch_name text not null,
    branch_code text unique not null,
    address text not null,
    city text not null,
    state text not null,
    country text default 'India',
    pincode text,
    phone text not null,
    email text not null,
    timezone text default 'Asia/Kolkata',
    opening_time time default '06:00',
    closing_time time default '22:00',
    is_active boolean default true,
    capacity int default 200,
    facilities text[] default '{}',
    manager_name text,
    monthly_rent numeric(12,2) default 0,
    established_date date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 2. PACKAGES
-- ============================================================
create table if not exists packages (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) on delete set null,
    package_name text not null,
    description text default '',
    duration_days int not null,
    price numeric(12,2) not null,
    discounted_price numeric(12,2),
    features text[] default '{}',
    package_type text check(package_type in ('membership','personal_training','group_class','combo')) default 'membership',
    max_freezes int default 2,
    freeze_days_allowed int default 30,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 3. MEMBERS
-- ============================================================
create table if not exists members (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    branch_id uuid not null references branches(id) on delete restrict,
    member_code text unique not null,
    first_name text not null,
    last_name text not null,
    phone text not null,
    email text,
    date_of_birth date,
    gender text check(gender in ('male','female','other')) default 'male',
    address text default '',
    profile_photo text,
    blood_group text default 'O+',
    medical_conditions text default 'None',
    fitness_goals text[] default '{}',
    fitness_level text check(fitness_level in ('beginner','intermediate','advanced')) default 'beginner',
    emergency_contact text default '',
    emergency_phone text default '',
    joining_date date not null default current_date,
    status text check(status in ('active','inactive','frozen','expired')) default 'inactive',
    referral_source text default 'Walk-in',
    referred_by uuid references members(id) on delete set null,
    total_visits int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 4. SUBSCRIPTIONS
-- ============================================================
create table if not exists subscriptions (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid not null references members(id) on delete cascade,
    package_id uuid not null references packages(id) on delete restrict,
    start_date date not null,
    end_date date not null,
    status text check(status in ('active','expired','frozen','cancelled')) default 'active',
    freeze_start date,
    freeze_end date,
    freeze_reason text,
    auto_renew boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 5. ATTENDANCE RECORDS
-- ============================================================
create table if not exists attendance_records (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid not null references members(id) on delete cascade,
    branch_id uuid not null references branches(id) on delete restrict,
    date date not null default current_date,
    check_in timestamptz,
    check_out timestamptz,
    duration_minutes int,
    status text check(status in ('present','absent','late')) default 'present',
    source text check(source in ('manual','app','kiosk')) default 'manual',
    notes text default '',
    marked_by uuid references auth.users(id) on delete set null,
    created_at timestamptz default now()
);

-- ============================================================
-- 6. COACHES
-- ============================================================
create table if not exists coaches (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    branch_id uuid not null references branches(id) on delete restrict,
    first_name text not null,
    last_name text not null,
    phone text not null,
    email text,
    specializations text[] default '{}',
    certifications jsonb default '[]',
    experience_years int default 0,
    hourly_rate numeric(10,2) default 0,
    salary numeric(12,2),
    profile_photo text,
    bio text,
    designation text default 'Fitness Trainer',
    rating numeric(3,2) default 0,
    total_reviews int default 0,
    active_members int default 0,
    availability jsonb default '{}',
    is_active boolean default true,
    total_sessions int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 7. PT SESSIONS
-- ============================================================
create table if not exists pt_sessions (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid not null references members(id) on delete cascade,
    coach_id uuid not null references coaches(id) on delete restrict,
    branch_id uuid references branches(id) on delete set null,
    session_date date not null,
    session_time time not null,
    duration_minutes int default 60,
    status text check(status in ('scheduled','completed','cancelled','no-show')) default 'scheduled',
    notes text,
    post_session_notes text,
    amount numeric(10,2) default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 8. PAYMENTS
-- ============================================================
create table if not exists payments (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid not null references members(id) on delete cascade,
    branch_id uuid not null references branches(id) on delete restrict,
    package_id uuid references packages(id) on delete set null,
    subscription_id uuid references subscriptions(id) on delete set null,
    amount numeric(12,2) not null,
    payment_method text check(payment_method in ('cash','card','upi','bank_transfer','online')) default 'cash',
    payment_status text check(payment_status in ('pending','completed','failed','refunded')) default 'completed',
    transaction_id text,
    invoice_number text unique not null,
    payment_date timestamptz default now(),
    due_date date,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 9. INQUIRIES
-- ============================================================
create table if not exists inquiries (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) on delete set null,
    full_name text not null,
    phone text not null,
    email text,
    source text check(source in ('walk-in','phone','website','social','referral','other')) default 'walk-in',
    interest_level text check(interest_level in ('hot','warm','cold')) default 'warm',
    interested_package uuid references packages(id) on delete set null,
    notes text default '',
    assigned_to uuid references auth.users(id) on delete set null,
    status text check(status in ('new','contacted','follow-up','converted','lost')) default 'new',
    follow_up_date date,
    converted_to_member uuid references members(id) on delete set null,
    pipeline_stage text check(pipeline_stage in ('new_lead','contacted','demo_scheduled','negotiation','won','lost')) default 'new_lead',
    pipeline_value numeric(12,2) default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 10. WHATSAPP TEMPLATES
-- ============================================================
create table if not exists whatsapp_templates (
    id uuid primary key default uuid_generate_v4(),
    template_name text not null,
    template_type text check(template_type in ('welcome','payment_reminder','payment_due','subscription_expiry','birthday','custom')) default 'custom',
    message_body text not null,
    variables text[] default '{}',
    trigger_event text,
    delay_hours int default 0,
    total_sent int default 0,
    total_delivered int default 0,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================
-- 11. WHATSAPP LOGS
-- ============================================================
create table if not exists whatsapp_logs (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid references members(id) on delete set null,
    template_id uuid references whatsapp_templates(id) on delete set null,
    message_body text not null,
    status text check(status in ('sent','delivered','read','failed')) default 'sent',
    sent_at timestamptz default now(),
    delivered_at timestamptz
);

-- ============================================================
-- HELPER FUNCTION: increment_visits
-- ============================================================
create or replace function increment_visits(member_id uuid)
returns void as $$
    update members set total_visits = total_visits + 1 where id = member_id;
$$ language sql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — basic setup
-- Service role key (used by backend) bypasses all RLS
-- ============================================================
alter table branches enable row level security;
alter table packages enable row level security;
alter table members enable row level security;
alter table subscriptions enable row level security;
alter table attendance_records enable row level security;
alter table coaches enable row level security;
alter table pt_sessions enable row level security;
alter table payments enable row level security;
alter table inquiries enable row level security;
alter table whatsapp_templates enable row level security;
alter table whatsapp_logs enable row level security;

-- Allow authenticated users to read all tables
-- Drop first so this script is safe to re-run multiple times
drop policy if exists "Allow authenticated read" on branches;
drop policy if exists "Allow authenticated read" on packages;
drop policy if exists "Allow authenticated read" on members;
drop policy if exists "Allow authenticated read" on subscriptions;
drop policy if exists "Allow authenticated read" on attendance_records;
drop policy if exists "Allow authenticated read" on coaches;
drop policy if exists "Allow authenticated read" on pt_sessions;
drop policy if exists "Allow authenticated read" on payments;
drop policy if exists "Allow authenticated read" on inquiries;
drop policy if exists "Allow authenticated read" on whatsapp_templates;
drop policy if exists "Allow authenticated read" on whatsapp_logs;

create policy "Allow authenticated read" on branches for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on packages for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on members for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on subscriptions for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on attendance_records for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on coaches for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on pt_sessions for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on payments for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on inquiries for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on whatsapp_templates for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read" on whatsapp_logs for select using (auth.role() = 'authenticated');

-- ============================================================
-- SEED: Default branch and packages
-- ============================================================
insert into branches (branch_name, branch_code, address, city, state, phone, email, capacity)
values ('FitCore Main Branch', 'BR-001', '123 Fitness Street, Andheri West', 'Mumbai', 'Maharashtra', '+91 99999 00001', 'main@fitcore.com', 300)
on conflict (branch_code) do nothing;

-- Insert packages after branch exists
do $$
declare branch_uuid uuid;
begin
    select id into branch_uuid from branches where branch_code = 'BR-001';
    insert into packages (branch_id, package_name, description, duration_days, price, discounted_price, features, package_type)
    values
        (branch_uuid, 'Monthly Basic', 'Access to gym equipment', 30, 1500, 1299, ARRAY['Gym Access', 'Locker'], 'membership'),
        (branch_uuid, 'Quarterly Standard', '3 months gym access', 90, 3999, 3499, ARRAY['Gym Access', 'Locker', 'Steam Room'], 'membership'),
        (branch_uuid, 'Half-Year Pro', '6 months all access', 180, 6999, 5999, ARRAY['Gym Access', 'Locker', 'Steam Room', 'Group Classes'], 'membership'),
        (branch_uuid, 'Annual Elite', '1 year unlimited', 365, 11999, 9999, ARRAY['Gym Access', 'Locker', 'Steam Room', 'Group Classes', 'PT Session x4'], 'membership'),
        (branch_uuid, 'Personal Training Pack', '10 PT sessions', 60, 8000, 7000, ARRAY['10 PT Sessions', 'Diet Plan', 'Progress Tracking'], 'personal_training')
    on conflict do nothing;
end $$;
