import { createBrowserRouter } from 'react-router-dom';
import { AdminShell } from './components/layout/AdminShell';
import { Dashboard } from './pages/Dashboard';
import { ScheduleMgmt } from './pages/ScheduleMgmt';
import { Students } from './pages/Students';
import { Bookings } from './pages/Bookings';
import { DirectionsCRUD } from './pages/DirectionsCRUD';
import { TeachersCRUD } from './pages/TeachersCRUD';
import { CoursesCRUD } from './pages/CoursesCRUD';
import { PromosCRUD } from './pages/PromosCRUD';
import { SubscriptionsCRUD } from './pages/SubscriptionsCRUD';
import { Broadcast } from './pages/Broadcast';
import { Login } from './pages/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AdminShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'schedule', element: <ScheduleMgmt /> },
      { path: 'students', element: <Students /> },
      { path: 'bookings', element: <Bookings /> },
      { path: 'directions', element: <DirectionsCRUD /> },
      { path: 'teachers', element: <TeachersCRUD /> },
      { path: 'courses', element: <CoursesCRUD /> },
      { path: 'promos', element: <PromosCRUD /> },
      { path: 'subscriptions', element: <SubscriptionsCRUD /> },
      { path: 'broadcast', element: <Broadcast /> },
    ],
  },
]);
