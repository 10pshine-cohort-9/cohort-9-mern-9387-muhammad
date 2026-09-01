import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '../TagInput';

describe('TagInput Component', () => {
  it('renders input, handles typing, Enter key, comma key, Add button, and remove click', () => {
    const onTagInputChange = vi.fn();
    const onAddTag = vi.fn();
    const onRemoveTag = vi.fn();

    render(
      <TagInput
        tags={['react', 'vite']}
        tagInput="typescript"
        onTagInputChange={onTagInputChange}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />,
    );

    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#vite')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/add tag/i);
    fireEvent.change(input, { target: { value: 'nodejs' } });
    expect(onTagInputChange).toHaveBeenCalledWith('nodejs');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onAddTag).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(input, { key: ',' });
    expect(onAddTag).toHaveBeenCalledTimes(2);

    const addBtn = screen.getByRole('button', { name: /add tag/i });
    fireEvent.click(addBtn);
    expect(onAddTag).toHaveBeenCalledTimes(3);

    // Click remove icon on first chip
    const removeIcons = document.querySelectorAll('.modal-chip-remove');
    expect(removeIcons.length).toBeGreaterThan(0);
    const firstRemoveIcon = removeIcons[0];
    if (firstRemoveIcon) {
      fireEvent.click(firstRemoveIcon);
      expect(onRemoveTag).toHaveBeenCalledWith('react');
    }
  });
});
