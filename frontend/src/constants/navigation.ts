export type ActiveTab = 'notes' | 'pinned' | 'archived' | 'trash';
export type SortOption = 'newest' | 'oldest' | 'pinned';

export const NAVIGATION_TABS = [
  { id: 'notes', label: 'All Notes' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'archived', label: 'Archive' },
  { id: 'trash', label: 'Trash' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Sort: Newest First' },
  { value: 'oldest', label: 'Sort: Oldest First' },
  { value: 'pinned', label: 'Sort: Pinned First' },
] as const;
