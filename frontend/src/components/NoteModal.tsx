import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { sanitizeHtmlInput } from '../utils/markdown';
import { type Note, PASTEL_COLORS } from '../types/note';
import { useRichEditor } from '../hooks/useRichEditor';
import { EditorToolbar } from './EditorToolbar';
import { ColorPicker } from './ColorPicker';
import { TagInput } from './TagInput';

export type { Note };
export { PASTEL_COLORS };

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (noteData: {
        title: string;
        content: string;
        color?: string;
        tags?: string[];
        isPinned?: boolean;
        isArchived?: boolean;
    }) => Promise<void>;
    initialNote?: Note | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialNote,
}) => {
    const [title, setTitle] = useState(() => initialNote?.title || '');
    const [content, setContent] = useState(() => initialNote?.content || '');
    const [selectedColor, setSelectedColor] = useState(() => initialNote?.color || '#ffffff');
    const [tags, setTags] = useState<string[]>(() => initialNote?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [modalError, setModalError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const {
        editorRef,
        activeFormats,
        handleEditorInput,
        handleEditorKeyDown,
        applyFormatting,
        applyBlockFormatting,
        updateActiveFormats,
        setEditorContent,
        getEditorContent,
    } = useRichEditor();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setEditorContent(initialNote?.content || '');
    }, [isOpen, initialNote, setEditorContent]);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSaving) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isSaving, onClose]);

    if (!isOpen) return null;

    const handleAddTag = () => {
        const trimmed = tagInput.trim().replace(/^#/, '');
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const onInput = () => {
        const html = handleEditorInput();
        setContent(html);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        handleEditorKeyDown(e);
        const html = getEditorContent();
        setContent(html);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');

        const finalContent = sanitizeHtmlInput(getEditorContent() || content);

        if (!title.trim() || !finalContent.trim() || finalContent === '<br>') {
            setModalError('Both title and content are required.');
            return;
        }

        try {
            setIsSaving(true);
            await onSave({
                title: title.trim(),
                content: finalContent.trim(),
                color: selectedColor,
                tags,
                isPinned: initialNote?.isPinned || false,
                isArchived: initialNote?.isArchived || false,
            });
            setIsSaving(false);
            onClose();
        } catch (err) {
            setIsSaving(false);
            setModalError((err as Error).message || 'Failed to save note');
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '16px',
            }}
        >
            <button
                type="button"
                aria-label="Close modal backdrop"
                disabled={isSaving}
                onClick={isSaving ? undefined : onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'default',
                    padding: 0,
                    margin: 0,
                    width: '100%',
                    height: '100%',
                }}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={initialNote ? 'Edit note' : 'Create new note'}
                style={{
                    position: 'relative',
                    zIndex: 1001,
                    backgroundColor: selectedColor || '#ffffff',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '560px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)',
                    transition: 'background-color 0.2s ease',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}
                >
                    <h3
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                        }}
                    >
                        {initialNote ? 'Edit Note' : 'Create New Note'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Close modal"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            opacity: isSaving ? 0.5 : 1,
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {modalError && (
                    <div
                        style={{
                            backgroundColor: '#FEE2E2',
                            border: '1px solid #FECACA',
                            color: '#991B1B',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            marginBottom: '16px',
                        }}
                    >
                        {modalError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '18px' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}
                        >
                            <label htmlFor="note-title" style={{ margin: 0 }}>
                                Title
                            </label>
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                {title.length} / 100
                            </span>
                        </div>
                        <input
                            id="note-title"
                            type="text"
                            required
                            maxLength={100}
                            className="form-control"
                            placeholder="Note title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                        />
                    </div>

                    <div className="form-group">
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}
                        >
                            <label htmlFor="note-content" style={{ margin: 0 }}>
                                Content & Formatting (Ctrl+B, Ctrl+I, Ctrl+U)
                            </label>
                        </div>

                        <EditorToolbar
                            activeFormats={activeFormats}
                            onFormat={applyFormatting}
                            onBlockFormat={applyBlockFormatting}
                        />

                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            role="textbox"
                            aria-label="Note content editor"
                            tabIndex={0}
                            className="rich-editor"
                            data-placeholder="Write your note content here..."
                            onInput={onInput}
                            onKeyDown={onKeyDown}
                            onKeyUp={updateActiveFormats}
                            onMouseUp={updateActiveFormats}
                        />

                        <textarea
                            ref={textareaRef}
                            id="note-content"
                            required
                            className="form-control"
                            placeholder="Write your note content here..."
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                setEditorContent(e.target.value);
                            }}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <ColorPicker
                        selectedColor={selectedColor}
                        onSelectColor={setSelectedColor}
                    />

                    <TagInput
                        tags={tags}
                        tagInput={tagInput}
                        onTagInputChange={setTagInput}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                    />

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--border)',
                        }}
                    >
                        <button
                            type="button"
                            className="btn"
                            disabled={isSaving}
                            onClick={onClose}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.5 : 1,
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : initialNote ? 'Update Note' : 'Save Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};