// Core entity types for FitCore Pro

export type UserRole = 'owner' | 'admin' | 'coach' | 'member' | 'front_desk';

export type MemberStatus = 'active' | 'inactive' | 'frozen' | 'expired';
export type SubscriptionStatus = 'active' | 'expired' | 'frozen' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'online';
export type InquiryStatus = 'new' | 'contacted' | 'follow-up' | 'converted' | 'lost';
export type InquirySource = 'walk-in' | 'phone' | 'website' | 'social' | 'referral' | 'other';
export type InterestLevel = 'hot' | 'warm' | 'cold';
export type PackageType = 'membership' | 'personal_training' | 'group_class' | 'combo';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type ExpenseCategory = 'equipment' | 'maintenance' | 'salaries' | 'utilities' | 'marketing' | 'other';
export type PipelineStage = 'new_lead' | 'contacted' | 'demo_scheduled' | 'negotiation' | 'won' | 'lost';
export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type WhatsAppTemplateType = 'welcome' | 'payment_reminder' | 'payment_due' | 'subscription_expiry' | 'birthday' | 'custom';

export interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    pincode?: string;
    phone: string;
    email: string;
    timezone?: string;
    opening_time?: string;
    closing_time?: string;
    is_active: boolean;
    capacity: number;
    facilities?: string[];
    member_count?: number; // legacy
    active_members: number;
    total_coaches: number;
    monthly_revenue: number;
    manager_name?: string;
    monthly_rent?: number;
    established_date?: string;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    last_login: string;
}

export interface Member {
    id: string;
    user_id?: string;
    branch_id: string;
    member_code: string;
    first_name: string;
    last_name: string;
    phone: string;
    emergency_contact: string;
    emergency_phone: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    address: string;
    profile_photo?: string;
    blood_group: string;
    medical_conditions: string;
    fitness_goals: string[];
    fitness_level: 'beginner' | 'intermediate' | 'advanced';
    joining_date: string;
    status: MemberStatus;
    referral_source: string;
    referred_by?: string;
    email: string;
    created_at: string;
    updated_at: string;
    // Computed/joined fields
    branch_name?: string;
    active_subscription?: Subscription;
    package_name?: string;
    days_remaining?: number;
    total_visits?: number;
}

export interface Package {
    id: string;
    branch_id?: string;
    package_name: string;
    description: string;
    duration_days: number;
    price: number;
    discounted_price?: number;
    features: string[];
    package_type: PackageType;
    max_freezes: number;
    freeze_days_allowed: number;
    is_active: boolean;
    member_count: number;
    created_at: string;
}

export interface Subscription {
    id: string;
    member_id: string;
    package_id: string;
    package_name?: string;
    start_date: string;
    end_date: string;
    status: SubscriptionStatus;
    freeze_start?: string;
    freeze_end?: string;
    freeze_reason?: string;
    auto_renew: boolean;
    created_at: string;
}

export interface AttendanceRecord {
    id: string;
    member_id: string;
    member_name?: string;
    member_code?: string;
    member_photo?: string;
    branch_id: string;
    check_in_time?: string;
    check_out_time?: string;
    // Alias fields for AttendancePage
    check_in?: string;
    check_out?: string | null;
    date: string;
    status: AttendanceStatus;
    source?: 'manual' | 'app' | 'kiosk';
    notes?: string;
    duration_minutes?: number;
    marked_by?: string;
}

export interface Coach {
    id: string;
    user_id?: string;
    branch_id: string;
    branch_name?: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    specialization: string[];
    specializations: string[]; // alias
    certifications: { name: string; org: string; year: number }[] | string[];
    experience_years: number;
    hourly_rate: number;
    salary?: number;
    profile_photo?: string;
    bio?: string;
    designation?: string;
    rating: number;
    total_reviews: number;
    active_members: number;
    availability: Record<string, { start: string; end: string }[]>;
    is_active: boolean;
    total_sessions?: number;
    created_at: string;
}

export interface PTSession {
    id: string;
    member_id: string;
    member_name?: string;
    coach_id: string;
    coach_name?: string;
    session_date: string;
    session_time: string;
    duration_minutes: number;
    status: SessionStatus;
    notes?: string;
    post_session_notes?: string;
    created_at: string;
}

export interface Payment {
    id: string;
    member_id: string;
    member_name?: string;
    branch_id: string;
    branch_name?: string;
    package_id?: string;
    subscription_id?: string;
    amount: number;
    payment_method?: PaymentMethod;
    payment_mode?: PaymentMode; // alias for payment_method
    payment_status: PaymentStatus;
    transaction_id?: string;
    payment_date: string;
    due_date?: string;
    invoice_number: string;
    notes?: string;
    package_name?: string;
    created_at: string;
}

export type PaymentMode = PaymentMethod;

export interface Expense {
    id: string;
    branch_id: string;
    branch_name?: string;
    category: ExpenseCategory;
    amount: number;
    description: string;
    expense_date: string;
    receipt_url?: string;
    added_by: string;
    created_at: string;
}

export interface Inquiry {
    id: string;
    branch_id: string;
    branch_name?: string;
    full_name: string;
    phone: string;
    email?: string;
    source: InquirySource;
    interest_level: InterestLevel;
    interested_package?: string;
    notes: string;
    assigned_to?: string;
    assigned_name?: string;
    status: InquiryStatus;
    follow_up_date?: string;
    converted_to_member?: string;
    created_at: string;
    updated_at: string;
    // Pipeline stage
    pipeline_stage?: PipelineStage;
    pipeline_value?: number;
    days_in_stage?: number;
}

export interface WhatsAppTemplate {
    id: string;
    template_name: string;
    template_type: WhatsAppTemplateType;
    category?: string;
    message_body?: string;
    content?: string; // alias
    variables?: string[];
    trigger_event?: string;
    delay_hours?: number;
    total_sent?: number;
    total_delivered?: number;
    is_active: boolean;
    created_at: string;
}

export interface WhatsAppLog {
    id: string;
    member_id: string;
    member_name?: string;
    template_id?: string;
    template_name?: string;
    message_type?: string;
    message_body?: string;
    message_content?: string; // alias
    status: WhatsAppMessageStatus;
    sent_at: string;
    delivered_at?: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    is_read: boolean;
    created_at: string;
}

export interface DashboardMetrics {
    total_active_members: number;
    total_members: number;
    monthly_revenue: number;
    pending_payments: number;
    new_inquiries_week: number;
    active_branches: number;
    total_coaches: number;
    expiring_soon: number;
    revenue_trend: number; // % change
    member_trend: number;
}

export interface RevenueDataPoint {
    month: string;
    revenue: number;
    expenses: number;
}

export interface AttendanceDataPoint {
    date: string;
    count: number;
}

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    branch_id?: string;
    branch_name?: string;
    member_id?: string;
    member_code?: string;
    profile_photo?: string;
}
