import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from '../ColorPicker';
import { ColorDropdown } from '../ColorDropdown';
import { PASTEL_COLORS } from '../../types/note';

describe('ColorPicker Component', () => {
  it('renders all pastel color buttons and calls onSelectColor when clicked', () => {
    const handleSelectColor = vi.fn();
    render(
      <ColorPicker selectedColor="#ffffff" onSelectColor={handleSelectColor} />,
    );

    expect(screen.getByText(/note color/i)).toBeInTheDocument();
    const colorBtn = screen.getByTitle(PASTEL_COLORS[1].name);
    expect(colorBtn).toBeInTheDocument();

    fireEvent.click(colorBtn);
    expect(handleSelectColor).toHaveBeenCalledWith(PASTEL_COLORS[1].hex);
  });
});

describe('ColorDropdown Component', () => {
  it('renders dropdown color dots and calls onSelectColor when clicked', () => {
    const handleSelectColor = vi.fn();
    render(
      <ColorDropdown
        selectedColor="#ffffff"
        onSelectColor={handleSelectColor}
      />,
    );

    const firstColorDot = screen.getByTitle(PASTEL_COLORS[0].name);
    expect(firstColorDot).toBeInTheDocument();

    fireEvent.click(firstColorDot);
    expect(handleSelectColor).toHaveBeenCalledWith(PASTEL_COLORS[0].hex);
  });
});
