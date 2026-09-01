import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteModal } from '../NoteModal';

describe('NoteModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(<NoteModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText('Create New Note')).not.toBeInTheDocument();
  });

  it('renders Create New Note title and form controls when open in create mode', () => {
    render(<NoteModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByText('Create New Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note title...')).toBeInTheDocument();
  });

  it('closes on Escape key, backdrop click, and cancel button', () => {
    const handleClose = vi.fn();
    render(<NoteModal isOpen={true} onClose={handleClose} onSave={vi.fn()} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Close modal backdrop'));
    expect(handleClose).toHaveBeenCalledTimes(2);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(3);
  });

  it('validates empty title or empty content on save', () => {
    render(<NoteModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);

    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
      expect(screen.getByText('Both title and content are required.')).toBeInTheDocument();
    }
  });

  it('handles adding and removing tags', () => {
    render(<NoteModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);

    const tagInput = screen.getByPlaceholderText(/add tag/i);
    fireEvent.change(tagInput, { target: { value: '#project' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    expect(screen.getByText('#project')).toBeInTheDocument();

    const removeBtn = document.querySelector('.modal-chip-remove');
    if (removeBtn) {
      fireEvent.click(removeBtn);
      expect(screen.queryByText('#project')).not.toBeInTheDocument();
    }
  });

  it('populates fields when editing an existing note', () => {
    const existingNote = {
      _id: 'note-1',
      title: 'Existing Title',
      content: 'Existing Content Body',
      tags: ['work'],
      color: '#fefce8',
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
    expect(screen.getByPlaceholderText('Note title...')).toHaveValue('Existing Title');
    expect(screen.getByText('#work')).toBeInTheDocument();
  });

  it('calls onSave on form submission with tags and selected color', async () => {
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

    // Enter rich text content
    const editor = screen.getByRole('textbox', { name: /note content editor/i });
    editor.innerHTML = 'New Test Content';
    fireEvent.input(editor);

    const tagInput = screen.getByPlaceholderText(/add tag/i);
    fireEvent.change(tagInput, { target: { value: 'ideas' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    const form = screen.getByRole('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Test Note',
        content: 'New Test Content',
        color: '#ffffff',
        tags: ['ideas'],
        isPinned: false,
        isArchived: false,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('renders error banner when onSave throws an error', async () => {
    const mockOnSave = vi.fn().mockRejectedValue(new Error('Network Save Failed'));

    render(<NoteModal isOpen={true} onClose={vi.fn()} onSave={mockOnSave} />);

    fireEvent.change(screen.getByPlaceholderText('Note title...'), {
      target: { value: 'Fail Title' },
    });

    const editor = screen.getByRole('textbox', { name: /note content editor/i });
    editor.innerHTML = 'Fail Content';
    fireEvent.input(editor);

    const form = screen.getByRole('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Network Save Failed')).toBeInTheDocument();
    });
  });
});
