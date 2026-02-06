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
]);
