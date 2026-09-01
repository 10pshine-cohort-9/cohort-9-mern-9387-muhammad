import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from '../NoteCard';
import type { Note } from '../NoteModal';

describe('NoteCard Component', () => {
  const sampleNote: Note = {
    _id: 'note-123',
    title: 'Testing Card',
    content: '<p>This is a rich note</p>',
    color: '#ffffff',
    tags: ['work', 'shine'],
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: '2026-08-31T12:00:00.000Z',
  };

  it('renders note title, content, tags, and handles pin/edit clicks', () => {
    const handleEdit = vi.fn();
    const handleTogglePin = vi.fn();
    const handleToggleArchive = vi.fn();
    const handleMoveToTrash = vi.fn();

    render(
      <NoteCard
        note={sampleNote}
        activeTab="notes"
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

    expect(screen.getByText('Testing Card')).toBeInTheDocument();
    expect(screen.getByText('This is a rich note')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#shine')).toBeInTheDocument();

    const pinBtn = screen.getByTitle('Pin note');
    fireEvent.click(pinBtn);
    expect(handleTogglePin).toHaveBeenCalledWith(sampleNote);

    const editBtn = screen.getByTitle('Edit note');
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(sampleNote);
  });
});
