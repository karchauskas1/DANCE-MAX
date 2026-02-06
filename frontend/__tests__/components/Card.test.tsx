import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../../src/components/ui/Card';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Содержимое карточки</Card>);
    expect(screen.getByText('Содержимое карточки')).toBeInTheDocument();
  });

  it('renders nested elements as children', () => {
    render(
      <Card>
        <h3>Заголовок</h3>
        <p>Описание занятия</p>
      </Card>,
    );
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
    expect(screen.getByText('Описание занятия')).toBeInTheDocument();
  });

  describe('variants', () => {
    it('renders with default variant as a div', () => {
      const { container } = render(<Card>По умолчанию</Card>);
      const cardEl = container.firstElementChild;
      expect(cardEl?.tagName).toBe('DIV');
    });

    it('renders with elevated variant as a div', () => {
      const { container } = render(<Card variant="elevated">Приподнятая</Card>);
      const cardEl = container.firstElementChild;
      expect(cardEl?.tagName).toBe('DIV');
      expect(screen.getByText('Приподнятая')).toBeInTheDocument();
    });

    it('renders with interactive variant as a button', () => {
      const { container } = render(<Card variant="interactive">Интерактивная</Card>);
      const cardEl = container.firstElementChild;
      expect(cardEl?.tagName).toBe('BUTTON');
      expect(screen.getByText('Интерактивная')).toBeInTheDocument();
    });
  });

  describe('click behavior', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Кликни</Card>);

      fireEvent.click(screen.getByText('Кликни'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick on interactive card', () => {
      const handleClick = vi.fn();
      render(
        <Card variant="interactive" onClick={handleClick}>
          Нажми
        </Card>,
      );

      fireEvent.click(screen.getByText('Нажми'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders without onClick handler', () => {
      render(<Card>Без обработчика</Card>);
      // Should render without errors
      expect(screen.getByText('Без обработчика')).toBeInTheDocument();
    });
  });

  it('accepts className prop', () => {
    const { container } = render(<Card className="custom-class">С классом</Card>);
    const cardEl = container.firstElementChild;
    expect(cardEl?.className).toContain('custom-class');
  });

  describe('padding', () => {
    it('renders with default md padding', () => {
      render(<Card>Обычный отступ</Card>);
      expect(screen.getByText('Обычный отступ')).toBeInTheDocument();
    });

    it('renders with sm padding', () => {
      render(<Card padding="sm">Маленький отступ</Card>);
      expect(screen.getByText('Маленький отступ')).toBeInTheDocument();
    });

    it('renders with lg padding', () => {
      render(<Card padding="lg">Большой отступ</Card>);
      expect(screen.getByText('Большой отступ')).toBeInTheDocument();
    });
  });
});
