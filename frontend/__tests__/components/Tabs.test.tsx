import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from '../../src/components/ui/Tabs';

vi.mock('framer-motion', async () => await import('../../__mocks__/framer-motion'));

describe('Tabs', () => {
  const tabLabels = ['Все', 'Hip-Hop', 'Contemporary', 'Stretching'];

  it('renders all tab items', () => {
    render(<Tabs tabs={tabLabels} activeIndex={0} onChange={vi.fn()} />);

    for (const label of tabLabels) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    }
  });

  it('renders tabs with correct role', () => {
    render(<Tabs tabs={tabLabels} activeIndex={0} onChange={vi.fn()} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(tabLabels.length);
  });

  it('marks the active tab with aria-selected', () => {
    render(<Tabs tabs={tabLabels} activeIndex={1} onChange={vi.fn()} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[3]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the correct index when a tab is clicked', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabLabels} activeIndex={0} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Contemporary' }));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange for each clicked tab', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabLabels} activeIndex={0} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Hip-Hop' }));
    expect(handleChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('tab', { name: 'Stretching' }));
    expect(handleChange).toHaveBeenCalledWith(3);

    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('updates active tab on rerender', () => {
    const { rerender } = render(
      <Tabs tabs={tabLabels} activeIndex={0} onChange={vi.fn()} />,
    );

    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');

    rerender(<Tabs tabs={tabLabels} activeIndex={2} onChange={vi.fn()} />);

    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'false');
    expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('renders with a single tab', () => {
    render(<Tabs tabs={['Единственная']} activeIndex={0} onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Единственная' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Единственная' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
