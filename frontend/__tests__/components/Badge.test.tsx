import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../src/components/ui/Badge';

describe('Badge', () => {
  it('renders text content', () => {
    render(<Badge>Новое</Badge>);
    expect(screen.getByText('Новое')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    const { container } = render(<Badge>Тест</Badge>);
    expect(container.firstElementChild?.tagName).toBe('SPAN');
  });

  describe('variants', () => {
    it('renders with default variant', () => {
      render(<Badge variant="default">По умолчанию</Badge>);
      expect(screen.getByText('По умолчанию')).toBeInTheDocument();
    });

    it('renders with primary variant', () => {
      render(<Badge variant="primary">Основной</Badge>);
      expect(screen.getByText('Основной')).toBeInTheDocument();
    });

    it('renders with success variant', () => {
      render(<Badge variant="success">Успех</Badge>);
      expect(screen.getByText('Успех')).toBeInTheDocument();
    });

    it('renders with error variant', () => {
      render(<Badge variant="error">Ошибка</Badge>);
      expect(screen.getByText('Ошибка')).toBeInTheDocument();
    });

    it('renders with bachata variant', () => {
      render(<Badge variant="bachata">Бачата</Badge>);
      expect(screen.getByText('Бачата')).toBeInTheDocument();
    });

    it('renders with salsa variant', () => {
      render(<Badge variant="salsa">Сальса</Badge>);
      expect(screen.getByText('Сальса')).toBeInTheDocument();
    });

    it('renders with kizomba variant', () => {
      render(<Badge variant="kizomba">Кизомба</Badge>);
      expect(screen.getByText('Кизомба')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('renders with md size by default', () => {
      render(<Badge>Средний</Badge>);
      expect(screen.getByText('Средний')).toBeInTheDocument();
    });

    it('renders with sm size', () => {
      render(<Badge size="sm">Маленький</Badge>);
      expect(screen.getByText('Маленький')).toBeInTheDocument();
    });
  });

  describe('dot indicator', () => {
    it('does not render dot by default', () => {
      const { container } = render(<Badge>Без точки</Badge>);
      const badge = container.firstElementChild!;
      // Without dot, badge contains only text (no nested span for dot)
      expect(badge.children.length).toBe(0);
    });

    it('renders dot when dot prop is true', () => {
      const { container } = render(<Badge dot>С точкой</Badge>);
      const badge = container.firstElementChild!;
      // With dot, badge contains a span element for the dot
      const dotSpan = badge.querySelector('span');
      expect(dotSpan).toBeInTheDocument();
    });
  });
});
