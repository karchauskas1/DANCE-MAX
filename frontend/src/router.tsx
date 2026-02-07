import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

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
import { Dashboard } from './admin/pages/Dashboard';
import { ScheduleMgmt } from './admin/pages/ScheduleMgmt';
import { Students } from './admin/pages/Students';
import { Bookings as AdminBookings } from './admin/pages/Bookings';
import { DirectionsCRUD } from './admin/pages/DirectionsCRUD';
import { TeachersCRUD } from './admin/pages/TeachersCRUD';
import { CoursesCRUD } from './admin/pages/CoursesCRUD';
import { PromosCRUD } from './admin/pages/PromosCRUD';
import { SubscriptionsCRUD } from './admin/pages/SubscriptionsCRUD';
import { Broadcast } from './admin/pages/Broadcast';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
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
    element: <AdminGuard><AdminShell /></AdminGuard>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'schedule', element: <ScheduleMgmt /> },
      { path: 'students', element: <Students /> },
      { path: 'bookings', element: <AdminBookings /> },
      { path: 'directions', element: <DirectionsCRUD /> },
      { path: 'teachers', element: <TeachersCRUD /> },
      { path: 'courses', element: <CoursesCRUD /> },
      { path: 'promos', element: <PromosCRUD /> },
      { path: 'subscriptions', element: <SubscriptionsCRUD /> },
      { path: 'broadcast', element: <Broadcast /> },
    ],
  },
]);
