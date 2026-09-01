import { emitToUser } from '../config/socket.js';
import { SOCKET_EVENTS } from '../config/events.js';

export const publishNoteCreated = (userId: string, note: unknown): void => {
  emitToUser(userId, SOCKET_EVENTS.NOTE_CREATED, note);
};

export const publishNoteUpdated = (userId: string, note: unknown): void => {
  emitToUser(userId, SOCKET_EVENTS.NOTE_UPDATED, note);
};

export const publishNoteDeleted = (userId: string, id: string): void => {
  emitToUser(userId, SOCKET_EVENTS.NOTE_DELETED, { id });
};

export const publishTrashEmptied = (userId: string): void => {
  emitToUser(userId, SOCKET_EVENTS.NOTE_TRASH_EMPTIED, {});
};

export const publishNotesImported = (userId: string, count: number): void => {
  emitToUser(userId, SOCKET_EVENTS.NOTE_IMPORTED, { count });
};
