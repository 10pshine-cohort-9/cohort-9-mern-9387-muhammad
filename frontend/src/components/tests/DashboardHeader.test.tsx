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

    render(
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
        onEmptyTrash={vi.fn()}
        onOpenCreateModal={handleOpenCreateModal}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    expect(searchInput).toHaveValue('study');

    const createBtn = screen.getByRole('button', { name: /create note/i });
    fireEvent.click(createBtn);
    expect(handleOpenCreateModal).toHaveBeenCalledTimes(1);

    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);
    expect(handleExport).toHaveBeenCalledTimes(1);
  });
});
