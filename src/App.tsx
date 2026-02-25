import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BranchProvider } from './contexts/BranchContext';
import { ToastProvider } from './components/ui/Toast';

// Auth pages
import { LandingPage } from './pages/auth/LandingPage';
import { AdminLoginPage, MemberLoginPage } from './pages/auth/LoginPages';

// Layout
import { AdminLayout } from './components/layout/AdminLayout';
import { MemberLayout } from './components/layout/MemberLayout';

// Admin pages
import { DashboardPage } from './pages/admin/DashboardPage';
import { InquiriesPage } from './pages/admin/InquiriesPage';
import { MembersPage } from './pages/admin/MembersPage';
import { PackagesPage } from './pages/admin/PackagesPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { CoachesPage } from './pages/admin/CoachesPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { WhatsAppPage } from './pages/admin/WhatsAppPage';
import { BranchesPage } from './pages/admin/BranchesPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Member pages
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { MemberSubscriptionPage, MemberAttendancePage, MemberProfilePage } from './pages/member/MemberPortalPages';

// Route Guards
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (user.role === 'member') return <Navigate to="/member" replace />;
    return <>{children}</>;
};

const MemberRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (user.role !== 'member') return <Navigate to="/admin" replace />;
    return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (user?.role === 'member') return <Navigate to="/member" replace />;
    if (user) return <Navigate to="/admin" replace />;
    return <>{children}</>;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
            <Route path="/admin/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
            <Route path="/member-login" element={<PublicRoute><MemberLoginPage /></PublicRoute>} />
            <Route path="/member/login" element={<PublicRoute><MemberLoginPage /></PublicRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><DashboardPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/inquiries" element={<AdminRoute><AdminLayout><InquiriesPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/members" element={<AdminRoute><AdminLayout><MembersPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/packages" element={<AdminRoute><AdminLayout><PackagesPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/attendance" element={<AdminRoute><AdminLayout><AttendancePage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/coaches" element={<AdminRoute><AdminLayout><CoachesPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><AdminLayout><PaymentsPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AnalyticsPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/whatsapp" element={<AdminRoute><AdminLayout><WhatsAppPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/branches" element={<AdminRoute><AdminLayout><BranchesPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminLayout><SettingsPage /></AdminLayout></AdminRoute>} />

            {/* Member */}
            <Route path="/member" element={<MemberRoute><MemberLayout><MemberDashboardPage /></MemberLayout></MemberRoute>} />
            <Route path="/member/subscription" element={<MemberRoute><MemberLayout><MemberSubscriptionPage /></MemberLayout></MemberRoute>} />
            <Route path="/member/attendance" element={<MemberRoute><MemberLayout><MemberAttendancePage /></MemberLayout></MemberRoute>} />
            <Route path="/member/profile" element={<MemberRoute><MemberLayout><MemberProfilePage /></MemberLayout></MemberRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <BranchProvider>
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </BranchProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
