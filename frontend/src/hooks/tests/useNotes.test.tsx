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

  it('handles toggle pin, color, archive, trash, and delete actions', async () => {
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

    // Pin toggle
    act(() => {
      result.current.handleTogglePin(mockNotes[0]);
    });
    expect(result.current.notes[0].isPinned).toBe(true);

    // Color change
    act(() => {
      result.current.handleChangeColor('n1', '#fefce8');
    });
    expect(result.current.notes[0].color).toBe('#fefce8');

    // Archive toggle
    act(() => {
      result.current.handleToggleArchive(mockNotes[0]);
    });
    expect(result.current.notes[0].isArchived).toBe(true);

    // Trash move
    act(() => {
      result.current.handleMoveToTrash(mockNotes[0]);
    });
    expect(result.current.notes[0].isTrashed).toBe(true);

    // Restore from trash
    act(() => {
      result.current.handleRestoreFromTrash(mockNotes[0]);
    });
    expect(result.current.notes[0].isTrashed).toBe(false);

    // Save Note
    await act(async () => {
      await result.current.handleSaveNote({
        title: 'Fresh Note',
        content: 'Fresh Content',
      });
    });

    // Permanent delete
    act(() => {
      result.current.handleDeletePermanently(mockNotes[0]);
    });
    expect(result.current.confirmConfig.isOpen).toBe(true);

    // Confirm permanent delete
    await act(async () => {
      await result.current.confirmConfig.onConfirm();
    });

    // Request empty trash
    act(() => {
      result.current.requestEmptyTrash();
    });
    expect(result.current.confirmConfig.isOpen).toBe(true);

    // Close confirm modal
    act(() => {
      result.current.closeConfirmModal();
    });
    expect(result.current.confirmConfig.isOpen).toBe(false);
  });
});
