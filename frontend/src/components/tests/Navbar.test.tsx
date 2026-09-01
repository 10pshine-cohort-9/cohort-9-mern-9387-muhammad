import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Navbar';
import * as AuthContextModule from '../../context/AuthContext';

describe('Navbar Component', () => {
  it('renders SHINENOTES branding and unauthenticated login/signup links', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    expect(screen.getByText('SHINE')).toBeInTheDocument();
    expect(screen.getByText('NOTES')).toBeInTheDocument();
  });

  it('renders user initial avatar badge when authenticated', () => {
    const mockLogout = vi.fn();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: '123', name: 'Muhammad Ikram', email: 'ikram@example.com' },
      token: 'valid_token',
      login: vi.fn(),
      logout: mockLogout,
      isAuthenticated: true,
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByTitle(/Account Profile/i)).toBeInTheDocument();
  });
});
