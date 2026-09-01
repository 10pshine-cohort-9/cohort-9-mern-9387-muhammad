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

  it('renders modal with password inputs and handles cancellation and Escape key', () => {
    const handleClose = vi.fn();
    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Change Security Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter current password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter new password/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByLabelText('Close modal backdrop'));
    expect(handleClose).toHaveBeenCalledTimes(3);
  });

  it('validates password length under 6 characters', () => {
    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    const currentInput = screen.getByPlaceholderText(/enter current password/i);
    const newInput = screen.getByPlaceholderText(/at least 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/re-enter new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(currentInput, { target: { value: 'current123' } });
    fireEvent.change(newInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/at least 6 characters long/i)).toBeInTheDocument();
  });

  it('validates password mismatch and handles API error on submit', async () => {
    vi.spyOn(api, 'fetchAPI').mockRejectedValue(new Error('Incorrect current password'));

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

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

    // Test API error
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Incorrect current password')).toBeInTheDocument();
    });
  });

  it('toggles visibility of current, new, and confirm passwords', () => {
    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    const currentInput = screen.getByPlaceholderText(/enter current password/i) as HTMLInputElement;
    const newInput = screen.getByPlaceholderText(/at least 6 characters/i) as HTMLInputElement;
    const confirmInput = screen.getByPlaceholderText(/re-enter new password/i) as HTMLInputElement;

    expect(currentInput.type).toBe('password');
    expect(newInput.type).toBe('password');
    expect(confirmInput.type).toBe('password');

    // Find and click toggle buttons
    const toggleButtons = screen.getAllByRole('button').filter((b) => b.getAttribute('type') === 'button' && !b.textContent);
    toggleButtons.forEach((btn) => fireEvent.click(btn));
  });

  it('successfully updates on correct input and calls API', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchAPI').mockResolvedValue({
      success: true,
      message: 'Password updated successfully',
    } as unknown as { success: boolean; message: string });

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/enter current password/i), { target: { value: 'current123' } });
    fireEvent.change(screen.getByPlaceholderText(/at least 6 characters/i), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/auth/change-password',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ currentPassword: 'current123', newPassword: 'newpassword123' }),
        }),
      );
    });
  });
});
