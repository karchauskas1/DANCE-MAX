import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../../src/pages/Profile/Profile';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));
vi.mock('@twa-dev/sdk', async () => await import('../../__mocks__/@twa-dev/sdk'));
vi.mock('@react-spring/web', async () => await import('../../__mocks__/@react-spring/web'));

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );
}

describe('Profile page', () => {
  describe('user info', () => {
    it('renders user name', () => {
      renderProfile();
      expect(screen.getByText('Иван Петров')).toBeInTheDocument();
    });
  });

  describe('balance card', () => {
    it('renders balance label', () => {
      renderProfile();
      expect(screen.getByText('Баланс')).toBeInTheDocument();
    });

    it('renders balance value with currency', () => {
      renderProfile();
      // mockUser.balance is 2400 → "2 400 руб." (with non-breaking space from toLocaleString)
      expect(screen.getByText(/2[\s\u00a0]?400 руб\./)).toBeInTheDocument();
    });
  });

  describe('subscription section', () => {
    it('renders subscription section title', () => {
      renderProfile();
      expect(screen.getByText('Активный абонемент')).toBeInTheDocument();
    });

    it('renders subscription plan name', () => {
      renderProfile();
      expect(screen.getByText('Абонемент на 8 занятий')).toBeInTheDocument();
    });

    it('renders remaining lessons count', () => {
      renderProfile();
      expect(screen.getByText(/Осталось: 5 занятий/)).toBeInTheDocument();
    });
  });

  describe('navigation links (quick menu)', () => {
    it('renders the menu section title', () => {
      renderProfile();
      expect(screen.getByText('Меню')).toBeInTheDocument();
    });

    it('renders "Мои записи" link', () => {
      renderProfile();
      const link = screen.getByText('Мои записи').closest('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/bookings');
    });

    it('renders "История" link', () => {
      renderProfile();
      const link = screen.getByText('История').closest('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/history');
    });

    it('renders "Оплата" link', () => {
      renderProfile();
      const link = screen.getByText('Оплата').closest('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/payment');
    });

    it('renders "О студии" link', () => {
      renderProfile();
      const link = screen.getByText('О студии').closest('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('renders all four quick links', () => {
      renderProfile();
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(4);
    });
  });
});
