import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Schedule from '../../src/pages/Schedule/Schedule';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));
vi.mock('@twa-dev/sdk', async () => await import('../../__mocks__/@twa-dev/sdk'));
vi.mock('@react-spring/web', async () => await import('../../__mocks__/@react-spring/web'));

function renderSchedule() {
  return render(
    <MemoryRouter>
      <Schedule />
    </MemoryRouter>,
  );
}

describe('Schedule page', () => {
  it('renders the page title', () => {
    renderSchedule();
    expect(screen.getByText('Расписание')).toBeInTheDocument();
  });

  describe('day picker', () => {
    it('renders all day abbreviations', () => {
      renderSchedule();
      expect(screen.getByText('Пн')).toBeInTheDocument();
      expect(screen.getByText('Вт')).toBeInTheDocument();
      expect(screen.getByText('Ср')).toBeInTheDocument();
      expect(screen.getByText('Чт')).toBeInTheDocument();
      expect(screen.getByText('Пт')).toBeInTheDocument();
      expect(screen.getByText('Сб')).toBeInTheDocument();
      expect(screen.getByText('Вс')).toBeInTheDocument();
    });

    it('renders day buttons', () => {
      renderSchedule();
      // 7 day buttons + filter chip buttons + lesson cards are in the document
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('filter chips', () => {
    it('renders all filter options', () => {
      renderSchedule();
      expect(screen.getByText('Все')).toBeInTheDocument();
      // Note: 'Hip-Hop' also appears in lesson titles, so use getAllByText
      expect(screen.getAllByText(/Hip-Hop/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Contemporary/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Stretching/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Vogue/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('lesson list', () => {
    it('renders lesson times', () => {
      renderSchedule();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('12:00')).toBeInTheDocument();
      expect(screen.getByText('14:00')).toBeInTheDocument();
      expect(screen.getByText('16:00')).toBeInTheDocument();
      expect(screen.getByText('18:00')).toBeInTheDocument();
    });

    it('renders lesson titles', () => {
      renderSchedule();
      expect(screen.getAllByText('Stretching').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Hip-Hop Начинающие')).toBeInTheDocument();
      expect(screen.getAllByText('Contemporary').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Vogue').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Hip-Hop Продвинутые')).toBeInTheDocument();
    });

    it('renders teacher names in lesson cards', () => {
      renderSchedule();
      expect(screen.getAllByText(/Ольга П\./).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Алексей К\./).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Мария С\./).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Дмитрий В\./).length).toBeGreaterThanOrEqual(1);
    });

    it('renders available spots with Russian text', () => {
      renderSchedule();
      expect(screen.getByText('5 мест')).toBeInTheDocument();
      expect(screen.getByText('3 мест')).toBeInTheDocument();
      expect(screen.getByText('8 мест')).toBeInTheDocument();
      expect(screen.getByText('2 мест')).toBeInTheDocument();
      expect(screen.getByText('6 мест')).toBeInTheDocument();
    });

    it('renders room information', () => {
      renderSchedule();
      // Rooms are rendered inline with teacher: "Алексей К. · Зал 2"
      expect(screen.getAllByText(/Зал 1/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Зал 2/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
