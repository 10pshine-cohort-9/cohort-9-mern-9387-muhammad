import React, { useEffect } from 'react';
import {
  X,
  Edit2,
  Pin,
  Archive,
  Trash2,
  RotateCcw,
  Palette,
  FileDown,
} from 'lucide-react';
import { sanitizeHtmlInput } from '../utils/markdown';
import { type Note } from './NoteModal';
import { ColorDropdown } from './ColorDropdown';

interface ViewNoteModalProps {
  note: Note | null;
  onClose: () => void;
  activeColorMenuId: string | null;
  setActiveColorMenuId: (id: string | null) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  onMoveToTrash: (note: Note) => void;
  onRestoreFromTrash: (note: Note) => void;
  onDeletePermanently: (note: Note) => void;
  onChangeColor: (noteId: string, color: string) => void;
  onExportMarkdown?: (note: Note) => void;
}

export const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  note,
  onClose,
  activeColorMenuId,
  setActiveColorMenuId,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onChangeColor,
  onExportMarkdown,
}) => {
  useEffect(() => {
    if (!note) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [note, onClose]);

  if (!note) return null;

  const isTrashTab = note.isTrashed;

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
        zIndex: 150,
        padding: '16px',
      }}
    >
      <button
        type="button"
        aria-label="Close modal backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          border: 'none',
          cursor: 'default',
          padding: 0,
          margin: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <div
        className="card"
        role="dialog"
        aria-modal="true"
        aria-label="View note"
        style={{
          position: 'relative',
          zIndex: 151,
          backgroundColor: note.color || '#ffffff',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word', margin: 0, flex: 1 }}>
            {note.title}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!isTrashTab && (
              <button
                type="button"
                onClick={() => onTogglePin(note)}
                title={note.isPinned ? 'Unpin note' : 'Pin note'}
                className={`icon-btn ${note.isPinned ? 'pinned' : ''}`}
              >
                <Pin size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close focused view"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: sanitizeHtmlInput(note.content || '') }}
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: '20px',
            wordBreak: 'break-word',
          }}
        />

        {note.tags && note.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {note.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Created {note.createdAt ? new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isTrashTab ? (
              <>
                <button type="button" onClick={() => { onRestoreFromTrash(note); onClose(); }} title="Restore note" className="icon-btn">
                  <RotateCcw size={16} />
                </button>
                <button type="button" onClick={() => { onDeletePermanently(note); onClose(); }} title="Delete permanently" className="icon-btn danger">
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveColorMenuId(activeColorMenuId === note._id ? null : note._id || null);
                    }}
                    title="Change color"
                    className="icon-btn"
                  >
                    <Palette size={16} />
                  </button>

                  {activeColorMenuId === note._id && note._id && (
                    <ColorDropdown
                      currentColor={note.color}
                      onSelectColor={(hex) => {
                        onChangeColor(note._id!, hex);
                        setActiveColorMenuId(null);
                      }}
                    />
                  )}
                </div>

                {onExportMarkdown && (
                  <button type="button" onClick={() => onExportMarkdown(note)} title="Export as Markdown (.md)" className="icon-btn">
                    <FileDown size={16} />
                  </button>
                )}

                <button type="button" onClick={() => onToggleArchive(note)} title={note.isArchived ? 'Unarchive' : 'Archive'} className="icon-btn">
                  <Archive size={16} />
                </button>

                <button type="button" onClick={() => { onEdit(note); onClose(); }} title="Edit note" className="icon-btn">
                  <Edit2 size={16} />
                </button>

                <button type="button" onClick={() => { onMoveToTrash(note); onClose(); }} title="Move to trash" className="icon-btn danger">
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
