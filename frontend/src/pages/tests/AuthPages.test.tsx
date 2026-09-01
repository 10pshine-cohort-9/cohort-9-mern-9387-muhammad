import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';
import { SignUp } from '../SignUp';
import { Profile } from '../Profile';
import { AuthProvider } from '../../context/AuthContext';

describe('Auth & Profile Pages', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Login page form fields', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders SignUp page form fields', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <SignUp />
        </BrowserRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders Profile page container when authenticated', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ id: '123', name: 'Muhammad Ikram', email: 'test@example.com' }),
    );
    localStorage.setItem('token', 'sample-valid-jwt');

    render(
      <AuthProvider>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </AuthProvider>,
    );

    expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
    expect(screen.getAllByText('Muhammad Ikram').length).toBeGreaterThan(0);
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
  });
});
