import React from 'react';
import { PASTEL_COLORS } from '../types/note';

interface ColorDropdownProps {
    currentColor?: string;
    onSelectColor: (hex: string) => void;
}

export const ColorDropdown: React.FC<ColorDropdownProps> = ({
    currentColor,
    onSelectColor,
}) => {
    return (
        <div className="color-picker-dropdown" role="group" aria-label="Color options">
            {PASTEL_COLORS.map((c) => (
                <button
                    key={c.hex}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectColor(c.hex);
                    }}
                    className={`color-dot ${currentColor === c.hex ? 'selected' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                />
            ))}
        </div>
    );
};
