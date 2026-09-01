import React from 'react';
import {
    Bold,
    Italic,
    Underline,
    Heading,
    List,
    ListOrdered,
} from 'lucide-react';

interface EditorToolbarProps {
    activeFormats: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
    };
    onFormat: (format: 'bold' | 'italic' | 'underline' | 'bullet' | 'ordered') => void;
    onBlockFormat: (tag: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    activeFormats,
    onFormat,
    onBlockFormat,
}) => {
    return (
        <div className="modal-toolbar">
            <button
                type="button"
                onClick={() => onFormat('bold')}
                title="Bold (Ctrl+B)"
                className={`modal-toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
                style={{
                    background: activeFormats.bold ? '#ECFDF5' : 'transparent',
                    color: activeFormats.bold ? '#059669' : '#334155',
                }}
            >
                <Bold size={16} />
            </button>
            <button
                type="button"
                onClick={() => onFormat('italic')}
                title="Italic (Ctrl+I)"
                className={`modal-toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
                style={{
                    background: activeFormats.italic ? '#ECFDF5' : 'transparent',
                    color: activeFormats.italic ? '#059669' : '#334155',
                }}
            >
                <Italic size={16} />
            </button>
            <button
                type="button"
                onClick={() => onFormat('underline')}
                title="Underline (Ctrl+U)"
                className={`modal-toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
                style={{
                    background: activeFormats.underline ? '#ECFDF5' : 'transparent',
                    color: activeFormats.underline ? '#059669' : '#334155',
                }}
            >
                <Underline size={16} />
            </button>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heading size={16} style={{ color: '#334155', marginLeft: '2px' }} />
                <select
                    title="Heading Level & Section Style"
                    onChange={(e) => onBlockFormat(e.target.value)}
                    style={{
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                        outline: 'none',
                    }}
                >
                    <option value="p">Body Text</option>
                    <option value="h1">Title (H1)</option>
                    <option value="h2">Subtitle (H2)</option>
                    <option value="h3">Heading (H3)</option>
                    <option value="h4">Subheading (H4)</option>
                    <option value="h5">Section (H5)</option>
                    <option value="h6">Subsection (H6)</option>
                </select>
            </div>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

            <button
                type="button"
                onClick={() => onFormat('bullet')}
                title="Bullet List"
                className="modal-toolbar-btn"
                style={{ color: '#334155' }}
            >
                <List size={16} />
            </button>
            <button
                type="button"
                onClick={() => onFormat('ordered')}
                title="Numbered List"
                className="modal-toolbar-btn"
                style={{ color: '#334155' }}
            >
                <ListOrdered size={16} />
            </button>
        </div>
    );
};
