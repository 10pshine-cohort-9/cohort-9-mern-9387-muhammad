import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorToolbar } from '../EditorToolbar';

describe('EditorToolbar Component', () => {
  it('renders formatting buttons and triggers all format callbacks', () => {
    const handleFormat = vi.fn();
    const handleBlockFormat = vi.fn();

    render(
      <EditorToolbar
        activeFormats={{ bold: true, italic: true, underline: true }}
        onFormat={handleFormat}
        onBlockFormat={handleBlockFormat}
      />,
    );

    const boldBtn = screen.getByTitle(/bold/i);
    expect(boldBtn).toBeInTheDocument();
    fireEvent.click(boldBtn);
    expect(handleFormat).toHaveBeenCalledWith('bold');

    const italicBtn = screen.getByTitle(/italic/i);
    fireEvent.click(italicBtn);
    expect(handleFormat).toHaveBeenCalledWith('italic');

    const underlineBtn = screen.getByTitle(/underline/i);
    fireEvent.click(underlineBtn);
    expect(handleFormat).toHaveBeenCalledWith('underline');

    const bulletBtn = screen.getByTitle(/bullet list/i);
    fireEvent.click(bulletBtn);
    expect(handleFormat).toHaveBeenCalledWith('bullet');

    const orderedBtn = screen.getByTitle(/numbered list/i);
    fireEvent.click(orderedBtn);
    expect(handleFormat).toHaveBeenCalledWith('ordered');

    const select = screen.getByTitle(/heading level/i);
    fireEvent.change(select, { target: { value: 'h2' } });
    expect(handleBlockFormat).toHaveBeenCalledWith('h2');
  });
});
