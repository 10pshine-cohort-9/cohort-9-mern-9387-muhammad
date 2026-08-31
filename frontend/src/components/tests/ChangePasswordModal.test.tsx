import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangePasswordModal } from '../ChangePasswordModal';

describe('ChangePasswordModal Component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <ChangePasswordModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with password inputs when isOpen is true', () => {
    const handleClose = vi.fn();
    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Change Security Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter current password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter new password/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
