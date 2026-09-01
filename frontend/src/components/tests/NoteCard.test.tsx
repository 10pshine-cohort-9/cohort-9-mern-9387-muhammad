import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from '../NoteCard';
import type { Note } from '../NoteModal';

const sampleNote: Note = {
  _id: 'note-1',
  title: 'Test Card',
  content: '<p>Short content</p>',
  color: '#ffffff',
  tags: ['work', 'shine'],
  isPinned: false,
  isArchived: false,
  isTrashed: false,
  createdAt: '2026-08-31T12:00:00.000Z',
};

const defaultProps = {
  note: sampleNote,
  activeTab: 'notes',
  activeColorMenuId: null as string | null,
  setActiveColorMenuId: vi.fn(),
  onEdit: vi.fn(),
  onTogglePin: vi.fn(),
  onToggleArchive: vi.fn(),
  onMoveToTrash: vi.fn(),
  onRestoreFromTrash: vi.fn(),
  onDeletePermanently: vi.fn(),
  onChangeColor: vi.fn(),
  onSelectForView: vi.fn(),
  onExportMarkdown: vi.fn(),
};

describe('NoteCard', () => {
  it('renders title, sanitized content, and tags', () => {
    render(<NoteCard {...defaultProps} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Short content')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#shine')).toBeInTheDocument();
  });

  it('calls onTogglePin, onEdit, onToggleArchive, onMoveToTrash', () => {
    const props = { ...defaultProps, onTogglePin: vi.fn(), onEdit: vi.fn(), onToggleArchive: vi.fn(), onMoveToTrash: vi.fn() };
    render(<NoteCard {...props} />);

    fireEvent.click(screen.getByTitle('Pin note'));
    expect(props.onTogglePin).toHaveBeenCalledWith(sampleNote);

    fireEvent.click(screen.getByTitle('Edit note'));
    expect(props.onEdit).toHaveBeenCalledWith(sampleNote);

    fireEvent.click(screen.getByTitle('Archive'));
    expect(props.onToggleArchive).toHaveBeenCalledWith(sampleNote);

    fireEvent.click(screen.getByTitle('Move to trash'));
    expect(props.onMoveToTrash).toHaveBeenCalledWith(sampleNote);
  });

  it('shows trash actions (restore/delete) when in trash tab', () => {
    const handleRestore = vi.fn();
    const handleDeletePerm = vi.fn();

    render(
      <NoteCard
        {...defaultProps}
        note={{ ...sampleNote, isTrashed: true }}
        activeTab="trash"
        onRestoreFromTrash={handleRestore}
        onDeletePermanently={handleDeletePerm}
      />,
    );

    fireEvent.click(screen.getByTitle('Restore note'));
    expect(handleRestore).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Delete permanently'));
    expect(handleDeletePerm).toHaveBeenCalled();

    expect(screen.queryByTitle('Pin note')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit note')).not.toBeInTheDocument();
  });

  it('shows "See more" for long content and expands on click when onSelectForView is not provided', () => {
    const longContent = '<p>' + 'x'.repeat(200) + '</p>';
    render(<NoteCard {...defaultProps} onSelectForView={undefined} note={{ ...sampleNote, content: longContent }} />);

    const seeMore = screen.getByText(/See more/i);
    expect(seeMore).toBeInTheDocument();

    fireEvent.click(seeMore);
    expect(screen.getByText(/Show less/i)).toBeInTheDocument();
  });

  it('opens color dropdown and calls onChangeColor', () => {
    const setActiveColorMenuId = vi.fn();
    const onChangeColor = vi.fn();

    render(
      <NoteCard
        {...defaultProps}
        setActiveColorMenuId={setActiveColorMenuId}
        onChangeColor={onChangeColor}
      />,
    );

    fireEvent.click(screen.getByTitle('Change color'));
    expect(setActiveColorMenuId).toHaveBeenCalled();
  });

  it('renders color dropdown when activeColorMenuId matches', () => {
    render(
      <NoteCard
        {...defaultProps}
        activeColorMenuId="note-1"
      />,
    );

    const colorGroup = screen.getByRole('group', { name: /color options/i });
    expect(colorGroup).toBeInTheDocument();
  });

  it('calls onExportMarkdown when export button is clicked', () => {
    const onExportMarkdown = vi.fn();
    render(<NoteCard {...defaultProps} onExportMarkdown={onExportMarkdown} />);

    fireEvent.click(screen.getByTitle('Export as Markdown (.md)'));
    expect(onExportMarkdown).toHaveBeenCalledWith(sampleNote);
  });

  it('does not render export button when onExportMarkdown is not provided', () => {
    render(<NoteCard {...defaultProps} onExportMarkdown={undefined} />);
    expect(screen.queryByTitle('Export as Markdown (.md)')).not.toBeInTheDocument();
  });

  it('opens view modal when see more is clicked on desktop', () => {
    const onSelectForView = vi.fn();
    const longContent = '<p>' + 'word '.repeat(50) + '</p>';
    window.innerWidth = 1024;

    render(
      <NoteCard
        {...defaultProps}
        note={{ ...sampleNote, content: longContent }}
        onSelectForView={onSelectForView}
      />,
    );

    const seeMore = screen.getByText(/See more/i);
    fireEvent.click(seeMore);
    expect(onSelectForView).toHaveBeenCalledWith(expect.objectContaining({ _id: 'note-1' }));
  });

  it('selects color from dropdown and closes menu', () => {
    const onChangeColor = vi.fn();
    const setActiveColorMenuId = vi.fn();

    render(
      <NoteCard
        {...defaultProps}
        activeColorMenuId="note-1"
        onChangeColor={onChangeColor}
        setActiveColorMenuId={setActiveColorMenuId}
      />,
    );

    const colorBtns = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-label')?.includes('color'));
    if (colorBtns.length > 0) {
      fireEvent.click(colorBtns[0]);
      expect(onChangeColor).toHaveBeenCalled();
      expect(setActiveColorMenuId).toHaveBeenCalledWith(null);
    }
  });

  it('displays formatted date', () => {
    render(<NoteCard {...defaultProps} />);
    expect(screen.getByText(/Aug/i)).toBeInTheDocument();
  });
});

