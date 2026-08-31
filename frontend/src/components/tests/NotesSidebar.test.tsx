import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotesSidebar } from '../NotesSidebar';

describe('NotesSidebar Component', () => {
  const counts = { notes: 5, pinned: 2, archived: 3, trash: 1 };

  it('renders all navigation tabs with their counts', () => {
    const handleSelectTab = vi.fn();
    const handleSelectTag = vi.fn();

    render(
      <NotesSidebar
        activeTab="notes"
        setActiveTab={handleSelectTab}
        selectedTag={null}
        setSelectedTag={handleSelectTag}
        allTags={['react', 'node']}
        counts={counts}
        isCollapsed={false}
      />,
    );

    expect(screen.getByText('All Notes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
    expect(screen.getByText('Trash')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Pinned'));
    expect(handleSelectTab).toHaveBeenCalledWith('pinned');

    fireEvent.click(screen.getByText('#react'));
    expect(handleSelectTag).toHaveBeenCalledWith('react');
  });
});
