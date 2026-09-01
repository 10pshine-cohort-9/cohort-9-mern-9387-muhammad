import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewNoteModal } from '../ViewNoteModal';
import type { Note } from '../NoteModal';

describe('ViewNoteModal Component', () => {
  const sampleNote: Note = {
    _id: 'note-456',
    title: 'Detailed Reading',
    content: '<p>Extended details of note</p>',
    color: '#ffffff',
    tags: ['meeting', 'action'],
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    createdAt: '2026-08-31T10:00:00.000Z',
  };

  const defaultProps = {
    note: sampleNote,
    onClose: vi.fn(),
    activeColorMenuId: null,
    setActiveColorMenuId: vi.fn(),
    onEdit: vi.fn(),
    onTogglePin: vi.fn(),
    onToggleArchive: vi.fn(),
    onMoveToTrash: vi.fn(),
    onRestoreFromTrash: vi.fn(),
    onDeletePermanently: vi.fn(),
    onChangeColor: vi.fn(),
    onExportMarkdown: vi.fn(),
  };

  it('returns null when note is null', () => {
    const { container } = render(<ViewNoteModal {...defaultProps} note={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with note details and triggers edit, pin, archive, trash, and close', () => {
    const handleClose = vi.fn();
    const handleEdit = vi.fn();
    const handleTogglePin = vi.fn();
    const handleToggleArchive = vi.fn();
    const handleMoveToTrash = vi.fn();

    render(
      <ViewNoteModal
        {...defaultProps}
        onClose={handleClose}
        onEdit={handleEdit}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onMoveToTrash={handleMoveToTrash}
      />,
    );

    expect(screen.getByText('Detailed Reading')).toBeInTheDocument();
    expect(screen.getByText('Extended details of note')).toBeInTheDocument();
    expect(screen.getByText('#meeting')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Edit note'));
    expect(handleEdit).toHaveBeenCalledWith(sampleNote);
    expect(handleClose).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Unpin note'));
    expect(handleTogglePin).toHaveBeenCalledWith(sampleNote);

    fireEvent.click(screen.getByTitle('Archive'));
    expect(handleToggleArchive).toHaveBeenCalledWith(sampleNote);

    fireEvent.click(screen.getByTitle('Move to trash'));
    expect(handleMoveToTrash).toHaveBeenCalledWith(sampleNote);
    expect(handleClose).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Close focused view'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('closes on Escape key press and on backdrop click', () => {
    const handleClose = vi.fn();
    render(<ViewNoteModal {...defaultProps} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Close modal backdrop'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('handles trash view actions with restore and permanent delete', () => {
    const handleRestore = vi.fn();
    const handleDeletePerm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ViewNoteModal
        {...defaultProps}
        note={{ ...sampleNote, isTrashed: true }}
        onClose={handleClose}
        onRestoreFromTrash={handleRestore}
        onDeletePermanently={handleDeletePerm}
      />,
    );

    expect(screen.queryByTitle('Pin note')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit note')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Restore note'));
    expect(handleRestore).toHaveBeenCalledWith(expect.objectContaining({ isTrashed: true }));
    expect(handleClose).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Delete permanently'));
    expect(handleDeletePerm).toHaveBeenCalledWith(expect.objectContaining({ isTrashed: true }));
  });

  it('handles color menu toggle and color selection', () => {
    const setActiveColorMenuId = vi.fn();
    const onChangeColor = vi.fn();

    render(
      <ViewNoteModal
        {...defaultProps}
        activeColorMenuId="note-456"
        setActiveColorMenuId={setActiveColorMenuId}
        onChangeColor={onChangeColor}
      />,
    );

    const colorBtns = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-label')?.includes('color'));
    if (colorBtns.length > 0) {
      fireEvent.click(colorBtns[0]);
      expect(onChangeColor).toHaveBeenCalled();
      expect(setActiveColorMenuId).toHaveBeenCalledWith(null);
    }
  });

  it('calls onExportMarkdown and shows default date when createdAt is missing', () => {
    const onExportMarkdown = vi.fn();
    render(
      <ViewNoteModal
        {...defaultProps}
        note={{ ...sampleNote, isPinned: false, isArchived: true, createdAt: undefined }}
        onExportMarkdown={onExportMarkdown}
      />,
    );

    expect(screen.getByTitle('Pin note')).toBeInTheDocument();
    expect(screen.getByTitle('Unarchive')).toBeInTheDocument();
    expect(screen.getByText(/Created Recently/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Export as Markdown (.md)'));
    expect(onExportMarkdown).toHaveBeenCalled();
  });
});
