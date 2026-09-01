import { describe, it, expect } from 'vitest';
import {
  publishNoteCreated,
  publishNoteUpdated,
  publishNoteDeleted,
  publishTrashEmptied,
  publishNotesImported,
} from '../services/notePublisher.js';

describe('Note Publisher Service', () => {
  it('calls publisher helpers without throwing errors even if socket io is not initialized', () => {
    expect(() => publishNoteCreated('user-1', { title: 'New Note' })).not.toThrow();
    expect(() => publishNoteUpdated('user-1', { title: 'Updated Note' })).not.toThrow();
    expect(() => publishNoteDeleted('user-1', 'note-1')).not.toThrow();
    expect(() => publishTrashEmptied('user-1')).not.toThrow();
    expect(() => publishNotesImported('user-1', 5)).not.toThrow();
  });
});
