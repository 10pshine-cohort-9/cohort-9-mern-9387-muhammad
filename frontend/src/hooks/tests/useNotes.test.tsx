import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useNotes } from '../useNotes';
import * as api from '../../services/api';
import { AuthProvider } from '../../context/AuthContext';

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

vi.mock('../../services/socket', () => ({
  initSocket: vi.fn(() => mockSocket),
  disconnectSocket: vi.fn(),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useNotes hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'u1', name: 'Test User', email: 'test@example.com' }),
    );
  });

  it('fetches notes on mount and computes counts', async () => {
    const mockNotes = [
      {
        _id: 'n1',
        title: 'Active Note',
        content: 'hello',
        color: '#ffffff',
        tags: ['work'],
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        createdAt: '2026-08-31T00:00:00.000Z',
      },
      {
        _id: 'n2',
        title: 'Pinned Note',
        content: 'urgent',
        color: '#ffffff',
        tags: ['important'],
        isPinned: true,
        isArchived: false,
        isTrashed: false,
        createdAt: '2026-08-31T01:00:00.000Z',
      },
    ];

    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: mockNotes });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notes.length).toBe(2);
    expect(result.current.notes[0].title).toBe('Active Note');
  });

  it('handles toggle pin and color change', async () => {
    const mockNotes = [
      {
        _id: 'n1',
        title: 'Alpha Note',
        content: 'content A',
        color: '#ffffff',
        tags: ['tag1'],
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        createdAt: '2026-08-31T00:00:00.000Z',
      },
    ];

    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: mockNotes });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleTogglePin(mockNotes[0]);
    });

    expect(result.current.notes[0].isPinned).toBe(true);

    act(() => {
      result.current.handleChangeColor('n1', '#fefce8');
    });

    expect(result.current.notes[0].color).toBe('#fefce8');
  });
});
