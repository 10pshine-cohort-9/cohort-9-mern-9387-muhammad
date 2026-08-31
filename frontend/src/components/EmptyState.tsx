import React from 'react';
import { StickyNote, Plus } from 'lucide-react';
import { type ActiveTab } from '../constants/navigation';

interface EmptyStateProps {
  activeTab: ActiveTab;
  hasFilters: boolean;
  onOpenCreateModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ activeTab, hasFilters, onOpenCreateModal }) => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#ffffff' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <StickyNote size={24} />
      </div>

      {hasFilters ? (
        <>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>No matching results</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No notes match your filters. Try adjusting your search query or selected tag.
          </p>
        </>
      ) : (
        <>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {activeTab === 'notes' && 'No notes yet'}
            {activeTab === 'pinned' && 'No pinned notes'}
            {activeTab === 'archived' && 'Archive is empty'}
            {activeTab === 'trash' && 'Trash is empty'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: activeTab === 'notes' ? '20px' : '0' }}>
            {activeTab === 'notes' && 'Click "Create Note" or press Ctrl+N to add your first note!'}
            {activeTab === 'pinned' && 'Pin notes from your dashboard to quickly access them here.'}
            {activeTab === 'archived' && 'Archived notes will appear here.'}
            {activeTab === 'trash' && 'Notes in trash will show up here before permanent deletion.'}
          </p>
          {activeTab === 'notes' && (
            <button type="button" className="btn btn-primary" onClick={onOpenCreateModal}>
              <Plus size={18} /> Create Note
            </button>
          )}
        </>
      )}
    </div>
  );
};
