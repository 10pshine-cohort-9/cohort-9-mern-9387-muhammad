import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as api from '../../services/api';
import App from '../../App';

describe('App Component Routing', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({
      count: 0,
      notes: [],
      scope: 'notes',
      data: [],
    });
  });

  it('renders login page when accessing login route while unauthenticated', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders dashboard when authenticated', () => {
    localStorage.setItem('token', 'valid-jwt');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'App User', email: 'app@test.com' }));
    window.history.pushState({}, '', '/dashboard');

    render(<App />);
    expect(screen.getByTestId('dashboard-shell')).toBeInTheDocument();
  });
});
