import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../src/components/ui/Modal';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Подтверждение',
    children: <p>Вы уверены?</p>,
  };

  it('renders children when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Вы уверены?')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Подтверждение')).toBeInTheDocument();
  });

  it('renders with role="dialog"', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('does not render content when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Вы уверены?')).not.toBeInTheDocument();
  });

  describe('closing behavior', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      // The backdrop is the outer motion.div wrapping the modal
      // We click the backdrop element (the one with onClick={onClose})
      const dialog = screen.getByRole('dialog');
      const backdrop = dialog.parentElement!;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when modal content is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      // Clicking on the dialog itself should not close (stopPropagation)
      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose on Escape when modal is closed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} isOpen={false} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('opens and closes correctly on prop changes', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Тест">
        <p>Содержимое</p>
      </Modal>,
    );

    expect(screen.queryByText('Содержимое')).not.toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={onClose} title="Тест">
        <p>Содержимое</p>
      </Modal>,
    );

    expect(screen.getByText('Содержимое')).toBeInTheDocument();

    rerender(
      <Modal isOpen={false} onClose={onClose} title="Тест">
        <p>Содержимое</p>
      </Modal>,
    );

    expect(screen.queryByText('Содержимое')).not.toBeInTheDocument();
  });

  it('renders without title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Без заголовка</p>
      </Modal>,
    );
    expect(screen.getByText('Без заголовка')).toBeInTheDocument();
  });
});
