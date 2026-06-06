import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Spin } from 'antd';
import { useAuthStore } from './stores/authStore';
import { useUserStore } from './stores/userStore';
import { GuestRoute } from './routes/GuestRoute';
import { AuthRoute } from './routes/AuthRoute';
import { LauncherRoute } from './routes/LauncherRoute';
import { AdminRoute } from './routes/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import MemberLayout from './layouts/MemberLayout';
import LauncherLayout from './layouts/LauncherLayout';
import AdminLayout from './layouts/AdminLayout';

// Core pages (loaded eagerly for initial render)
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Lazy-loaded pages
const ActivitiesPage = lazy(() => import('./pages/public/ActivitiesPage'));
const ActivityDetailPage = lazy(() => import('./pages/public/ActivityDetailPage'));
const RewardsPage = lazy(() => import('./pages/public/RewardsPage'));
const MemberHomePage = lazy(() => import('./pages/member/MemberHomePage'));
const EditProfilePage = lazy(() => import('./pages/member/EditProfilePage'));
const RegistrationsPage = lazy(() => import('./pages/member/RegistrationsPage'));
const LauncherApplyPage = lazy(() => import('./pages/member/LauncherApplyPage'));
const PointsPage = lazy(() => import('./pages/member/PointsPage'));
const OrdersPage = lazy(() => import('./pages/member/OrdersPage'));
const LauncherActivitiesPage = lazy(() => import('./pages/launcher/LauncherActivitiesPage'));
const CreateActivityPage = lazy(() => import('./pages/launcher/CreateActivityPage'));
const EditActivityPage = lazy(() => import('./pages/launcher/EditActivityPage'));
const RegistrationManagePage = lazy(() => import('./pages/launcher/RegistrationManagePage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ReviewPage = lazy(() => import('./pages/admin/ReviewPage'));
const MembersPage = lazy(() => import('./pages/admin/MembersPage'));
const MemberDetailPage = lazy(() => import('./pages/admin/MemberDetailPage'));
const RewardsManagePage = lazy(() => import('./pages/admin/RewardsManagePage'));
const PointRulesPage = lazy(() => import('./pages/admin/PointRulesPage'));
const PointTransactionsPage = lazy(() => import('./pages/admin/PointTransactionsPage'));
const LevelsPage = lazy(() => import('./pages/admin/LevelsPage'));

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <Spin size="large" />
    </div>
  );
}

function Bootstrap({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useUserStore((s) => s.isLoading);
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    } else if (!isAuthenticated) {
      clearUser();
    }
  }, [isAuthenticated, user, fetchUser, clearUser]);

  if (isAuthenticated && isLoading && !user) {
    return <Loading />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Bootstrap>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/activities" element={<GuestRoute><ActivitiesPage /></GuestRoute>} />
            <Route path="/activities/:id" element={<GuestRoute><ActivityDetailPage /></GuestRoute>} />
            <Route path="/rewards" element={<GuestRoute><RewardsPage /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          </Route>

          {/* Member routes */}
          <Route element={<AuthRoute><MemberLayout /></AuthRoute>}>
            <Route path="/me" element={<MemberHomePage />} />
            <Route path="/me/edit" element={<EditProfilePage />} />
            <Route path="/me/registrations" element={<RegistrationsPage />} />
            <Route path="/me/launcher-apply" element={<LauncherApplyPage />} />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>

          {/* Launcher routes */}
          <Route element={<LauncherRoute><LauncherLayout /></LauncherRoute>}>
            <Route path="/launcher/activities" element={<LauncherActivitiesPage />} />
            <Route path="/launcher/activities/create" element={<CreateActivityPage />} />
            <Route path="/launcher/activities/:id/edit" element={<EditActivityPage />} />
            <Route path="/launcher/activities/:id/registrations" element={<RegistrationManagePage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/review" element={<ReviewPage />} />
            <Route path="/admin/members" element={<MembersPage />} />
            <Route path="/admin/members/:id" element={<MemberDetailPage />} />
            <Route path="/admin/rewards" element={<RewardsManagePage />} />
            <Route path="/admin/points/rules" element={<PointRulesPage />} />
            <Route path="/admin/points/transactions" element={<PointTransactionsPage />} />
            <Route path="/admin/levels" element={<LevelsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Bootstrap>
  );
}
