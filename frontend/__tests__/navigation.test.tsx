import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Home from '../src/pages/Home/Home';
import Schedule from '../src/pages/Schedule/Schedule';
import Profile from '../src/pages/Profile/Profile';

vi.mock('framer-motion', async () => await import('../__mocks__/framer-motion'));
vi.mock('@twa-dev/sdk', async () => await import('../__mocks__/@twa-dev/sdk'));
vi.mock('@react-spring/web', async () => await import('../__mocks__/@react-spring/web'));

// Mock the auth store to avoid issues with Header component
vi.mock('../src/store/auth', () => ({
  useAuthStore: () => null,
}));

/**
 * Create a minimal layout with navigation links matching the app's BottomNav,
 * plus an Outlet for the matched route. We avoid using the real AppShell
 * because it depends on many sub-components; instead we reproduce
 * only the navigation links we need to test.
 */
function createTestRouter(initialPath = '/') {
  const { Outlet, Link } = require('react-router-dom');

  function TestLayout() {
    return (
      <div>
        <nav>
          <Link to="/">Главная</Link>
          <Link to="/schedule">Расписание</Link>
          <Link to="/profile">Профиль</Link>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return createMemoryRouter(
    [
      {
        path: '/',
        element: <TestLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'schedule', element: <Schedule /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
}

describe('Navigation', () => {
  it('renders the Home page at root path', () => {
    const router = createTestRouter('/');
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();
  });

  it('renders the Schedule page at /schedule', () => {
    const router = createTestRouter('/schedule');
    render(<RouterProvider router={router} />);

    expect(screen.getAllByText(/Расписание/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Profile page at /profile', () => {
    const router = createTestRouter('/profile');
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Иван Петров')).toBeInTheDocument();
  });

  it('navigates from Home to Schedule when clicking link', async () => {
    const router = createTestRouter('/');
    render(<RouterProvider router={router} />);

    // Verify we start on Home
    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();

    // Click the Schedule navigation link
    const scheduleLinks = screen.getAllByText('Расписание');
    // Pick the nav link (the first one, which is in our TestLayout nav)
    fireEvent.click(scheduleLinks[0]);

    await waitFor(() => {
      // Schedule page renders lesson times
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });
  });

  it('navigates from Home to Profile when clicking link', async () => {
    const router = createTestRouter('/');
    render(<RouterProvider router={router} />);

    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();

    const profileLinks = screen.getAllByText('Профиль');
    fireEvent.click(profileLinks[0]);

    await waitFor(() => {
      expect(screen.getByText('Иван Петров')).toBeInTheDocument();
    });
  });

  it('navigates from Schedule to Home when clicking link', async () => {
    const router = createTestRouter('/schedule');
    render(<RouterProvider router={router} />);

    // Currently on Schedule
    expect(screen.getByText('10:00')).toBeInTheDocument();

    const homeLinks = screen.getAllByText('Главная');
    fireEvent.click(homeLinks[0]);

    await waitFor(() => {
      expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();
    });
  });

  it('navigates through multiple pages sequentially', async () => {
    const router = createTestRouter('/');
    render(<RouterProvider router={router} />);

    // Start on Home
    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();

    // Go to Schedule
    fireEvent.click(screen.getAllByText('Расписание')[0]);
    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    // Go to Profile
    fireEvent.click(screen.getAllByText('Профиль')[0]);
    await waitFor(() => {
      expect(screen.getByText('Иван Петров')).toBeInTheDocument();
    });

    // Go back to Home
    fireEvent.click(screen.getAllByText('Главная')[0]);
    await waitFor(() => {
      expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();
    });
  });
});
