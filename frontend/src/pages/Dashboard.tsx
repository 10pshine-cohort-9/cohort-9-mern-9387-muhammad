import React, { useState, useEffect, useMemo } from 'react';
import { NoteModal, type Note } from '../components/NoteModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { ViewNoteModal } from '../components/ViewNoteModal';
import { type ActiveTab, type SortOption } from '../constants/navigation';
import { NotesSidebar } from '../components/NotesSidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { EmptyState } from '../components/EmptyState';
import { NotesGrid } from '../components/NotesGrid';
import { Navbar } from '../components/Navbar';
import { useNotes } from '../hooks/useNotes';

export const Dashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [selectedNoteForView, setSelectedNoteForView] = useState<Note | null>(null);
    const [activeColorMenuId, setActiveColorMenuId] = useState<string | null>(null);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isListView, setIsListView] = useState(false);

    const {
        notes,
        loading,
        error,
        confirmConfig,
        handleExportNotes,
        handleExportSingleMarkdown,
        handleImportNotes,
        handleSaveNote,
        handleTogglePin,
        handleToggleArchive,
        handleMoveToTrash,
        handleRestoreFromTrash,
        handleDeletePermanently,
        requestEmptyTrash,
        handleChangeColor,
        closeConfirmModal,
    } = useNotes(activeTab);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                setEditingNote(null);
                setIsModalOpen(true);
            }
        };

        const handleToggleDrawer = () => {
            if (window.innerWidth <= 768) {
                setIsMobileDrawerOpen((prev) => !prev);
            } else {
                setIsSidebarCollapsed((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('toggle-mobile-drawer', handleToggleDrawer);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('toggle-mobile-drawer', handleToggleDrawer);
        };
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('drawer-open', isMobileDrawerOpen);
        document.body.classList.toggle('drawer-open', isMobileDrawerOpen);

        return () => {
            root.classList.remove('drawer-open');
            document.body.classList.remove('drawer-open');
        };
    }, [isMobileDrawerOpen]);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        notes.forEach((note) => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach((t) => tagSet.add(t));
            }
        });
        return Array.from(tagSet);
    }, [notes]);

    const counts = useMemo(
        () => ({
            notes: notes.filter((n) => !n.isTrashed && !n.isArchived).length,
            pinned: notes.filter((n) => n.isPinned && !n.isTrashed && !n.isArchived).length,
            archived: notes.filter((n) => n.isArchived && !n.isTrashed).length,
            trash: notes.filter((n) => n.isTrashed).length,
        }),
        [notes],
    );

    const filteredNotes = useMemo(() => {
        return notes
            .filter((note) => {
                if (activeTab === 'notes' && (note.isTrashed || note.isArchived)) return false;
                if (activeTab === 'pinned' && (!note.isPinned || note.isTrashed || note.isArchived)) return false;
                if (activeTab === 'archived' && (!note.isArchived || note.isTrashed)) return false;
                if (activeTab === 'trash' && !note.isTrashed) return false;

                if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) return false;

                if (searchTerm.trim()) {
                    const query = searchTerm.toLowerCase();
                    const matchTitle = note.title.toLowerCase().includes(query);
                    const matchContent = note.content.toLowerCase().includes(query);
                    const matchTags = note.tags?.some((t) => t.toLowerCase().includes(query));
                    return matchTitle || matchContent || matchTags;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'pinned') return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
            });
    }, [notes, activeTab, selectedTag, searchTerm, sortBy]);

    const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
    const otherNotes = useMemo(
        () => (activeTab === 'notes' && pinnedNotes.length > 0 ? filteredNotes.filter((n) => !n.isPinned) : filteredNotes),
        [filteredNotes, activeTab, pinnedNotes],
    );

    const onSave = async (noteData: {
        title: string;
        content: string;
        color?: string;
        tags?: string[];
        isPinned?: boolean;
        isArchived?: boolean;
    }) => {
        await handleSaveNote(noteData, editingNote);
        setIsModalOpen(false);
        setEditingNote(null);
    };

    const togglePin = (note: Note) => {
        handleTogglePin(note, (updated) => {
            if (selectedNoteForView?._id === note._id) {
                setSelectedNoteForView(updated);
            }
        });
    };

    const toggleArchive = (note: Note) => {
        handleToggleArchive(note, () => {
            if (selectedNoteForView?._id === note._id) {
                setSelectedNoteForView(null);
            }
        });
    };

    const moveToTrash = (note: Note) => {
        handleMoveToTrash(note, () => {
            if (selectedNoteForView?._id === note._id) {
                setSelectedNoteForView(null);
            }
        });
    };

    const restoreFromTrash = (note: Note) => {
        handleRestoreFromTrash(note, (updated) => {
            if (selectedNoteForView?._id === note._id) {
                setSelectedNoteForView(updated);
            }
        });
    };

    const deletePermanently = (note: Note) => {
        handleDeletePermanently(note, () => {
            if (selectedNoteForView?._id === note._id) {
                setSelectedNoteForView(null);
            }
        });
    };

    const emptyTrash = () => {
        requestEmptyTrash(() => {
            setSelectedNoteForView(null);
        });
    };

    const changeColor = (noteId: string, color: string) => {
        handleChangeColor(noteId, color, (newColor) => {
            if (selectedNoteForView?._id === noteId) {
                setSelectedNoteForView((prev) => (prev ? { ...prev, color: newColor } : null));
            }
        });
    };

    return (
        <div className="dashboard-shell" data-testid="dashboard-shell">
            <Navbar onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)} />
            <div className="dashboard-container">
                <NotesSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    allTags={allTags}
                    counts={counts}
                    isCollapsed={isSidebarCollapsed}
                    isMobileDrawerOpen={isMobileDrawerOpen}
                    onCloseMobile={() => setIsMobileDrawerOpen(false)}
                />

                <main className="dashboard-main">

                <DashboardHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    isListView={isListView}
                    setIsListView={setIsListView}
                    activeTab={activeTab}
                    trashedCount={counts.trash}
                    onExport={handleExportNotes}
                    onImport={handleImportNotes}
                    onEmptyTrash={emptyTrash}
                    onOpenCreateModal={() => {
                        setEditingNote(null);
                        setIsModalOpen(true);
                    }}
                />

                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        Loading your notes...
                    </div>
                )}
                {error && <p style={{ color: '#ef4444', marginBottom: '16px', padding: '10px 14px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px' }}>{error}</p>}

                {!loading && filteredNotes.length === 0 && (
                    <EmptyState
                        activeTab={activeTab}
                        hasFilters={Boolean(searchTerm.trim() || selectedTag)}
                        onOpenCreateModal={() => {
                            setEditingNote(null);
                            setIsModalOpen(true);
                        }}
                    />
                )}

                {!loading && activeTab === 'notes' && pinnedNotes.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            PINNED ({pinnedNotes.length})
                        </h4>
                        <NotesGrid
                            notes={pinnedNotes}
                            isListView={isListView}
                            activeTab={activeTab}
                            activeColorMenuId={activeColorMenuId}
                            setActiveColorMenuId={setActiveColorMenuId}
                            onEdit={(n) => {
                                setEditingNote(n);
                                setIsModalOpen(true);
                            }}
                            onTogglePin={togglePin}
                            onToggleArchive={toggleArchive}
                            onMoveToTrash={moveToTrash}
                            onRestoreFromTrash={restoreFromTrash}
                            onDeletePermanently={deletePermanently}
                            onChangeColor={changeColor}
                            onSelectForView={(n) => setSelectedNoteForView(n)}
                            onExportMarkdown={handleExportSingleMarkdown}
                        />
                    </div>
                )}

                {!loading && otherNotes.length > 0 && (
                    <div>
                        {activeTab === 'notes' && pinnedNotes.length > 0 && (
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                OTHERS ({otherNotes.length})
                            </h4>
                        )}
                        <NotesGrid
                            notes={otherNotes}
                            isListView={isListView}
                            activeTab={activeTab}
                            activeColorMenuId={activeColorMenuId}
                            setActiveColorMenuId={setActiveColorMenuId}
                            onEdit={(n) => {
                                setEditingNote(n);
                                setIsModalOpen(true);
                            }}
                            onTogglePin={togglePin}
                            onToggleArchive={toggleArchive}
                            onMoveToTrash={moveToTrash}
                            onRestoreFromTrash={restoreFromTrash}
                            onDeletePermanently={deletePermanently}
                            onChangeColor={changeColor}
                            onSelectForView={(n) => setSelectedNoteForView(n)}
                            onExportMarkdown={handleExportSingleMarkdown}
                        />
                    </div>
                )}

                <NoteModal
                    key={isModalOpen ? editingNote?._id || 'new-note' : 'closed'}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    initialNote={editingNote}
                />

                <ViewNoteModal
                    note={selectedNoteForView}
                    onClose={() => setSelectedNoteForView(null)}
                    activeColorMenuId={activeColorMenuId}
                    setActiveColorMenuId={setActiveColorMenuId}
                    onEdit={(n) => {
                        setSelectedNoteForView(null);
                        setEditingNote(n);
                        setIsModalOpen(true);
                    }}
                    onTogglePin={togglePin}
                    onToggleArchive={toggleArchive}
                    onMoveToTrash={moveToTrash}
                    onRestoreFromTrash={restoreFromTrash}
                    onDeletePermanently={deletePermanently}
                    onChangeColor={changeColor}
                    onExportMarkdown={handleExportSingleMarkdown}
                />

                <ConfirmModal
                    isOpen={confirmConfig.isOpen}
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    confirmText={confirmConfig.confirmText}
                    isDanger={confirmConfig.isDanger}
                    onConfirm={confirmConfig.onConfirm}
                    onCancel={closeConfirmModal}
                />
            </main>
            </div>
        </div>
    );
};