import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('renders title, message, and buttons when open', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Empty Trash"
        message="All items in trash will be permanently deleted."
        confirmText="Empty Now"
        cancelText="Keep Items"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    expect(screen.getByText('Empty Trash')).toBeInTheDocument();
    expect(
      screen.getByText('All items in trash will be permanently deleted.'),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /empty now/i });
    const cancelBtn = screen.getByRole('button', { name: /keep items/i });

    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('closes modal when Escape key is pressed', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Confirmation"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
