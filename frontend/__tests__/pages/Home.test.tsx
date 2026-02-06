import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/pages/Home/Home';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));
vi.mock('@twa-dev/sdk', async () => await import('../../__mocks__/@twa-dev/sdk'));
vi.mock('@react-spring/web', async () => await import('../../__mocks__/@react-spring/web'));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe('Home page', () => {
  describe('hero section', () => {
    it('renders the welcome title', () => {
      renderHome();
      expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      renderHome();
      expect(screen.getByText('Готовы танцевать?')).toBeInTheDocument();
    });
  });

  describe('today\'s lessons', () => {
    it('renders the section header', () => {
      renderHome();
      expect(screen.getByText('Занятия сегодня')).toBeInTheDocument();
    });

    it('renders lesson titles', () => {
      renderHome();
      expect(screen.getByText('Hip-Hop Начинающие')).toBeInTheDocument();
      expect(screen.getAllByText('Contemporary').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Stretching').length).toBeGreaterThanOrEqual(1);
    });

    it('renders lesson times', () => {
      renderHome();
      expect(screen.getByText('18:00')).toBeInTheDocument();
      expect(screen.getByText('19:00')).toBeInTheDocument();
      expect(screen.getByText('20:00')).toBeInTheDocument();
    });

    it('renders lesson teachers', () => {
      renderHome();
      expect(screen.getByText('Алексей')).toBeInTheDocument();
      expect(screen.getByText('Мария')).toBeInTheDocument();
      expect(screen.getByText('Ольга')).toBeInTheDocument();
    });
  });

  describe('directions scroll', () => {
    it('renders the directions section header', () => {
      renderHome();
      expect(screen.getByText('Направления')).toBeInTheDocument();
    });

    it('renders direction names', () => {
      renderHome();
      expect(screen.getByText('Hip-Hop')).toBeInTheDocument();
      // 'Contemporary' and 'Stretching' already asserted above;
      // check the unique ones for this section
      expect(screen.getByText('Vogue')).toBeInTheDocument();
      expect(screen.getByText('Dancehall')).toBeInTheDocument();
    });
  });

  describe('teachers section', () => {
    it('renders the teachers section header', () => {
      renderHome();
      expect(screen.getByText('Преподаватели')).toBeInTheDocument();
    });

    it('renders teacher names', () => {
      renderHome();
      expect(screen.getByText('Алексей К.')).toBeInTheDocument();
      expect(screen.getByText('Мария С.')).toBeInTheDocument();
      expect(screen.getByText('Ольга П.')).toBeInTheDocument();
      expect(screen.getByText('Дмитрий В.')).toBeInTheDocument();
    });
  });
});
