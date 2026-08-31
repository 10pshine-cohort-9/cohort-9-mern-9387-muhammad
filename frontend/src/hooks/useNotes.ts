import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initSocket, disconnectSocket } from '../services/socket';
import { SOCKET_EVENTS } from '../constants/events';
import type { Note } from '../types/note';
import type { ActiveTab } from '../constants/navigation';
import { downloadNoteAsMarkdown, parseMarkdownFile, MAX_IMPORT_FILE_SIZE_BYTES } from '../utils/markdown';

interface ConfirmConfig {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
}

export function useNotes(activeTab: ActiveTab) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const loadNotes = useCallback(async () => {
        try {
            const response = await fetchAPI<{ data: Note[] }>('/notes');
            setNotes(response.data || []);
        } catch (err) {
            const msg = (err as Error).message;
            if (msg.includes('Not authorized') || msg.includes('token failed')) {
                logout();
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        let isMounted = true;
        const fetchInitialNotes = async () => {
            try {
                setLoading(true);
                const response = await fetchAPI<{ data: Note[] }>('/notes');
                if (isMounted) {
                    setNotes(response.data || []);
                }
            } catch (err) {
                if (isMounted) {
                    const msg = (err as Error).message;
                    if (msg.includes('Not authorized') || msg.includes('token failed')) {
                        logout();
                    } else {
                        setError(msg);
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void fetchInitialNotes();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!token) {
            disconnectSocket();
            return;
        }

        const socket = initSocket(token);

        const handleUpdate = () => {
            void loadNotes();
        };

        socket.on(SOCKET_EVENTS.NOTE_CREATED, handleUpdate);
        socket.on(SOCKET_EVENTS.NOTE_UPDATED, handleUpdate);
        socket.on(SOCKET_EVENTS.NOTE_DELETED, handleUpdate);
        socket.on(SOCKET_EVENTS.NOTE_TRASH_EMPTIED, handleUpdate);
        socket.on(SOCKET_EVENTS.NOTE_IMPORTED, handleUpdate);

        return () => {
            socket.off(SOCKET_EVENTS.NOTE_CREATED, handleUpdate);
            socket.off(SOCKET_EVENTS.NOTE_UPDATED, handleUpdate);
            socket.off(SOCKET_EVENTS.NOTE_DELETED, handleUpdate);
            socket.off(SOCKET_EVENTS.NOTE_TRASH_EMPTIED, handleUpdate);
            socket.off(SOCKET_EVENTS.NOTE_IMPORTED, handleUpdate);
        };
    }, [token, loadNotes]);

    const handleExportNotes = async () => {
        try {
            setError('');
            const data = await fetchAPI<{ count: number; notes: Note[]; scope?: string }>('/notes/export?scope=' + activeTab);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const formattedDate = new Date().toISOString().slice(0, 10);
            a.download = `shine-notes-${activeTab}-${formattedDate}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Notes exported successfully (${data.count ?? 0} note(s)).`);
        } catch {
            toast.error('Failed to export notes.');
        }
    };

    const handleExportSingleMarkdown = (note: Note) => {
        try {
            downloadNoteAsMarkdown(note);
            toast.success(`Exported "${note.title}" to Markdown.`);
        } catch {
            toast.error('Failed to export note as Markdown.');
        }
    };

    const handleImportNotes = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            setError('');
            const notesToImport: Array<Partial<Note>> = [];

            for (const file of files) {
                if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
                    toast.error(`File "${file.name}" exceeds the 10 MB limit.`);
                    continue;
                }

                const textContent = await file.text();
                if (!textContent) continue;

                if (file.name.endsWith('.md') || file.type === 'text/markdown') {
                    const parsedNote = parseMarkdownFile(textContent, file.name);
                    notesToImport.push(parsedNote);
                } else {
                    try {
                        const json = JSON.parse(textContent);
                        const parsed = Array.isArray(json)
                            ? json
                            : Array.isArray(json.data)
                                ? json.data
                                : Array.isArray(json.notes)
                                    ? json.notes
                                    : null;

                        if (parsed) {
                            notesToImport.push(...parsed);
                        }
                    } catch {
                        const parsedNote = parseMarkdownFile(textContent, file.name);
                        notesToImport.push(parsedNote);
                    }
                }
            }

            if (notesToImport.length === 0) {
                toast.error('No valid notes found in selected file(s).');
                return;
            }

            const response = await fetchAPI<{ message: string }>('/notes/import', {
                method: 'POST',
                body: JSON.stringify({ notes: notesToImport }),
            });

            toast.success(response.message || 'Notes imported successfully.');
            await loadNotes();
        } catch {
            toast.error('Failed to process import file(s).');
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    const handleSaveNote = async (
        noteData: {
            title: string;
            content: string;
            color?: string;
            tags?: string[];
            isPinned?: boolean;
            isArchived?: boolean;
        },
        editingNote: Note | null,
    ) => {
        if (editingNote) {
            const response = await fetchAPI<{ data: Note }>(`/notes/${editingNote._id}`, {
                method: 'PUT',
                body: JSON.stringify(noteData),
            });
            setNotes((prev) => prev.map((n) => (n._id === editingNote._id ? response.data : n)));
            toast.success('Note updated successfully.');
        } else {
            const response = await fetchAPI<{ data: Note }>('/notes', {
                method: 'POST',
                body: JSON.stringify(noteData),
            });
            setNotes((prev) => [response.data, ...prev]);
            toast.success('Note created successfully.');
        }
    };

    const handleTogglePin = async (note: Note, onUpdateView?: (updated: Note) => void) => {
        const updatedStatus = !note.isPinned;
        setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, isPinned: updatedStatus } : n)));
        if (onUpdateView) {
            onUpdateView({ ...note, isPinned: updatedStatus });
        }
        try {
            await fetchAPI(`/notes/${note._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isPinned: updatedStatus }),
            });
        } catch {
            loadNotes();
        }
    };

    const handleToggleArchive = async (note: Note, onClearView?: () => void) => {
        const updatedStatus = !note.isArchived;
        setNotes((prev) =>
            prev.map((n) => (n._id === note._id ? { ...n, isArchived: updatedStatus, isPinned: false } : n)),
        );
        if (onClearView) onClearView();
        try {
            await fetchAPI(`/notes/${note._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isArchived: updatedStatus, isPinned: false }),
            });
        } catch {
            loadNotes();
        }
    };

    const handleMoveToTrash = async (note: Note, onClearView?: () => void) => {
        setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, isTrashed: true } : n)));
        if (onClearView) onClearView();
        toast.success('Note moved to trash.');
        try {
            await fetchAPI(`/notes/${note._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isTrashed: true }),
            });
        } catch {
            loadNotes();
        }
    };

    const handleRestoreFromTrash = async (note: Note, onUpdateView?: (updated: Note) => void) => {
        setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, isTrashed: false } : n)));
        if (onUpdateView) {
            onUpdateView({ ...note, isTrashed: false });
        }
        toast.success('Note restored successfully.');
        try {
            await fetchAPI(`/notes/${note._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isTrashed: false }),
            });
        } catch {
            loadNotes();
        }
    };

    const handleDeletePermanently = (note: Note, onClearView?: () => void) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Note Permanently',
            message: 'This action cannot be undone. Are you sure you want to proceed?',
            confirmText: 'Delete Permanently',
            isDanger: true,
            onConfirm: async () => {
                setNotes((prev) => prev.filter((n) => n._id !== note._id));
                if (onClearView) onClearView();
                toast.success('Note permanently deleted.');
                try {
                    await fetchAPI(`/notes/${note._id}`, { method: 'DELETE' });
                } catch {
                    loadNotes();
                }
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const requestEmptyTrash = (onClearView?: () => void) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Empty Trash',
            message: 'Are you sure you want to permanently delete all items in trash?',
            confirmText: 'Empty Trash',
            isDanger: true,
            onConfirm: async () => {
                setNotes((prev) => prev.filter((n) => !n.isTrashed));
                if (onClearView) onClearView();
                toast.success('Trash emptied successfully.');
                try {
                    await fetchAPI('/notes/trash/empty', { method: 'DELETE' });
                } catch {
                    loadNotes();
                }
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleChangeColor = async (noteId: string, color: string, onUpdateView?: (color: string) => void) => {
        setNotes((prev) => prev.map((n) => (n._id === noteId ? { ...n, color } : n)));
        if (onUpdateView) onUpdateView(color);
        try {
            await fetchAPI(`/notes/${noteId}`, {
                method: 'PUT',
                body: JSON.stringify({ color }),
            });
        } catch {
            loadNotes();
        }
    };

    const closeConfirmModal = () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    };

    return {
        notes,
        loading,
        error,
        confirmConfig,
        loadNotes,
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
    };
}
