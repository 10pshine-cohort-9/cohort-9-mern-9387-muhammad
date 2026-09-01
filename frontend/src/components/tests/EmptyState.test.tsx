import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
  it('renders "No notes yet" and triggers create modal when activeTab is notes', () => {
    const handleOpenCreateModal = vi.fn();
    render(
      <EmptyState
        activeTab="notes"
        hasFilters={false}
        onOpenCreateModal={handleOpenCreateModal}
      />,
    );

    expect(screen.getByText('No notes yet')).toBeInTheDocument();
    const createBtn = screen.getByRole('button', { name: /create note/i });
    expect(createBtn).toBeInTheDocument();
    fireEvent.click(createBtn);
    expect(handleOpenCreateModal).toHaveBeenCalledTimes(1);
  });

  it('renders appropriate messages for pinned, archived, and trash tabs', () => {
    const { rerender } = render(
      <EmptyState activeTab="pinned" hasFilters={false} onOpenCreateModal={vi.fn()} />,
    );
    expect(screen.getByText('No pinned notes')).toBeInTheDocument();

    rerender(
      <EmptyState activeTab="archived" hasFilters={false} onOpenCreateModal={vi.fn()} />,
    );
    expect(screen.getByText('Archive is empty')).toBeInTheDocument();

    rerender(
      <EmptyState activeTab="trash" hasFilters={false} onOpenCreateModal={vi.fn()} />,
    );
    expect(screen.getByText('Trash is empty')).toBeInTheDocument();
  });

  it('renders filter-specific empty state message when hasFilters is true', () => {
    render(
      <EmptyState activeTab="notes" hasFilters={true} onOpenCreateModal={vi.fn()} />,
    );
    expect(screen.getByText('No matching results')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No notes match your filters. Try adjusting your search query or selected tag.',
      ),
    ).toBeInTheDocument();
  });
});
