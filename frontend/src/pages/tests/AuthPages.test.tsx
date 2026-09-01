import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';
import { SignUp } from '../SignUp';
import { Profile } from '../Profile';
import { AuthProvider } from '../../context/AuthContext';
import * as api from '../../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Authentication & Profile Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Page', () => {
    it('handles input changes and form submit successfully', async () => {
      vi.spyOn(api, 'fetchAPI').mockResolvedValue({
        token: 'mock-token',
        user: { id: 'u1', name: 'User 1', email: 'user@example.com' },
      } as unknown as { token: string; user: { id: string; name: string; email: string } });

      render(
        <AuthProvider>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AuthProvider>,
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitBtn = screen.getByRole('button', { name: /log in/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error banner when login fails', async () => {
      vi.spyOn(api, 'fetchAPI').mockRejectedValue(new Error('Invalid credentials'));

      render(
        <AuthProvider>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AuthProvider>,
      );

      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'bad@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'wrongpass' } });
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('SignUp Page', () => {
    it('handles input changes and submits signup successfully', async () => {
      vi.spyOn(api, 'fetchAPI').mockResolvedValue({
        token: 'mock-token',
        user: { id: 'u1', name: 'John Doe', email: 'john@example.com' },
      } as unknown as { token: string; user: { id: string; name: string; email: string } });

      render(
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>,
      );

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error banner when signup fails', async () => {
      vi.spyOn(api, 'fetchAPI').mockRejectedValue(new Error('User already exists'));

      render(
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>,
      );

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Page', () => {
    it('renders profile data and opens change password modal', async () => {
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem(
        'user',
        JSON.stringify({ id: 'u1', name: 'John Doe', email: 'john@example.com' }),
      );

      vi.spyOn(api, 'fetchAPI').mockResolvedValue({
        data: [
          {
            _id: '1',
            title: 'Note 1',
            content: 'Text',
            isPinned: true,
            isArchived: false,
            isTrashed: false,
            tags: ['work'],
          },
        ],
      } as unknown as { data: unknown[] });

      render(
        <AuthProvider>
          <BrowserRouter>
            <Profile />
          </BrowserRouter>
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
        expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
      });

      const changePasswordBtn = screen.getByRole('button', { name: /change password/i });
      fireEvent.click(changePasswordBtn);

      await waitFor(() => {
        expect(screen.getByText('Change Security Password')).toBeInTheDocument();
      });

      const logoutBtn = screen.getByRole('button', { name: /logout account/i });
      fireEvent.click(logoutBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('returns null when user is not logged in', () => {
      const { container } = render(
        <AuthProvider>
          <BrowserRouter>
            <Profile />
          </BrowserRouter>
        </AuthProvider>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles note stats fetch failure gracefully', async () => {
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem(
        'user',
        JSON.stringify({ id: 'u1', name: 'John Doe', email: 'john@example.com' }),
      );

      vi.spyOn(api, 'fetchAPI').mockRejectedValue(new Error('Failed to load'));

      render(
        <AuthProvider>
          <BrowserRouter>
            <Profile />
          </BrowserRouter>
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });
    });
  });
});

