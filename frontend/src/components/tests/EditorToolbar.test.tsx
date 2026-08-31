import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorToolbar } from '../EditorToolbar';

describe('EditorToolbar Component', () => {
  it('renders formatting buttons and triggers format callbacks', () => {
    const handleFormat = vi.fn();
    const handleBlockFormat = vi.fn();

    render(
      <EditorToolbar
        activeFormats={{ bold: true, italic: false, underline: false }}
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

    const select = screen.getByTitle(/heading level/i);
    fireEvent.change(select, { target: { value: 'h2' } });
    expect(handleBlockFormat).toHaveBeenCalledWith('h2');
  });
});
