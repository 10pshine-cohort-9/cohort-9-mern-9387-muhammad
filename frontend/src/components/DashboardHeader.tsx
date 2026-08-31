import React, { useRef } from 'react';
import { Search, Plus, ArrowUpDown, LayoutGrid, List, Download, Upload, Trash2, X } from 'lucide-react';
import { type ActiveTab, type SortOption, SORT_OPTIONS } from '../constants/navigation';

interface DashboardHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  isListView: boolean;
  setIsListView: (val: boolean) => void;
  activeTab: ActiveTab;
  trashedCount: number;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmptyTrash: () => void;
  onOpenCreateModal: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  isListView,
  setIsListView,
  activeTab,
  trashedCount,
  onExport,
  onImport,
  onEmptyTrash,
  onOpenCreateModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="dashboard-header" style={{ marginBottom: '24px' }}>
      <div className="dashboard-header-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div className="dashboard-header-search" style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, content, or #tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', paddingRight: searchTerm ? '36px' : '14px', height: '40px' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              title="Clear search text"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '3px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="dashboard-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="dashboard-header-sort" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <select
              className="form-control dashboard-header-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{ height: '38px', padding: '0 10px', width: '100%', minWidth: '138px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn dashboard-header-view-toggle"
            onClick={() => setIsListView(!isListView)}
            title={isListView ? 'Switch to Grid View' : 'Switch to List View'}
            style={{ backgroundColor: '#ffffff', color: '#334155', height: '38px', width: '38px', padding: '0', border: '1px solid var(--border)' }}
          >
            {isListView ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onImport}
            accept=".json,.md"
            multiple
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn"
            onClick={onExport}
            title="Export notes to JSON backup file"
            style={{ backgroundColor: '#ffffff', color: '#334155', height: '38px', padding: '0 12px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
          >
            <Download size={15} /> Export
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import notes from JSON or Markdown (.md) file"
            style={{ backgroundColor: '#ffffff', color: '#334155', height: '38px', padding: '0 12px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
          >
            <Upload size={15} /> Import
          </button>

          {activeTab === 'trash' ? (
            trashedCount > 0 && (
              <button
                type="button"
                className="btn"
                onClick={onEmptyTrash}
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', height: '38px', padding: '0 12px', fontSize: '0.8rem' }}
              >
                <Trash2 size={15} /> Empty Trash ({trashedCount})
              </button>
            )
          ) : (
            <button type="button" className="btn btn-primary" onClick={onOpenCreateModal} style={{ height: '38px', padding: '0 12px', fontSize: '0.8rem' }}>
              <Plus size={16} /> Create Note
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
