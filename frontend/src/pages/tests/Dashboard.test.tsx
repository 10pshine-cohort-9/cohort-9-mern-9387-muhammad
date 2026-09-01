import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { AuthProvider } from '../../context/AuthContext';
import * as useNotesModule from '../../hooks/useNotes';
import type { Note } from '../../types/note';

vi.mock('../../services/socket', () => ({
  initSocket: vi.fn(() => ({ on: vi.fn(), off: vi.fn() })),
  disconnectSocket: vi.fn(),
}));

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  _id: 'n1',
  title: 'Test Note',
  content: '<p>content</p>',
  color: '#ffffff',
  tags: ['tag1'],
  isPinned: false,
  isArchived: false,
  isTrashed: false,
  createdAt: '2026-08-31T00:00:00.000Z',
  ...overrides,
});

const mockUseNotes = (overrides: Partial<ReturnType<typeof useNotesModule.useNotes>> = {}) => {
  return vi.spyOn(useNotesModule, 'useNotes').mockReturnValue({
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
    ...overrides,
  });
};

const renderDashboard = () =>
  render(
    <AuthProvider>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </AuthProvider>,
  );

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'User', email: 'u@e.com' }));
    vi.restoreAllMocks();
  });

  it('renders empty state when no notes', () => {
    mockUseNotes();
    renderDashboard();
    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockUseNotes({ loading: true });
    renderDashboard();
    expect(screen.getByText(/loading your notes/i)).toBeInTheDocument();
  });

  it('renders error message', () => {
    mockUseNotes({ error: 'Connection failed' });
    renderDashboard();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('renders notes in a grid', () => {
    mockUseNotes({ notes: [makeNote({ title: 'My Note' })] });
    renderDashboard();
    expect(screen.getByText('My Note')).toBeInTheDocument();
  });

  it('opens create modal when clicking Create Note button', () => {
    mockUseNotes({ notes: [makeNote()] });
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /create note/i }));
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
  });

  it('opens create modal with Ctrl+N keyboard shortcut', () => {
    mockUseNotes();
    renderDashboard();

    fireEvent.keyDown(window, { key: 'n', ctrlKey: true });
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
  });

  it('shows pinned section when notes tab has pinned notes', () => {
    mockUseNotes({
      notes: [
        makeNote({ _id: 'p1', title: 'Pinned Note', isPinned: true }),
        makeNote({ _id: 'o1', title: 'Other Note', isPinned: false }),
      ],
    });
    renderDashboard();

    expect(screen.getByRole('heading', { name: /PINNED \(\d+\)/i, level: 4 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /OTHERS \(\d+\)/i, level: 4 })).toBeInTheDocument();
  });

  it('opens view modal when see more is clicked on a long note on desktop', () => {
    window.innerWidth = 1024;
    const longContent = '<p>' + 'word '.repeat(50) + '</p>';
    mockUseNotes({ notes: [makeNote({ title: 'Long Note', content: longContent })] });
    renderDashboard();

    const seeMore = screen.getByText(/See more/i);
    fireEvent.click(seeMore);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked on a note', () => {
    mockUseNotes({ notes: [makeNote({ title: 'Editable' })] });
    renderDashboard();

    fireEvent.click(screen.getByTitle('Edit note'));
    expect(screen.getByText('Edit Note')).toBeInTheDocument();
  });

  it('calls togglePin from NoteCard pin button', () => {
    const handleTogglePin = vi.fn();
    mockUseNotes({ notes: [makeNote()], handleTogglePin });
    renderDashboard();

    fireEvent.click(screen.getByTitle('Pin note'));
    expect(handleTogglePin).toHaveBeenCalled();
  });

  it('calls toggleArchive from NoteCard archive button', () => {
    const handleToggleArchive = vi.fn();
    mockUseNotes({ notes: [makeNote()], handleToggleArchive });
    renderDashboard();

    fireEvent.click(screen.getByTitle('Archive'));
    expect(handleToggleArchive).toHaveBeenCalled();
  });

  it('calls moveToTrash from NoteCard', () => {
    const handleMoveToTrash = vi.fn();
    mockUseNotes({ notes: [makeNote()], handleMoveToTrash });
    renderDashboard();

    fireEvent.click(screen.getByTitle('Move to trash'));
    expect(handleMoveToTrash).toHaveBeenCalled();
  });

  it('renders confirm modal when confirmConfig.isOpen is true', () => {
    mockUseNotes({
      confirmConfig: {
        isOpen: true,
        title: 'Confirm Delete',
        message: 'Permanent action',
        onConfirm: vi.fn(),
      },
    });
    renderDashboard();

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Permanent action')).toBeInTheDocument();
  });

  it('filters notes by search term and tags', () => {
    mockUseNotes({
      notes: [
        makeNote({ _id: 'a', title: 'Apple Note', tags: ['fruit'] }),
        makeNote({ _id: 'b', title: 'Banana Note', tags: ['tropical'] }),
      ],
    });
    renderDashboard();

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: 'apple' } });

    expect(screen.getByText('Apple Note')).toBeInTheDocument();
    expect(screen.queryByText('Banana Note')).not.toBeInTheDocument();

    // Clear search and filter by tag
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.click(screen.getAllByText('#tropical')[0]);

    expect(screen.getByText('Banana Note')).toBeInTheDocument();
    expect(screen.queryByText('Apple Note')).not.toBeInTheDocument();
  });

  it('switches view mode and sort order', () => {
    mockUseNotes({
      notes: [
        makeNote({ _id: '1', title: 'First', createdAt: '2026-08-01T00:00:00.000Z' }),
        makeNote({ _id: '2', title: 'Second', createdAt: '2026-08-30T00:00:00.000Z' }),
      ],
    });
    renderDashboard();

    // Toggle list view
    const viewToggle = screen.getByTitle(/list view/i);
    fireEvent.click(viewToggle);

    // Change sort selector
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });
    fireEvent.change(sortSelect, { target: { value: 'pinned' } });
  });

  it('toggles mobile drawer through custom event and navbar hamburger', () => {
    mockUseNotes();
    renderDashboard();

    const hamburger = screen.getByTitle(/toggle navigation menu/i);
    fireEvent.click(hamburger);

    window.dispatchEvent(new CustomEvent('toggle-mobile-drawer'));
  });
});
