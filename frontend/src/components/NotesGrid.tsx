import React from 'react';
import { type Note } from './NoteModal';
import { NoteCard } from './NoteCard';

interface NotesGridProps {
  notes: Note[];
  isListView: boolean;
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

export const NotesGrid: React.FC<NotesGridProps> = ({
  notes,
  isListView,
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
  return (
    <div className={isListView ? 'notes-grid-list' : 'notes-grid'}>
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          activeTab={activeTab}
          activeColorMenuId={activeColorMenuId}
          setActiveColorMenuId={setActiveColorMenuId}
          onEdit={onEdit}
          onTogglePin={onTogglePin}
          onToggleArchive={onToggleArchive}
          onMoveToTrash={onMoveToTrash}
          onRestoreFromTrash={onRestoreFromTrash}
          onDeletePermanently={onDeletePermanently}
          onChangeColor={onChangeColor}
          onSelectForView={onSelectForView}
          onExportMarkdown={onExportMarkdown}
        />
      ))}
    </div>
  );
};
