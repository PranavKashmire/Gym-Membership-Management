import { Branch, Member, Package, Payment, Inquiry, Coach, PTSession, Expense, AttendanceRecord, WhatsAppTemplate, WhatsAppLog, Notification, DashboardMetrics, RevenueDataPoint } from '../types';

export const branches: Branch[] = [
    {
        id: 'br-1', branch_name: 'FitCore Andheri', branch_code: 'FIT-AND-01',
        address: '42, Lokhandwala Complex, Andheri West', city: 'Mumbai',
        state: 'Maharashtra', country: 'India', phone: '+91 98765 43210',
        email: 'andheri@fitcore.com', timezone: 'Asia/Kolkata',
        opening_time: '05:30', closing_time: '23:00', is_active: true,
        capacity: 300, facilities: ['Cardio Zone', 'Weight Training', 'Steam Room', 'Locker', 'Parking', 'Group Classes'],
        member_count: 248, active_members: 248, total_coaches: 2,
        monthly_revenue: 412000, manager_name: 'Pradeep Kumar', monthly_rent: 85000,
        established_date: '2023-01-15', created_at: '2023-01-15T00:00:00Z'
    },
    {
        id: 'br-2', branch_name: 'FitCore Bandra', branch_code: 'FIT-BAN-02',
        address: '15, Hill Road, Bandra West', city: 'Mumbai',
        state: 'Maharashtra', country: 'India', phone: '+91 98765 43211',
        email: 'bandra@fitcore.com', timezone: 'Asia/Kolkata',
        opening_time: '06:00', closing_time: '22:30', is_active: true,
        capacity: 200, facilities: ['Cardio Zone', 'Weight Training', 'Yoga Studio', 'Locker', 'Café'],
        member_count: 189, active_members: 189, total_coaches: 1,
        monthly_revenue: 318000, manager_name: 'Sunita Menon', monthly_rent: 65000,
        established_date: '2023-06-01', created_at: '2023-06-01T00:00:00Z'
    },
    {
        id: 'br-3', branch_name: 'FitCore Powai', branch_code: 'FIT-POW-03',
        address: '8, Hiranandani Gardens, Powai', city: 'Mumbai',
        state: 'Maharashtra', country: 'India', phone: '+91 98765 43212',
        email: 'powai@fitcore.com', timezone: 'Asia/Kolkata',
        opening_time: '05:00', closing_time: '23:30', is_active: true,
        capacity: 400, facilities: ['Cardio Zone', 'Weight Training', 'Swimming Pool', 'Steam Room', 'Sauna', 'Locker', 'Parking', 'Café'],
        member_count: 312, active_members: 312, total_coaches: 1,
        monthly_revenue: 589000, manager_name: 'Rajesh Nair', monthly_rent: 120000,
        established_date: '2024-01-10', created_at: '2024-01-10T00:00:00Z'
    },
];


// ─── PACKAGES ────────────────────────────────────────────────────────────────
export const packages: Package[] = [
    {
        id: 'pkg-1', package_name: 'Basic Monthly', description: 'Perfect for getting started',
        duration_days: 30, price: 1500, package_type: 'membership',
        features: ['Unlimited Gym Access', 'Locker Facility', 'Free WiFi'],
        max_freezes: 1, freeze_days_allowed: 5, is_active: true, member_count: 82, created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'pkg-2', package_name: 'Quarterly Power', description: '3-month plan with savings',
        duration_days: 90, price: 4000, discounted_price: 3800, package_type: 'membership',
        features: ['Unlimited Gym Access', 'Locker Facility', 'Free WiFi', '2 Guest Passes'],
        max_freezes: 1, freeze_days_allowed: 10, is_active: true, member_count: 134, created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'pkg-3', package_name: 'Half-Yearly Fit', description: '6-month commitment, serious results',
        duration_days: 180, price: 7500, discounted_price: 6750, package_type: 'membership',
        features: ['Unlimited Gym Access', 'Locker Facility', 'Free WiFi', '5 Guest Passes', 'Body Assessment'],
        max_freezes: 2, freeze_days_allowed: 15, is_active: true, member_count: 98, created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'pkg-4', package_name: 'Annual Elite', description: 'Best value — commit for a year',
        duration_days: 365, price: 14000, discounted_price: 11200, package_type: 'membership',
        features: ['Unlimited Gym Access', 'Locker Facility', 'Free WiFi', '10 Guest Passes', 'Monthly Body Assessment', 'Nutrition Consultation', 'Priority Booking'],
        max_freezes: 3, freeze_days_allowed: 30, is_active: true, member_count: 215, created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'pkg-5', package_name: 'PT Package — 10 Sessions', description: 'Personal training with expert coaches',
        duration_days: 60, price: 8000, package_type: 'personal_training',
        features: ['10 PT Sessions (60 min each)', 'Personalized Workout Plan', 'Diet Consultation', 'Progress Tracking'],
        max_freezes: 0, freeze_days_allowed: 0, is_active: true, member_count: 47, created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'pkg-6', package_name: 'Combo Elite', description: 'Membership + PT combo for maximum results',
        duration_days: 90, price: 11000, discounted_price: 9900, package_type: 'combo',
        features: ['Unlimited Gym Access', '8 PT Sessions', 'Locker', 'WiFi', 'Body Assessment', 'Diet Plan'],
        max_freezes: 1, freeze_days_allowed: 10, is_active: true, member_count: 29, created_at: '2023-01-01T00:00:00Z'
    },
];

// ─── MEMBERS ─────────────────────────────────────────────────────────────────
export const members: Member[] = [
    {
        id: 'mem-1', branch_id: 'br-1', branch_name: 'FitCore Andheri', member_code: 'FIT-2025-0001',
        first_name: 'Arjun', last_name: 'Sharma', phone: '+91 98110 12345', email: 'arjun.sharma@email.com',
        emergency_contact: 'Priya Sharma', emergency_phone: '+91 98110 99999',
        date_of_birth: '1995-03-15', gender: 'male', address: 'B-12, Andheri West, Mumbai - 400053',
        blood_group: 'B+', medical_conditions: 'None', fitness_goals: ['Muscle Gain', 'Strength'],
        fitness_level: 'intermediate', joining_date: '2025-01-10', status: 'active',
        referral_source: 'Instagram', package_name: 'Annual Elite', days_remaining: 180, total_visits: 48,
        created_at: '2025-01-10T09:00:00Z', updated_at: '2025-01-10T09:00:00Z'
    },
    {
        id: 'mem-2', branch_id: 'br-1', branch_name: 'FitCore Andheri', member_code: 'FIT-2025-0002',
        first_name: 'Priya', last_name: 'Patel', phone: '+91 98220 23456', email: 'priya.patel@email.com',
        emergency_contact: 'Rahul Patel', emergency_phone: '+91 98220 88888',
        date_of_birth: '1998-07-22', gender: 'female', address: '5-A, Bandra East, Mumbai - 400051',
        blood_group: 'O+', medical_conditions: 'Mild knee pain', fitness_goals: ['Weight Loss', 'Flexibility'],
        fitness_level: 'beginner', joining_date: '2025-02-01', status: 'active',
        referral_source: 'Walk-in', package_name: 'Quarterly Power', days_remaining: 45, total_visits: 22,
        created_at: '2025-02-01T10:30:00Z', updated_at: '2025-02-01T10:30:00Z'
    },
    {
        id: 'mem-3', branch_id: 'br-2', branch_name: 'FitCore Bandra', member_code: 'FIT-2025-0003',
        first_name: 'Rahul', last_name: 'Mehta', phone: '+91 97330 34567', email: 'rahul.mehta@email.com',
        emergency_contact: 'Seema Mehta', emergency_phone: '+91 97330 77777',
        date_of_birth: '1990-11-30', gender: 'male', address: '22, Powai Heights, Mumbai - 400076',
        blood_group: 'A+', medical_conditions: 'None', fitness_goals: ['Endurance', 'Weight Loss'],
        fitness_level: 'advanced', joining_date: '2024-08-15', status: 'expired',
        referral_source: 'Referral', package_name: 'Half-Yearly Fit', days_remaining: 0, total_visits: 88,
        created_at: '2024-08-15T08:00:00Z', updated_at: '2025-02-10T08:00:00Z'
    },
    {
        id: 'mem-4', branch_id: 'br-3', branch_name: 'FitCore Powai', member_code: 'FIT-2025-0004',
        first_name: 'Sneha', last_name: 'Kulkarni', phone: '+91 96440 45678', email: 'sneha.k@email.com',
        emergency_contact: 'Vikram Kulkarni', emergency_phone: '+91 96440 66666',
        date_of_birth: '1993-05-08', gender: 'female', address: '7, Hiranandani, Powai - 400076',
        blood_group: 'AB+', medical_conditions: 'None', fitness_goals: ['Muscle Gain', 'Nutrition'],
        fitness_level: 'intermediate', joining_date: '2025-01-20', status: 'active',
        referral_source: 'Google', package_name: 'Annual Elite', days_remaining: 300, total_visits: 31,
        created_at: '2025-01-20T11:00:00Z', updated_at: '2025-01-20T11:00:00Z'
    },
    {
        id: 'mem-5', branch_id: 'br-1', branch_name: 'FitCore Andheri', member_code: 'FIT-2025-0005',
        first_name: 'Vikram', last_name: 'Nair', phone: '+91 95550 56789', email: 'vikram.nair@email.com',
        emergency_contact: 'Anita Nair', emergency_phone: '+91 95550 55555',
        date_of_birth: '1988-09-12', gender: 'male', address: '33, Juhu, Mumbai - 400049',
        blood_group: 'O-', medical_conditions: 'Hypertension (controlled)', fitness_goals: ['Weight Loss', 'Cardio'],
        fitness_level: 'beginner', joining_date: '2025-02-10', status: 'active',
        referral_source: 'Friend Referral', package_name: 'Basic Monthly', days_remaining: 7, total_visits: 12,
        created_at: '2025-02-10T09:30:00Z', updated_at: '2025-02-10T09:30:00Z'
    },
    {
        id: 'mem-6', branch_id: 'br-2', branch_name: 'FitCore Bandra', member_code: 'FIT-2025-0006',
        first_name: 'Ananya', last_name: 'Desai', phone: '+91 94660 67890', email: 'ananya.d@email.com',
        emergency_contact: 'Rohan Desai', emergency_phone: '+91 94660 44444',
        date_of_birth: '2000-01-25', gender: 'female', address: '11, Santacruz West - 400054',
        blood_group: 'B-', medical_conditions: 'None', fitness_goals: ['Flexibility', 'General Fitness'],
        fitness_level: 'beginner', joining_date: '2025-01-05', status: 'frozen',
        referral_source: 'Facebook', package_name: 'Quarterly Power', days_remaining: 52, total_visits: 8,
        created_at: '2025-01-05T14:00:00Z', updated_at: '2025-02-05T14:00:00Z'
    },
    {
        id: 'mem-7', branch_id: 'br-3', branch_name: 'FitCore Powai', member_code: 'FIT-2025-0007',
        first_name: 'Rohan', last_name: 'Gupta', phone: '+91 93770 78901', email: 'rohan.g@email.com',
        emergency_contact: 'Meera Gupta', emergency_phone: '+91 93770 33333',
        date_of_birth: '1996-04-18', gender: 'male', address: '4, NIBM, Pune - 411048',
        blood_group: 'A-', medical_conditions: 'None', fitness_goals: ['Muscle Gain', 'Strength', 'Endurance'],
        fitness_level: 'advanced', joining_date: '2024-11-01', status: 'active',
        referral_source: 'Website', package_name: 'Combo Elite', days_remaining: 28, total_visits: 62,
        created_at: '2024-11-01T10:00:00Z', updated_at: '2024-11-01T10:00:00Z'
    },
    {
        id: 'mem-8', branch_id: 'br-1', branch_name: 'FitCore Andheri', member_code: 'FIT-2025-0008',
        first_name: 'Meera', last_name: 'Joshi', phone: '+91 92880 89012', email: 'meera.j@email.com',
        emergency_contact: 'Suresh Joshi', emergency_phone: '+91 92880 22222',
        date_of_birth: '1992-08-05', gender: 'female', address: '18, Malad West - 400064',
        blood_group: 'O+', medical_conditions: 'None', fitness_goals: ['Weight Loss'],
        fitness_level: 'intermediate', joining_date: '2025-02-15', status: 'active',
        referral_source: 'Instagram', package_name: 'Half-Yearly Fit', days_remaining: 150, total_visits: 9,
        created_at: '2025-02-15T08:30:00Z', updated_at: '2025-02-15T08:30:00Z'
    },
];

// ─── COACHES ─────────────────────────────────────────────────────────────────
export const coaches: Coach[] = [
    {
        id: 'cch-1', branch_id: 'br-1', branch_name: 'FitCore Andheri',
        first_name: 'Karan', last_name: 'Malhotra', phone: '+91 98001 11111',
        email: 'karan@fitcore.com',
        specialization: ['Strength Training', 'Bodybuilding', 'Nutrition'],
        specializations: ['Strength Training', 'Bodybuilding', 'Nutrition'],
        certifications: ['CSCS (NSCA)', 'ACE CPT'],
        experience_years: 6, hourly_rate: 1200, salary: 55000,
        designation: 'Head Coach', rating: 4.8, total_reviews: 94, active_members: 18,
        bio: 'Certified strength coach with 6 years of experience.',
        availability: { Mon: [{ start: '06:00', end: '12:00' }] },
        is_active: true, total_sessions: 312, created_at: '2023-02-01T00:00:00Z'
    },
    {
        id: 'cch-2', branch_id: 'br-1', branch_name: 'FitCore Andheri',
        first_name: 'Riya', last_name: 'Kapoor', phone: '+91 98002 22222',
        email: 'riya@fitcore.com',
        specialization: ['Yoga', 'Pilates', 'Flexibility', 'Cardio'],
        specializations: ['Yoga', 'Pilates', 'Flexibility', 'Cardio'],
        certifications: ['RYT-200 (Yoga Alliance)', 'AFAA CPT'],
        experience_years: 4, hourly_rate: 1000, salary: 45000,
        designation: 'Yoga & Wellness Coach', rating: 4.9, total_reviews: 72, active_members: 12,
        bio: 'Yoga and wellness expert focused on mind-body connection.',
        availability: { Tue: [{ start: '07:00', end: '14:00' }] },
        is_active: true, total_sessions: 248, created_at: '2023-04-15T00:00:00Z'
    },
    {
        id: 'cch-3', branch_id: 'br-2', branch_name: 'FitCore Bandra',
        first_name: 'Amit', last_name: 'Verma', phone: '+91 98003 33333',
        email: 'amit@fitcore.com',
        specialization: ['Cardio', 'HIIT', 'Weight Loss'],
        specializations: ['Cardio', 'HIIT', 'Weight Loss'],
        certifications: ['ACSM CPT'],
        experience_years: 3, hourly_rate: 900, salary: 38000,
        designation: 'Cardio & HIIT Coach', rating: 4.5, total_reviews: 38, active_members: 9,
        bio: 'Cardio and fat-loss specialist with expertise in HIIT programming.',
        availability: { Mon: [{ start: '08:00', end: '16:00' }] },
        is_active: true, total_sessions: 156, created_at: '2023-08-01T00:00:00Z'
    },
    {
        id: 'cch-4', branch_id: 'br-3', branch_name: 'FitCore Powai',
        first_name: 'Nisha', last_name: 'Rao', phone: '+91 98004 44444',
        email: 'nisha@fitcore.com',
        specialization: ['Strength Training', 'Sports Performance', 'Mobility'],
        specializations: ['Strength Training', 'Sports Performance', 'Mobility'],
        certifications: ['CSCS (NSCA)', 'Precision Nutrition L1'],
        experience_years: 7, hourly_rate: 1500, salary: 70000,
        designation: 'Elite Performance Coach', rating: 5.0, total_reviews: 128, active_members: 24,
        bio: 'Elite performance coach with background in competitive athletics.',
        availability: { Mon: [{ start: '05:30', end: '14:00' }] },
        is_active: true, total_sessions: 421, created_at: '2023-01-05T00:00:00Z'
    },
];


// ─── INQUIRIES ───────────────────────────────────────────────────────────────
export const inquiries: Inquiry[] = [
    {
        id: 'inq-1', branch_id: 'br-1', branch_name: 'FitCore Andheri', full_name: 'Aditya Kumar',
        phone: '+91 97711 11111', email: 'aditya.k@gmail.com', source: 'walk-in',
        interest_level: 'hot', interested_package: 'Annual Elite', notes: 'Visited today, very interested in annual package. Needs flexible timing.',
        assigned_to: 'usr-admin', assigned_name: 'Raj Admin', status: 'contacted',
        follow_up_date: '2025-02-26', pipeline_stage: 'contacted', pipeline_value: 11200, days_in_stage: 2,
        created_at: '2025-02-24T09:00:00Z', updated_at: '2025-02-24T11:00:00Z'
    },
    {
        id: 'inq-2', branch_id: 'br-2', branch_name: 'FitCore Bandra', full_name: 'Kavya Singh',
        phone: '+91 97722 22222', email: 'kavya.s@gmail.com', source: 'social',
        interest_level: 'warm', interested_package: 'Half-Yearly Fit', notes: 'Saw our Instagram post. Wants to lose weight before wedding.',
        assigned_to: 'usr-admin', assigned_name: 'Raj Admin', status: 'follow-up',
        follow_up_date: '2025-02-25', pipeline_stage: 'demo_scheduled', pipeline_value: 6750, days_in_stage: 1,
        created_at: '2025-02-23T14:00:00Z', updated_at: '2025-02-24T10:00:00Z'
    },
    {
        id: 'inq-3', branch_id: 'br-3', branch_name: 'FitCore Powai', full_name: 'Manish Tiwari',
        phone: '+91 97733 33333', email: '', source: 'phone',
        interest_level: 'cold', interested_package: 'Basic Monthly', notes: 'Called but seemed unsure. Will follow up next week.',
        assigned_to: 'usr-admin', assigned_name: 'Raj Admin', status: 'new',
        follow_up_date: '2025-03-02', pipeline_stage: 'new_lead', pipeline_value: 1500, days_in_stage: 3,
        created_at: '2025-02-21T16:00:00Z', updated_at: '2025-02-21T16:00:00Z'
    },
    {
        id: 'inq-4', branch_id: 'br-1', branch_name: 'FitCore Andheri', full_name: 'Deepa Iyer',
        phone: '+91 97744 44444', email: 'deepa.i@gmail.com', source: 'referral',
        interest_level: 'hot', interested_package: 'Combo Elite', notes: 'Referred by member Arjun Sharma. Very serious about PT programme.',
        assigned_to: 'usr-admin', assigned_name: 'Raj Admin', status: 'new',
        follow_up_date: '2025-02-25', pipeline_stage: 'negotiation', pipeline_value: 9900, days_in_stage: 1,
        created_at: '2025-02-24T13:00:00Z', updated_at: '2025-02-24T13:00:00Z'
    },
    {
        id: 'inq-5', branch_id: 'br-2', branch_name: 'FitCore Bandra', full_name: 'Suresh Pillai',
        phone: '+91 97755 55555', email: 'suresh.p@gmail.com', source: 'website',
        interest_level: 'warm', interested_package: 'Quarterly Power', notes: 'Filled online form. Wants to see the facility first.',
        assigned_to: 'usr-admin', assigned_name: 'Raj Admin', status: 'contacted',
        follow_up_date: '2025-02-27', pipeline_stage: 'contacted', pipeline_value: 3800, days_in_stage: 4,
        created_at: '2025-02-20T10:00:00Z', updated_at: '2025-02-24T09:00:00Z'
    },
];

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const payments: Payment[] = [
    {
        id: 'pay-1', member_id: 'mem-1', member_name: 'Arjun Sharma', branch_id: 'br-1', branch_name: 'FitCore Andheri',
        amount: 11200, payment_method: 'upi', payment_mode: 'upi', payment_status: 'completed',
        transaction_id: 'UPI20250110001', payment_date: '2025-01-10', invoice_number: 'INV-2025-0001',
        package_name: 'Annual Elite', package_id: 'pkg-4', created_at: '2025-01-10T09:00:00Z'
    },
    {
        id: 'pay-2', member_id: 'mem-2', member_name: 'Priya Patel', branch_id: 'br-1', branch_name: 'FitCore Andheri',
        amount: 3800, payment_method: 'card', payment_mode: 'card', payment_status: 'completed',
        transaction_id: 'CARD20250201001', payment_date: '2025-02-01', invoice_number: 'INV-2025-0002',
        package_name: 'Quarterly Power', package_id: 'pkg-2', created_at: '2025-02-01T10:30:00Z'
    },
    {
        id: 'pay-3', member_id: 'mem-5', member_name: 'Vikram Nair', branch_id: 'br-1', branch_name: 'FitCore Andheri',
        amount: 1500, payment_method: 'cash', payment_mode: 'cash', payment_status: 'completed',
        transaction_id: '', payment_date: '2025-02-10', invoice_number: 'INV-2025-0003',
        package_name: 'Basic Monthly', package_id: 'pkg-1', created_at: '2025-02-10T09:30:00Z'
    },
    {
        id: 'pay-4', member_id: 'mem-7', member_name: 'Rohan Gupta', branch_id: 'br-3', branch_name: 'FitCore Powai',
        amount: 9900, payment_method: 'upi', payment_mode: 'upi', payment_status: 'pending',
        payment_date: '2025-02-20', due_date: '2025-02-24', invoice_number: 'INV-2025-0004',
        package_name: 'Combo Elite', package_id: 'pkg-6', created_at: '2025-02-20T10:00:00Z'
    },
    {
        id: 'pay-5', member_id: 'mem-8', member_name: 'Meera Joshi', branch_id: 'br-1', branch_name: 'FitCore Andheri',
        amount: 6750, payment_method: 'upi', payment_mode: 'upi', payment_status: 'completed',
        transaction_id: 'UPI20250215001', payment_date: '2025-02-15', invoice_number: 'INV-2025-0005',
        package_name: 'Half-Yearly Fit', package_id: 'pkg-3', created_at: '2025-02-15T08:30:00Z'
    },
    {
        id: 'pay-6', member_id: 'mem-3', member_name: 'Rahul Mehta', branch_id: 'br-2', branch_name: 'FitCore Bandra',
        amount: 6750, payment_method: 'card', payment_mode: 'card', payment_status: 'completed',
        transaction_id: 'CARD20240815001', payment_date: '2024-08-15', invoice_number: 'INV-2024-0120',
        package_name: 'Half-Yearly Fit', package_id: 'pkg-3', created_at: '2024-08-15T08:00:00Z'
    },
];


// ─── PT SESSIONS ──────────────────────────────────────────────────────────────
export const ptSessions: PTSession[] = [
    {
        id: 'pts-1', member_id: 'mem-1', member_name: 'Arjun Sharma',
        coach_id: 'cch-1', coach_name: 'Karan Malhotra',
        session_date: '2025-02-25', session_time: '07:00', duration_minutes: 60, status: 'scheduled',
        notes: 'Focus on chest and shoulders today.', created_at: '2025-02-20T10:00:00Z'
    },
    {
        id: 'pts-2', member_id: 'mem-4', member_name: 'Sneha Kulkarni',
        coach_id: 'cch-4', coach_name: 'Nisha Rao',
        session_date: '2025-02-24', session_time: '06:30', duration_minutes: 60, status: 'completed',
        notes: 'Leg day — squats and deadlifts.', post_session_notes: 'Great form on squats. Increase weight next session.',
        created_at: '2025-02-18T11:00:00Z'
    },
    {
        id: 'pts-3', member_id: 'mem-7', member_name: 'Rohan Gupta',
        coach_id: 'cch-4', coach_name: 'Nisha Rao',
        session_date: '2025-02-26', session_time: '06:00', duration_minutes: 90, status: 'scheduled',
        notes: 'Sport performance drill + Olympic lifting.', created_at: '2025-02-22T09:00:00Z'
    },
    {
        id: 'pts-4', member_id: 'mem-2', member_name: 'Priya Patel',
        coach_id: 'cch-2', coach_name: 'Riya Kapoor',
        session_date: '2025-02-24', session_time: '09:00', duration_minutes: 60, status: 'completed',
        notes: 'Yoga flow + core strengthening for knee support.',
        post_session_notes: 'Knee feeling better. Progressing well with modifications.',
        created_at: '2025-02-19T14:00:00Z'
    },
];

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendanceRecords: AttendanceRecord[] = [
    { id: 'att-1', member_id: 'mem-1', member_name: 'Arjun Sharma', member_code: 'FIT-2025-0001', branch_id: 'br-1', check_in_time: '2025-02-24T06:45:00Z', check_out_time: '2025-02-24T08:30:00Z', date: '2025-02-24', status: 'present' },
    { id: 'att-2', member_id: 'mem-2', member_name: 'Priya Patel', member_code: 'FIT-2025-0002', branch_id: 'br-1', check_in_time: '2025-02-24T09:00:00Z', check_out_time: '2025-02-24T10:30:00Z', date: '2025-02-24', status: 'present' },
    { id: 'att-3', member_id: 'mem-5', member_name: 'Vikram Nair', member_code: 'FIT-2025-0005', branch_id: 'br-1', check_in_time: '2025-02-24T07:15:00Z', date: '2025-02-24', status: 'present' },
    { id: 'att-4', member_id: 'mem-8', member_name: 'Meera Joshi', member_code: 'FIT-2025-0008', branch_id: 'br-1', check_in_time: '2025-02-24T08:00:00Z', check_out_time: '2025-02-24T09:45:00Z', date: '2025-02-24', status: 'present' },
    { id: 'att-5', member_id: 'mem-4', member_name: 'Sneha Kulkarni', member_code: 'FIT-2025-0004', branch_id: 'br-3', check_in_time: '2025-02-24T06:00:00Z', check_out_time: '2025-02-24T07:30:00Z', date: '2025-02-24', status: 'present' },
    { id: 'att-6', member_id: 'mem-7', member_name: 'Rohan Gupta', member_code: 'FIT-2025-0007', branch_id: 'br-3', check_in_time: '2025-02-24T07:00:00Z', date: '2025-02-24', status: 'present' },
];

// Alias with check_in/check_out fields for AttendancePage compatibility
export const attendance = attendanceRecords.map(r => ({
    ...r,
    check_in: r.check_in_time,
    check_out: r.check_out_time || null,
    source: 'manual' as const,
    notes: '',
    duration_minutes: r.check_out_time ? 45 : undefined,
}));


// ─── EXPENSES ─────────────────────────────────────────────────────────────────
export const expenses: Expense[] = [
    { id: 'exp-1', branch_id: 'br-1', branch_name: 'FitCore Andheri', category: 'utilities', amount: 28000, description: 'Electricity bill February', expense_date: '2025-02-05', added_by: 'usr-admin', created_at: '2025-02-05T10:00:00Z' },
    { id: 'exp-2', branch_id: 'br-1', branch_name: 'FitCore Andheri', category: 'salaries', amount: 150000, description: 'Staff salaries February', expense_date: '2025-02-01', added_by: 'usr-admin', created_at: '2025-02-01T09:00:00Z' },
    { id: 'exp-3', branch_id: 'br-2', branch_name: 'FitCore Bandra', category: 'equipment', amount: 45000, description: 'New treadmill purchase', expense_date: '2025-02-12', added_by: 'usr-admin', created_at: '2025-02-12T14:00:00Z' },
    { id: 'exp-4', branch_id: 'br-3', branch_name: 'FitCore Powai', category: 'marketing', amount: 22000, description: 'Instagram ads campaign', expense_date: '2025-02-15', added_by: 'usr-admin', created_at: '2025-02-15T11:00:00Z' },
    { id: 'exp-5', branch_id: 'br-1', branch_name: 'FitCore Andheri', category: 'maintenance', amount: 8500, description: 'AC servicing and repairs', expense_date: '2025-02-18', added_by: 'usr-admin', created_at: '2025-02-18T13:00:00Z' },
];

// ─── WHATSAPP TEMPLATES ───────────────────────────────────────────────────────
export const whatsappTemplates: WhatsAppTemplate[] = [
    {
        id: 'tpl-1', template_name: 'Welcome Message', template_type: 'welcome',
        category: 'Onboarding', is_active: true,
        content: 'Welcome to FitCore Pro, {name}! 🎉 Your Member ID: *{member_id}*. We\'re excited to be part of your journey! 💪',
        message_body: 'Welcome to FitCore Pro, {name}! 🎉 Your Member ID: *{member_id}*.',
        variables: ['name', 'member_id', 'package_name'],
        trigger_event: 'new_member_registered', total_sent: 142, total_delivered: 138,
        created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'tpl-2', template_name: 'Payment Reminder', template_type: 'payment_reminder',
        category: 'Billing', is_active: true,
        content: 'Hi {name}, your {package_name} payment of ₹{amount} is due on *{due_date}*. Visit the gym or pay online to avoid interruption.',
        message_body: 'Hi {name}, your payment is due on {due_date}.',
        variables: ['name', 'amount', 'due_date', 'package_name'],
        trigger_event: 'payment_due_3_days', delay_hours: 0, total_sent: 89, total_delivered: 85,
        created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'tpl-3', template_name: 'Subscription Expiry Alert', template_type: 'subscription_expiry',
        category: 'Retention', is_active: true,
        content: 'Hi {name}, your *{package_name}* expires on *{expiry_date}*. 🚨 Renew now to keep your streak going!',
        message_body: 'Hi {name}, your subscription expires on {expiry_date}.',
        variables: ['name', 'package_name', 'expiry_date'],
        trigger_event: 'subscription_expiry_7_days', delay_hours: 0, total_sent: 212, total_delivered: 205,
        created_at: '2023-01-01T00:00:00Z'
    },
    {
        id: 'tpl-4', template_name: 'Birthday Wishes', template_type: 'birthday',
        category: 'Engagement', is_active: true,
        content: '🎂 Happy Birthday, {name}! Train for FREE at FitCore today as a gift from us! 💪🎉',
        message_body: '🎂 Happy Birthday, {name}! Train for FREE today!',
        variables: ['name'],
        trigger_event: 'member_birthday', delay_hours: 0, total_sent: 34, total_delivered: 33,
        created_at: '2023-01-01T00:00:00Z'
    },
];


// ─── WHATSAPP LOGS ────────────────────────────────────────────────────────────
export const whatsappLogs: WhatsAppLog[] = [
    { id: 'wl-1', member_id: 'mem-1', member_name: 'Arjun Sharma', template_id: 'tpl-1', template_name: 'Welcome Message', message_type: 'welcome', message_body: 'Welcome to FitCore Pro, Arjun Sharma!...', message_content: 'Welcome to FitCore Pro, Arjun Sharma! Your member ID is FIT-2025-0001.', status: 'read', sent_at: '2025-01-10T09:05:00Z', delivered_at: '2025-01-10T09:05:30Z' },
    { id: 'wl-2', member_id: 'mem-2', member_name: 'Priya Patel', template_id: 'tpl-1', template_name: 'Welcome Message', message_type: 'welcome', message_body: 'Welcome to FitCore Pro, Priya Patel!...', message_content: 'Welcome to FitCore Pro, Priya! We are excited to have you.', status: 'delivered', sent_at: '2025-02-01T10:35:00Z', delivered_at: '2025-02-01T10:36:00Z' },
    { id: 'wl-3', member_id: 'mem-7', member_name: 'Rohan Gupta', template_id: 'tpl-2', template_name: 'Payment Reminder (3 days)', message_type: 'payment_reminder', message_body: 'Hi Rohan, your Combo Elite payment of ₹9900...', message_content: 'Hi Rohan, your Combo Elite payment of ₹9,900 is due on Feb 24, 2025.', status: 'sent', sent_at: '2025-02-21T09:00:00Z' },
    { id: 'wl-4', member_id: 'mem-5', member_name: 'Vikram Nair', template_id: 'tpl-3', template_name: 'Subscription Expiry Alert', message_type: 'subscription_expiry', message_body: 'Hi Vikram, your Basic Monthly subscription expires...', message_content: 'Hi Vikram, your Basic Monthly subscription expires in 7 days. Renew now!', status: 'read', sent_at: '2025-02-17T09:00:00Z', delivered_at: '2025-02-17T09:01:00Z' },
];


// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notifications: Notification[] = [
    { id: 'ntf-1', user_id: 'usr-admin', title: 'New Inquiry', message: 'Aditya Kumar walked in and is interested in Annual Elite package.', type: 'info', is_read: false, created_at: '2025-02-24T09:00:00Z' },
    { id: 'ntf-2', user_id: 'usr-admin', title: 'Payment Overdue', message: 'Rohan Gupta\'s payment of ₹9,900 is overdue by 4 days.', type: 'warning', is_read: false, created_at: '2025-02-24T08:00:00Z' },
    { id: 'ntf-3', user_id: 'usr-admin', title: 'Membership Expired', message: 'Rahul Mehta\'s Half-Yearly Fit membership has expired.', type: 'error', is_read: true, created_at: '2025-02-23T00:00:00Z' },
    { id: 'ntf-4', user_id: 'usr-admin', title: 'Payment Received', message: 'Meera Joshi paid ₹6,750 for Half-Yearly Fit.', type: 'success', is_read: true, created_at: '2025-02-15T08:35:00Z' },
];

// ─── DASHBOARD METRICS ────────────────────────────────────────────────────────
export const dashboardMetrics: DashboardMetrics = {
    total_active_members: 749,
    total_members: 812,
    monthly_revenue: 1319000,
    pending_payments: 49800,
    new_inquiries_week: 23,
    active_branches: 3,
    total_coaches: 4,
    expiring_soon: 12,
    revenue_trend: 8.4,
    member_trend: 5.2,
};

// ─── REVENUE TREND ────────────────────────────────────────────────────────────
export const revenueData: RevenueDataPoint[] = [
    { month: 'Mar \'24', revenue: 920000, expenses: 380000 },
    { month: 'Apr \'24', revenue: 980000, expenses: 390000 },
    { month: 'May \'24', revenue: 1050000, expenses: 410000 },
    { month: 'Jun \'24', revenue: 1120000, expenses: 420000 },
    { month: 'Jul \'24', revenue: 1090000, expenses: 435000 },
    { month: 'Aug \'24', revenue: 1180000, expenses: 445000 },
    { month: 'Sep \'24', revenue: 1210000, expenses: 460000 },
    { month: 'Oct \'24', revenue: 1190000, expenses: 450000 },
    { month: 'Nov \'24', revenue: 1240000, expenses: 470000 },
    { month: 'Dec \'24', revenue: 1310000, expenses: 490000 },
    { month: 'Jan \'25', revenue: 1280000, expenses: 480000 },
    { month: 'Feb \'25', revenue: 1319000, expenses: 497500 },
];

export const attendanceTrendData = [
    { date: 'Mon', count: 187 }, { date: 'Tue', count: 203 }, { date: 'Wed', count: 224 },
    { date: 'Thu', count: 198 }, { date: 'Fri', count: 215 }, { date: 'Sat', count: 276 }, { date: 'Sun', count: 142 },
];

export const packageDistribution = [
    { name: 'Annual Elite', value: 215, color: '#3B82F6' },
    { name: 'Quarterly Power', value: 134, color: '#10B981' },
    { name: 'Basic Monthly', value: 82, color: '#F59E0B' },
    { name: 'Half-Yearly', value: 98, color: '#8B5CF6' },
    { name: 'PT Package', value: 47, color: '#EC4899' },
    { name: 'Combo Elite', value: 29, color: '#FF6B35' },
];

export const branchComparison = [
    { branch: 'Andheri', members: 248, revenue: 412000, attendance: 78 },
    { branch: 'Bandra', members: 189, revenue: 318000, attendance: 71 },
    { branch: 'Powai', members: 312, revenue: 589000, attendance: 83 },
];

export const leadSources = [
    { name: 'Instagram', value: 32, color: '#EC4899' },
    { name: 'Walk-in', value: 28, color: '#3B82F6' },
    { name: 'Referral', value: 18, color: '#10B981' },
    { name: 'Website', value: 12, color: '#F59E0B' },
    { name: 'Facebook', value: 7, color: '#8B5CF6' },
    { name: 'Other', value: 3, color: '#6B7280' },
];
