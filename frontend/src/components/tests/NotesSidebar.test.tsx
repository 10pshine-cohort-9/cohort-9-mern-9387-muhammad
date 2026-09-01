import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotesSidebar } from '../NotesSidebar';

describe('NotesSidebar Component', () => {
  const defaultProps = {
    activeTab: 'notes' as const,
    setActiveTab: vi.fn(),
    selectedTag: null,
    setSelectedTag: vi.fn(),
    allTags: ['work', 'personal'],
    counts: { notes: 5, pinned: 2, archived: 1, trash: 0 },
    isCollapsed: false,
    isMobileDrawerOpen: false,
    onCloseMobile: vi.fn(),
  };

  it('renders all navigation tabs with counts and handles selection', () => {
    const setActiveTab = vi.fn();
    const setSelectedTag = vi.fn();

    render(
      <NotesSidebar
        {...defaultProps}
        setActiveTab={setActiveTab}
        setSelectedTag={setSelectedTag}
      />,
    );

    expect(screen.getByText('All Notes')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
    expect(screen.getByText('Trash')).toBeInTheDocument();

    const pinnedTab = screen.getByText('Pinned');
    fireEvent.click(pinnedTab);
    expect(setActiveTab).toHaveBeenCalledWith('pinned');
    expect(setSelectedTag).toHaveBeenCalledWith(null);
  });

  it('renders tags and toggles tag selection', () => {
    const setSelectedTag = vi.fn();
    render(<NotesSidebar {...defaultProps} setSelectedTag={setSelectedTag} />);

    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#personal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('#work'));
    expect(setSelectedTag).toHaveBeenCalledWith('work');
  });

  it('unselects active tag when clicked again', () => {
    const setSelectedTag = vi.fn();
    render(<NotesSidebar {...defaultProps} selectedTag="work" setSelectedTag={setSelectedTag} />);

    fireEvent.click(screen.getByText('#work'));
    expect(setSelectedTag).toHaveBeenCalledWith(null);
  });

  it('renders mobile drawer and handles backdrop and close button clicks', () => {
    const onCloseMobile = vi.fn();
    render(
      <NotesSidebar
        {...defaultProps}
        isMobileDrawerOpen={true}
        onCloseMobile={onCloseMobile}
      />,
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close navigation drawer'));
    expect(onCloseMobile).toHaveBeenCalledTimes(1);

    // Scroll lock event handling
    const backdrop = document.querySelector('.mobile-drawer-backdrop');
    if (backdrop) {
      const wheelEvent = new WheelEvent('wheel', { bubbles: true, cancelable: true });
      backdrop.dispatchEvent(wheelEvent);
    }
  });
});
