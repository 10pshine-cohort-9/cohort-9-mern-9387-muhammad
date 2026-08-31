import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotesGrid } from '../NotesGrid';
import type { Note } from '../NoteModal';

describe('NotesGrid Component', () => {
  const sampleNotes: Note[] = [
    {
      _id: 'note-1',
      title: 'First Grid Note',
      content: '<p>Content 1</p>',
      color: '#ffffff',
      tags: ['tag1'],
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      createdAt: '2026-08-31T00:00:00.000Z',
    },
    {
      _id: 'note-2',
      title: 'Second Grid Note',
      content: '<p>Content 2</p>',
      color: '#fefce8',
      tags: ['tag2'],
      isPinned: true,
      isArchived: false,
      isTrashed: false,
      createdAt: '2026-08-31T01:00:00.000Z',
    },
  ];

  it('renders all notes in grid format', () => {
    render(
      <NotesGrid
        notes={sampleNotes}
        isListView={false}
        activeTab="notes"
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

    expect(screen.getByText('First Grid Note')).toBeInTheDocument();
    expect(screen.getByText('Second Grid Note')).toBeInTheDocument();
  });
});
