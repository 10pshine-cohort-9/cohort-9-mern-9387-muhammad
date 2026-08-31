export interface Note {
    _id?: string;
    title: string;
    content: string;
    color?: string;
    tags?: string[];
    isPinned?: boolean;
    isArchived?: boolean;
    isTrashed?: boolean;
    createdAt?: string;
}

export const PASTEL_COLORS = [
    { name: 'Default White', hex: '#ffffff', border: 'var(--border)' },
    { name: 'Soft Yellow', hex: '#fef3c7', border: '#fde047' },
    { name: 'Soft Green', hex: '#d1fae5', border: '#86efac' },
    { name: 'Soft Blue', hex: '#e0f2fe', border: '#7dd3fc' },
    { name: 'Soft Purple', hex: '#f3e8ff', border: '#d8b4fe' },
    { name: 'Soft Pink', hex: '#fce7f3', border: '#f472b6' },
];
