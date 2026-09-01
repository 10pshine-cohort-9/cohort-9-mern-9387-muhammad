import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '../TagInput';

describe('TagInput Component', () => {
  it('renders input, adds tag on Enter key, and displays chips', () => {
    const handleAddTag = vi.fn();
    const handleRemoveTag = vi.fn();
    const handleInputChange = vi.fn();

    render(
      <TagInput
        tags={['work', 'urgent']}
        tagInput="react"
        onTagInputChange={handleInputChange}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />,
    );

    expect(screen.getByText(/tags & labels/i)).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#urgent')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/add tag/i);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleAddTag).toHaveBeenCalledTimes(1);

    const addBtn = screen.getByRole('button', { name: /add tag/i });
    fireEvent.click(addBtn);
    expect(handleAddTag).toHaveBeenCalledTimes(2);
  });
});
