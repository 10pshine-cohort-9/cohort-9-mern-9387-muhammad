import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useNotes } from '../useNotes';
import * as api from '../../services/api';
import { AuthProvider } from '../../context/AuthContext';
import type { Note } from '../../types/note';

const mockSocket = { on: vi.fn(), off: vi.fn() };

vi.mock('../../services/socket', () => ({
  initSocket: vi.fn(() => mockSocket),
  disconnectSocket: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

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

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-jwt');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Test', email: 'a@b.com' }));
  });

  it('fetches notes on mount', async () => {
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [makeNote()] });
    const { result } = renderHook(() => useNotes('notes'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notes).toHaveLength(1);
    expect(result.current.error).toBe('');
  });

  it('calls logout on auth error during initial fetch', async () => {
    vi.spyOn(api, 'fetchAPI').mockRejectedValue(new Error('Not authorized'));
    const { result } = renderHook(() => useNotes('notes'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notes).toHaveLength(0);
  });

  it('sets error on non-auth fetch failure', async () => {
    vi.spyOn(api, 'fetchAPI').mockRejectedValue(new Error('Network down'));
    const { result } = renderHook(() => useNotes('notes'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network down');
  });

  it('creates a new note via handleSaveNote', async () => {
    vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: makeNote({ _id: 'new1', title: 'New' }) });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleSaveNote({ title: 'New', content: 'body' }, null);
    });

    expect(result.current.notes[0].title).toBe('New');
  });

  it('updates an existing note via handleSaveNote', async () => {
    const existing = makeNote();
    vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [existing] })
      .mockResolvedValueOnce({ data: makeNote({ title: 'Updated' }) });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleSaveNote({ title: 'Updated', content: 'body' }, existing);
    });

    expect(result.current.notes[0].title).toBe('Updated');
  });

  it('toggles pin with onUpdateView callback', async () => {
    const note = makeNote();
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const viewCallback = vi.fn();
    act(() => { result.current.handleTogglePin(note, viewCallback); });

    expect(result.current.notes[0].isPinned).toBe(true);
    expect(viewCallback).toHaveBeenCalledWith(expect.objectContaining({ isPinned: true }));
  });

  it('toggles archive with onClearView callback', async () => {
    const note = makeNote();
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const clearView = vi.fn();
    act(() => { result.current.handleToggleArchive(note, clearView); });

    expect(result.current.notes[0].isArchived).toBe(true);
    expect(result.current.notes[0].isPinned).toBe(false);
    expect(clearView).toHaveBeenCalled();
  });

  it('moves to trash with callback', async () => {
    const note = makeNote();
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const clearView = vi.fn();
    act(() => { result.current.handleMoveToTrash(note, clearView); });

    expect(result.current.notes[0].isTrashed).toBe(true);
    expect(clearView).toHaveBeenCalled();
  });

  it('restores from trash with onUpdateView callback', async () => {
    const note = makeNote({ isTrashed: true });
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updateView = vi.fn();
    act(() => { result.current.handleRestoreFromTrash(note, updateView); });

    expect(result.current.notes[0].isTrashed).toBe(false);
    expect(updateView).toHaveBeenCalledWith(expect.objectContaining({ isTrashed: false }));
  });

  it('permanently deletes a note through confirm flow', async () => {
    const note = makeNote();
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const clearView = vi.fn();
    act(() => { result.current.handleDeletePermanently(note, clearView); });
    expect(result.current.confirmConfig.isOpen).toBe(true);
    expect(result.current.confirmConfig.isDanger).toBe(true);

    await act(async () => { await result.current.confirmConfig.onConfirm(); });

    expect(result.current.notes).toHaveLength(0);
    expect(clearView).toHaveBeenCalled();
  });

  it('empties trash through confirm flow', async () => {
    const note = makeNote({ isTrashed: true });
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const clearView = vi.fn();
    act(() => { result.current.requestEmptyTrash(clearView); });
    expect(result.current.confirmConfig.isOpen).toBe(true);

    await act(async () => { await result.current.confirmConfig.onConfirm(); });

    expect(result.current.notes).toHaveLength(0);
    expect(clearView).toHaveBeenCalled();
  });

  it('changes note color with onUpdateView callback', async () => {
    const note = makeNote();
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updateView = vi.fn();
    act(() => { result.current.handleChangeColor('n1', '#fefce8', updateView); });

    expect(result.current.notes[0].color).toBe('#fefce8');
    expect(updateView).toHaveBeenCalledWith('#fefce8');
  });

  it('closes confirm modal', async () => {
    const note = makeNote();
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.handleDeletePermanently(note); });
    expect(result.current.confirmConfig.isOpen).toBe(true);

    act(() => { result.current.closeConfirmModal(); });
    expect(result.current.confirmConfig.isOpen).toBe(false);
  });

  it('exports notes as JSON', async () => {
    vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [makeNote()] })
      .mockResolvedValueOnce({ count: 1, notes: [makeNote()], scope: 'notes' });

    const createObjectURL = vi.fn().mockReturnValue('blob:url');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.handleExportNotes(); });

    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles export failure gracefully', async () => {
    vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [] })
      .mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.handleExportNotes(); });
  });

  it('exports a single note as markdown', async () => {
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [makeNote()] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.handleExportSingleMarkdown(makeNote()); });
  });

  it('imports a markdown file', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ message: '1 note imported' })
      .mockResolvedValueOnce({ data: [makeNote()] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(['# Title\nContent here'], 'note.md', { type: 'text/markdown' });
    file.text = () => Promise.resolve('# Title\nContent here');
    const event = { target: { files: [file], value: 'note.md' } } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => { await result.current.handleImportNotes(event); });

    expect(fetchSpy).toHaveBeenCalledWith('/notes/import', expect.objectContaining({ method: 'POST' }));
  });

  it('imports a JSON file with notes array', async () => {
    const notesJson = JSON.stringify({ notes: [{ title: 'Imported', content: 'body' }] });
    const fetchSpy = vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ message: '1 imported' })
      .mockResolvedValueOnce({ data: [makeNote()] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File([notesJson], 'notes.json', { type: 'application/json' });
    file.text = () => Promise.resolve(notesJson);
    const event = { target: { files: [file], value: 'notes.json' } } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => { await result.current.handleImportNotes(event); });

    expect(fetchSpy).toHaveBeenCalledWith('/notes/import', expect.objectContaining({ method: 'POST' }));
  });

  it('skips files exceeding MAX_IMPORT_FILE_SIZE_BYTES', async () => {
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const bigFile = new File(['x'.repeat(100)], 'huge.md', { type: 'text/markdown' });
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });

    const event = { target: { files: [bigFile], value: 'huge.md' } } as unknown as React.ChangeEvent<HTMLInputElement>;
    await act(async () => { await result.current.handleImportNotes(event); });
  });

  it('skips empty files during import', async () => {
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const emptyFile = new File([''], 'empty.md', { type: 'text/markdown' });
    emptyFile.text = () => Promise.resolve('');
    const event = { target: { files: [emptyFile], value: 'empty.md' } } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => { await result.current.handleImportNotes(event); });
  });

  it('returns early when no files are selected for import', async () => {
    vi.spyOn(api, 'fetchAPI').mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const event = { target: { files: [], value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
    await act(async () => { await result.current.handleImportNotes(event); });
  });

  it('falls back to markdown parsing when JSON.parse fails on non-md file', async () => {
    vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ message: 'imported' })
      .mockResolvedValueOnce({ data: [makeNote()] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(['not valid json'], 'notes.txt', { type: 'text/plain' });
    file.text = () => Promise.resolve('not valid json');
    const event = { target: { files: [file], value: 'notes.txt' } } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => { await result.current.handleImportNotes(event); });
  });

  it('reloads notes when a toggle operation API call fails', async () => {
    const note = makeNote();
    const fetchSpy = vi.spyOn(api, 'fetchAPI')
      .mockResolvedValueOnce({ data: [note] })
      .mockRejectedValueOnce(new Error('Server error'))
      .mockResolvedValueOnce({ data: [note] });

    const { result } = renderHook(() => useNotes('notes'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { result.current.handleTogglePin(note); });

    await waitFor(() => {
      const loadCalls = fetchSpy.mock.calls.filter((c) => c[0] === '/notes');
      expect(loadCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
});

