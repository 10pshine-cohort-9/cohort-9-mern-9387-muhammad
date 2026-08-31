import React, { useState } from 'react';
import {
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

interface NoteCardProps {
  note: Note;
  activeTab: string;
  activeColorMenuId: string | null;
  setActiveColorMenuId: (id: string | null) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  onMoveToTrash: (note: Note) => void;
  onRestoreFromTrash: (note: Note) => void;
  onDeletePermanently: (note: Note) => void;
  onChangeColor: (noteId: string, color: string) => void;
  onSelectForView?: (note: Note) => void;
  onExportMarkdown?: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  activeTab,
  activeColorMenuId,
  setActiveColorMenuId,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onChangeColor,
  onSelectForView,
  onExportMarkdown,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTrashTab = activeTab === 'trash' || note.isTrashed;

  const plainText = note.content ? note.content.replace(/<[^>]*>/g, '').trim() : '';
  const isLongContent = plainText.length > 140 || (note.content && note.content.includes('<p>') && note.content.split('</p>').length > 3);

  const handleSeeMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.innerWidth > 768 && onSelectForView) {
      onSelectForView(note);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className="card card-hoverable"
      style={{
        backgroundColor: note.color || '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        minHeight: '180px',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
            {note.title}
          </h3>
          {!isTrashTab && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note);
              }}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
              className={`icon-btn ${note.isPinned ? 'pinned' : ''}`}
            >
              <Pin size={16} />
            </button>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlInput(note.content || '') }}
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              maxHeight: isExpanded ? 'none' : '110px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              transition: 'max-height 0.2s ease',
            }}
          />
          {isLongContent && (
            <button
              type="button"
              onClick={handleSeeMoreClick}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '2px 0',
                marginTop: '4px',
                display: 'inline-block',
              }}
            >
              {isExpanded ? 'Show less' : '...See more'}
            </button>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
            {note.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {new Date(note.createdAt || 0).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isTrashTab ? (
            <>
              <button type="button" onClick={() => onRestoreFromTrash(note)} title="Restore note" className="icon-btn">
                <RotateCcw size={16} />
              </button>
              <button type="button" onClick={() => onDeletePermanently(note)} title="Delete permanently" className="icon-btn danger">
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

              <button type="button" onClick={() => onEdit(note)} title="Edit note" className="icon-btn">
                <Edit2 size={16} />
              </button>

              <button type="button" onClick={() => onMoveToTrash(note)} title="Move to trash" className="icon-btn danger">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
