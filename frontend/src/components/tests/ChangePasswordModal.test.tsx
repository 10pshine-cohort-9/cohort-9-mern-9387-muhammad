import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordModal } from '../ChangePasswordModal';
import * as api from '../../services/api';

describe('ChangePasswordModal Component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <ChangePasswordModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with password inputs and handles cancellation', () => {
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

  it('validates password mismatch and successfully updates on correct input', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchAPI').mockResolvedValue({
      success: true,
      message: 'Password updated successfully',
    } as any);
    const handleClose = vi.fn();

    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    const currentInput = screen.getByPlaceholderText(/enter current password/i);
    const newInput = screen.getByPlaceholderText(/at least 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/re-enter new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    // Test mismatch
    fireEvent.change(currentInput, { target: { value: 'current123' } });
    fireEvent.change(newInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'mismatch123' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/new passwords do not match/i)).toBeInTheDocument();

    // Test correct match
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/auth/change-password',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            currentPassword: 'current123',
            newPassword: 'newpassword123',
          }),
        }),
      );
    });
  });
});
