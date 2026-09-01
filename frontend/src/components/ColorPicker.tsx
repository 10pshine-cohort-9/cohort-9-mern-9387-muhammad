import React from 'react';
import { Palette } from 'lucide-react';
import { PASTEL_COLORS } from '../types/note';

interface ColorPickerProps {
    selectedColor: string;
    onSelectColor: (hex: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    selectedColor,
    onSelectColor,
}) => {
    return (
        <div className="form-group" style={{ marginBottom: '18px', marginTop: '16px' }}>
            <label className="modal-section-label" style={{ marginBottom: '8px' }}>
                <Palette size={16} /> Note Color
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {PASTEL_COLORS.map((c) => (
                    <button
                        key={c.hex}
                        type="button"
                        onClick={() => onSelectColor(c.hex)}
                        title={c.name}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: c.hex,
                            border: selectedColor === c.hex ? '2px solid var(--primary)' : `1px solid ${c.border}`,
                            cursor: 'pointer',
                            boxShadow: selectedColor === c.hex ? '0 0 0 2px rgba(16,185,129,0.3)' : 'none',
                            transition: 'all 0.15s ease',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
