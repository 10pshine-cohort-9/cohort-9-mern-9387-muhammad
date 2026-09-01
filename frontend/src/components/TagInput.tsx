import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    tagInput: string;
    onTagInputChange: (value: string) => void;
    onAddTag: () => void;
    onRemoveTag: (tag: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
    tags,
    tagInput,
    onTagInputChange,
    onAddTag,
    onRemoveTag,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            onAddTag();
        }
    };

    return (
        <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="modal-section-label" style={{ marginBottom: '8px' }}>
                <TagIcon size={16} /> Tags & Labels
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Add tag (e.g. work, personal) and press Enter"
                    value={tagInput}
                    onChange={(e) => onTagInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                />
                <button
                    type="button"
                    className="btn modal-action-btn"
                    onClick={onAddTag}
                    style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)' }}
                >
                    Add Tag
                </button>
            </div>
            {tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {tags.map((tag) => (
                        <span key={tag} className="modal-chip">
                            #{tag}
                            <X
                                size={14}
                                className="modal-chip-remove"
                                onClick={() => onRemoveTag(tag)}
                            />
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
