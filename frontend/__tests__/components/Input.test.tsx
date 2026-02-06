import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../../src/components/ui/Input';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));

describe('Input', () => {
  const defaultProps = {
    label: 'Имя',
    value: '',
    onChange: vi.fn(),
  };

  it('renders the input element', () => {
    render(<Input {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<Input {...defaultProps} />);
    expect(screen.getByText('Имя')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor/id', () => {
    render(<Input {...defaultProps} />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Имя');
    expect(label).toHaveAttribute('for', input.id);
  });

  describe('value handling', () => {
    it('displays the provided value', () => {
      render(<Input {...defaultProps} value="Иван" />);
      expect(screen.getByRole('textbox')).toHaveValue('Иван');
    });

    it('calls onChange when user types', () => {
      const handleChange = vi.fn();
      render(<Input {...defaultProps} onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'А' },
      });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('passes the change event to onChange', () => {
      const handleChange = vi.fn();
      render(<Input {...defaultProps} onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Тест' },
      });

      expect(handleChange).toHaveBeenCalled();
      const event = handleChange.mock.calls[0][0];
      expect(event).toHaveProperty('target');
    });
  });

  describe('error state', () => {
    it('shows error message when error prop is provided', () => {
      render(<Input {...defaultProps} error="Обязательное поле" />);
      expect(screen.getByText('Обязательное поле')).toBeInTheDocument();
    });

    it('does not show error message when error prop is absent', () => {
      render(<Input {...defaultProps} />);
      expect(screen.queryByText('Обязательное поле')).not.toBeInTheDocument();
    });

    it('renders error text in a span element', () => {
      render(<Input {...defaultProps} error="Некорректный формат" />);
      const errorEl = screen.getByText('Некорректный формат');
      expect(errorEl.tagName).toBe('SPAN');
    });
  });

  describe('floating label', () => {
    it('uses label as placeholder when no placeholder is given', () => {
      render(<Input {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Имя');
    });

    it('uses custom placeholder when provided', () => {
      render(<Input {...defaultProps} placeholder="Введите имя" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Введите имя');
    });
  });

  it('supports different input types', () => {
    render(<Input {...defaultProps} type="email" label="Email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders icon when provided', () => {
    render(
      <Input
        {...defaultProps}
        icon={<span data-testid="input-icon">@</span>}
      />,
    );
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });

  it('has autocomplete off', () => {
    render(<Input {...defaultProps} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'off');
  });
});
