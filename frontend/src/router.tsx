import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { ErrorBoundaryFallback } from './components/ErrorBoundary';

import Home from './pages/Home/Home';
import Schedule from './pages/Schedule/Schedule';
import Lesson from './pages/Lesson/Lesson';
import Directions from './pages/Directions/Directions';
import Direction from './pages/Direction/Direction';
import Teachers from './pages/Teachers/Teachers';
import Teacher from './pages/Teacher/Teacher';
import Courses from './pages/Courses/Courses';
import Course from './pages/Course/Course';
import Groups from './pages/Groups/Groups';
import Promotions from './pages/Promotions/Promotions';
import Profile from './pages/Profile/Profile';
import Bookings from './pages/Bookings/Bookings';
import History from './pages/History/History';
import Payment from './pages/Payment/Payment';
import About from './pages/About/About';

import AdminGuard from './admin/components/AdminGuard';
import AdminShell from './admin/components/AdminShell';

// ---- Lazy-loaded admin pages (bundle splitting) ----
const Dashboard = lazy(() => import('./admin/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ScheduleMgmt = lazy(() => import('./admin/pages/ScheduleMgmt').then(m => ({ default: m.ScheduleMgmt })));
const Students = lazy(() => import('./admin/pages/Students').then(m => ({ default: m.Students })));
const AdminBookings = lazy(() => import('./admin/pages/Bookings').then(m => ({ default: m.Bookings })));
const DirectionsCRUD = lazy(() => import('./admin/pages/DirectionsCRUD').then(m => ({ default: m.DirectionsCRUD })));
const TeachersCRUD = lazy(() => import('./admin/pages/TeachersCRUD').then(m => ({ default: m.TeachersCRUD })));
const CoursesCRUD = lazy(() => import('./admin/pages/CoursesCRUD').then(m => ({ default: m.CoursesCRUD })));
const PromosCRUD = lazy(() => import('./admin/pages/PromosCRUD').then(m => ({ default: m.PromosCRUD })));
const SubscriptionsCRUD = lazy(() => import('./admin/pages/SubscriptionsCRUD').then(m => ({ default: m.SubscriptionsCRUD })));
const Broadcast = lazy(() => import('./admin/pages/Broadcast').then(m => ({ default: m.Broadcast })));

/** Skeleton placeholder while admin pages load */
function AdminSkeleton() {
  return (
    <div style={{ padding: '24px 16px' }}>
      <div
        style={{
          height: 24,
          width: 160,
          borderRadius: 8,
          background: 'var(--color-gray-200, #E5E5E5)',
          marginBottom: 20,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 14,
          width: 100,
          borderRadius: 6,
          background: 'var(--color-gray-100, #F5F5F5)',
          marginBottom: 28,
        }}
      />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 80,
            borderRadius: 12,
            background: 'var(--color-gray-100, #F5F5F5)',
            marginBottom: 12,
          }}
        />
      ))}
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorBoundaryFallback />,
    children: [
      { index: true, element: <Home /> },
      { path: 'schedule', element: <Schedule /> },
      { path: 'lesson/:id', element: <Lesson /> },
      { path: 'directions', element: <Directions /> },
      { path: 'direction/:slug', element: <Direction /> },
      { path: 'teachers', element: <Teachers /> },
      { path: 'teacher/:slug', element: <Teacher /> },
      { path: 'courses', element: <Courses /> },
      { path: 'course/:id', element: <Course /> },
      { path: 'groups', element: <Groups /> },
      { path: 'promotions', element: <Promotions /> },
      { path: 'profile', element: <Profile /> },
      { path: 'bookings', element: <Bookings /> },
      { path: 'history', element: <History /> },
      { path: 'payment', element: <Payment /> },
      { path: 'about', element: <About /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminShell />
      </AdminGuard>
    ),
    errorElement: <ErrorBoundaryFallback />,
    children: [
      {
        index: true,
        element: <Suspense fallback={<AdminSkeleton />}><Dashboard /></Suspense>,
      },
      {
        path: 'schedule',
        element: <Suspense fallback={<AdminSkeleton />}><ScheduleMgmt /></Suspense>,
      },
      {
        path: 'students',
        element: <Suspense fallback={<AdminSkeleton />}><Students /></Suspense>,
      },
      {
        path: 'bookings',
        element: <Suspense fallback={<AdminSkeleton />}><AdminBookings /></Suspense>,
      },
      {
        path: 'directions',
        element: <Suspense fallback={<AdminSkeleton />}><DirectionsCRUD /></Suspense>,
      },
      {
        path: 'teachers',
        element: <Suspense fallback={<AdminSkeleton />}><TeachersCRUD /></Suspense>,
      },
      {
        path: 'courses',
        element: <Suspense fallback={<AdminSkeleton />}><CoursesCRUD /></Suspense>,
      },
      {
        path: 'promos',
        element: <Suspense fallback={<AdminSkeleton />}><PromosCRUD /></Suspense>,
      },
      {
        path: 'subscriptions',
        element: <Suspense fallback={<AdminSkeleton />}><SubscriptionsCRUD /></Suspense>,
      },
      {
        path: 'broadcast',
        element: <Suspense fallback={<AdminSkeleton />}><Broadcast /></Suspense>,
      },
    ],
  },
]);
