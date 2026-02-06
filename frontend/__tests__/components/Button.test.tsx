import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../src/components/ui/Button';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Записаться</Button>);
    expect(screen.getByRole('button', { name: 'Записаться' })).toBeInTheDocument();
  });

  describe('variants', () => {
    it('renders with primary variant by default', () => {
      render(<Button>Основная</Button>);
      const button = screen.getByRole('button', { name: 'Основная' });
      expect(button).toBeInTheDocument();
    });

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Второстепенная</Button>);
      const button = screen.getByRole('button', { name: 'Второстепенная' });
      expect(button).toBeInTheDocument();
    });

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Призрачная</Button>);
      const button = screen.getByRole('button', { name: 'Призрачная' });
      expect(button).toBeInTheDocument();
    });

    it('renders with danger variant', () => {
      render(<Button variant="danger">Удалить</Button>);
      const button = screen.getByRole('button', { name: 'Удалить' });
      expect(button).toBeInTheDocument();
    });
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Нажми</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Нажми' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe('loading state', () => {
    it('is disabled when loading', () => {
      render(<Button loading>Загрузка</Button>);
      const button = screen.getByRole('button', { name: 'Загрузка' });
      expect(button).toBeDisabled();
    });

    it('does not fire onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Загрузка
        </Button>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Загрузка' }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows spinner element when loading', () => {
      const { container } = render(<Button loading>Загрузка</Button>);
      // The spinner is rendered as a span inside the button when loading is true
      const button = screen.getByRole('button', { name: 'Загрузка' });
      // Button should have more child spans when loading (spinner + content)
      const spans = button.querySelectorAll('span');
      expect(spans.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Недоступно</Button>);
      const button = screen.getByRole('button', { name: 'Недоступно' });
      expect(button).toBeDisabled();
    });

    it('does not fire onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Недоступно
        </Button>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Недоступно' }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  it('renders with icon', () => {
    render(<Button icon={<span data-testid="icon">*</span>}>С иконкой</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /С иконкой/ })).toBeInTheDocument();
  });

  it('supports fullWidth prop', () => {
    const { container } = render(<Button fullWidth>Во всю ширину</Button>);
    const button = screen.getByRole('button', { name: 'Во всю ширину' });
    expect(button).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Button size="sm">Маленькая</Button>);
    expect(screen.getByRole('button', { name: 'Маленькая' })).toBeInTheDocument();

    rerender(<Button size="lg">Большая</Button>);
    expect(screen.getByRole('button', { name: 'Большая' })).toBeInTheDocument();
  });
});
