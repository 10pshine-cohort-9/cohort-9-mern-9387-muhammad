import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteModal } from '../NoteModal';

describe('NoteModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <NoteModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.queryByText('Create New Note')).not.toBeInTheDocument();
  });

  it('renders Create New Note title and form controls when open in create mode', () => {
    render(
      <NoteModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText('Create New Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note title...')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Write your note content here...'),
    ).toBeInTheDocument();
  });

  it('populates fields when editing an existing note', () => {
    const existingNote = {
      _id: 'note-1',
      title: 'Existing Title',
      content: 'Existing Content Body',
    };

    render(
      <NoteModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialNote={existingNote}
      />,
    );

    expect(screen.getByText('Edit Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note title...')).toHaveValue(
      'Existing Title',
    );
    expect(
      screen.getByPlaceholderText('Write your note content here...'),
    ).toHaveValue('Existing Content Body');
  });

  it('calls onSave on form submission', async () => {
    const mockOnSave = vi.fn().mockResolvedValue(undefined);
    const mockOnClose = vi.fn();

    render(
      <NoteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Note title...'), {
      target: { value: 'New Test Note' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Write your note content here...'),
      {
        target: { value: 'New Test Content' },
      },
    );

    fireEvent.click(screen.getByText('Save Note'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Test Note',
        content: 'New Test Content',
        color: '#ffffff',
        tags: [],
        isPinned: false,
        isArchived: false,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('renders error banner when onSave throws an error', async () => {
    const mockOnSave = vi
      .fn()
      .mockRejectedValue(new Error('Network Save Failed'));

    render(
      <NoteModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={mockOnSave}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Note title...'), {
      target: { value: 'Fail Title' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Write your note content here...'),
      {
        target: { value: 'Fail Content' },
      },
    );

    fireEvent.click(screen.getByText('Save Note'));

    await waitFor(() => {
      expect(screen.getByText('Network Save Failed')).toBeInTheDocument();
    });
  });
});
