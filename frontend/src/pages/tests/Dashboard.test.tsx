import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { AuthProvider } from '../../context/AuthContext';
import * as useNotesModule from '../../hooks/useNotes';

vi.mock('../../services/socket', () => ({
  initSocket: vi.fn(() => ({ on: vi.fn(), off: vi.fn() })),
  disconnectSocket: vi.fn(),
}));

describe('Dashboard Page Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'sample-token');
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'u1', name: 'Muhammad Ikram', email: 'test@example.com' }),
    );
  });

  it('renders Dashboard layout, navbar, search bar, and empty state when no notes exist', () => {
    vi.spyOn(useNotesModule, 'useNotes').mockReturnValue({
      notes: [],
      loading: false,
      error: '',
      confirmConfig: { isOpen: false, title: '', message: '', onConfirm: vi.fn() },
      loadNotes: vi.fn(),
      handleExportNotes: vi.fn(),
      handleExportSingleMarkdown: vi.fn(),
      handleImportNotes: vi.fn(),
      handleSaveNote: vi.fn(),
      handleTogglePin: vi.fn(),
      handleToggleArchive: vi.fn(),
      handleMoveToTrash: vi.fn(),
      handleRestoreFromTrash: vi.fn(),
      handleDeletePermanently: vi.fn(),
      requestEmptyTrash: vi.fn(),
      handleChangeColor: vi.fn(),
      closeConfirmModal: vi.fn(),
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>,
    );

    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('renders notes list and opens Create Note modal', () => {
    const mockNotes = [
      {
        _id: 'n1',
        title: 'Project Roadmap',
        content: '<p>Sprint tasks</p>',
        color: '#ffffff',
        tags: ['roadmap'],
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        createdAt: '2026-08-31T00:00:00.000Z',
      },
    ];

    vi.spyOn(useNotesModule, 'useNotes').mockReturnValue({
      notes: mockNotes,
      loading: false,
      error: '',
      confirmConfig: { isOpen: false, title: '', message: '', onConfirm: vi.fn() },
      loadNotes: vi.fn(),
      handleExportNotes: vi.fn(),
      handleExportSingleMarkdown: vi.fn(),
      handleImportNotes: vi.fn(),
      handleSaveNote: vi.fn(),
      handleTogglePin: vi.fn(),
      handleToggleArchive: vi.fn(),
      handleMoveToTrash: vi.fn(),
      handleRestoreFromTrash: vi.fn(),
      handleDeletePermanently: vi.fn(),
      requestEmptyTrash: vi.fn(),
      handleChangeColor: vi.fn(),
      closeConfirmModal: vi.fn(),
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Project Roadmap')).toBeInTheDocument();
    const createBtn = screen.getByRole('button', { name: /create note/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Create New Note')).toBeInTheDocument();
  });
});
