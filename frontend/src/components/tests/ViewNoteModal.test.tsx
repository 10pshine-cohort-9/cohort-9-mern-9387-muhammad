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

  it('returns null when note is null', () => {
    const { container } = render(
      <ViewNoteModal
        note={null}
        onClose={vi.fn()}
        activeColorMenuId={null}
        setActiveColorMenuId={vi.fn()}
        onEdit={vi.fn()}
        onTogglePin={vi.fn()}
        onToggleArchive={vi.fn()}
        onMoveToTrash={vi.fn()}
        onRestoreFromTrash={vi.fn()}
        onDeletePermanently={vi.fn()}
        onChangeColor={vi.fn()}
      />,
    );
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
        note={sampleNote}
        onClose={handleClose}
        activeColorMenuId={null}
        setActiveColorMenuId={vi.fn()}
        onEdit={handleEdit}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onMoveToTrash={handleMoveToTrash}
        onRestoreFromTrash={vi.fn()}
        onDeletePermanently={vi.fn()}
        onChangeColor={vi.fn()}
      />,
    );

    expect(screen.getByText('Detailed Reading')).toBeInTheDocument();
    expect(screen.getByText('Extended details of note')).toBeInTheDocument();
    expect(screen.getByText('#meeting')).toBeInTheDocument();

    const editBtn = screen.getByTitle('Edit note');
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(sampleNote);

    const pinBtn = screen.getByTitle('Unpin note');
    fireEvent.click(pinBtn);
    expect(handleTogglePin).toHaveBeenCalledWith(sampleNote);

    const archiveBtn = screen.getByTitle('Archive');
    fireEvent.click(archiveBtn);
    expect(handleToggleArchive).toHaveBeenCalledWith(sampleNote);

    const trashBtn = screen.getByTitle('Move to trash');
    fireEvent.click(trashBtn);
    expect(handleMoveToTrash).toHaveBeenCalledWith(sampleNote);

    const closeBtn = screen.getByTitle('Close focused view');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
