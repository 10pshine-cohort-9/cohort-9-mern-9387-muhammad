import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from '../DashboardHeader';

describe('DashboardHeader Component', () => {
  it('renders search input, sort selector, action buttons, and triggers callbacks', () => {
    const handleSearchChange = vi.fn();
    const handleSortChange = vi.fn();
    const handleViewToggle = vi.fn();
    const handleExport = vi.fn();
    const handleImport = vi.fn();
    const handleOpenCreateModal = vi.fn();
    const handleEmptyTrash = vi.fn();

    const { rerender, container } = render(
      <DashboardHeader
        searchTerm="study"
        setSearchTerm={handleSearchChange}
        sortBy="newest"
        setSortBy={handleSortChange}
        isListView={false}
        setIsListView={handleViewToggle}
        activeTab="notes"
        trashedCount={0}
        onExport={handleExport}
        onImport={handleImport}
        onEmptyTrash={handleEmptyTrash}
        onOpenCreateModal={handleOpenCreateModal}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    expect(searchInput).toHaveValue('study');
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    expect(handleSearchChange).toHaveBeenCalledWith('new search');

    // Click clear search text button
    const clearBtn = screen.getByTitle(/clear search text/i);
    fireEvent.click(clearBtn);
    expect(handleSearchChange).toHaveBeenCalledWith('');

    // Change sort select
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'oldest' } });
    expect(handleSortChange).toHaveBeenCalledWith('oldest');

    // Toggle list/grid view
    const viewToggleBtn = screen.getByTitle(/switch to list view/i);
    fireEvent.click(viewToggleBtn);
    expect(handleViewToggle).toHaveBeenCalledWith(true);

    const createBtn = screen.getByRole('button', { name: /create note/i });
    fireEvent.click(createBtn);
    expect(handleOpenCreateModal).toHaveBeenCalledTimes(1);

    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);
    expect(handleExport).toHaveBeenCalledTimes(1);

    const importBtn = screen.getByTitle(/import notes from/i);
    fireEvent.click(importBtn);

    const fileInput = container.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [new File([''], 'notes.json')] } });
    expect(handleImport).toHaveBeenCalledTimes(1);

    // Re-render in trash tab to test Empty Trash button
    rerender(
      <DashboardHeader
        searchTerm=""
        setSearchTerm={handleSearchChange}
        sortBy="newest"
        setSortBy={handleSortChange}
        isListView={true}
        setIsListView={handleViewToggle}
        activeTab="trash"
        trashedCount={3}
        onExport={handleExport}
        onImport={handleImport}
        onEmptyTrash={handleEmptyTrash}
        onOpenCreateModal={handleOpenCreateModal}
      />,
    );

    const emptyTrashBtn = screen.getByRole('button', { name: /empty trash \(3\)/i });
    fireEvent.click(emptyTrashBtn);
    expect(handleEmptyTrash).toHaveBeenCalledTimes(1);
  });
});
