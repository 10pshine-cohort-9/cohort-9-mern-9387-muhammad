import React, { useEffect, useRef } from 'react';
import { StickyNote, Pin, Archive, Trash2, Tag as TagIcon, X } from 'lucide-react';
import { type ActiveTab, NAVIGATION_TABS } from '../constants/navigation';

interface NotesSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: string[];
  counts: {
    notes: number;
    pinned: number;
    archived: number;
    trash: number;
  };
  isCollapsed: boolean;
  isMobileDrawerOpen?: boolean;
  onCloseMobile?: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedTag,
  setSelectedTag,
  allTags,
  counts,
  isCollapsed,
  isMobileDrawerOpen = false,
  onCloseMobile,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isMobileDrawerOpen) return;

    const overlay = overlayRef.current;
    const panel = panelRef.current;

    if (!overlay || !panel) return;

    const handleScrollLock = (event: WheelEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (!overlay.contains(target)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (!panel.contains(target)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.stopPropagation();
    };

    const options = { capture: true, passive: false } as AddEventListenerOptions;
    overlay.addEventListener('wheel', handleScrollLock, options);
    overlay.addEventListener('touchmove', handleScrollLock, options);

    return () => {
      overlay.removeEventListener('wheel', handleScrollLock, options);
      overlay.removeEventListener('touchmove', handleScrollLock, options);
    };
  }, [isMobileDrawerOpen]);

  const getIcon = (id: ActiveTab) => {
    switch (id) {
      case 'notes':
        return StickyNote;
      case 'pinned':
        return Pin;
      case 'archived':
        return Archive;
      case 'trash':
        return Trash2;
    }
  };

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setSelectedTag(null);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAVIGATION_TABS.map((item) => {
          const Icon = getIcon(item.id as ActiveTab);
          const isActive = activeTab === item.id && !selectedTag;
          const count = counts[item.id as ActiveTab] || 0;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleSelectTab(item.id as ActiveTab)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {(!isCollapsed || isMobileDrawerOpen) && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  <span className="sidebar-count">{count}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>

      {allTags.length > 0 && (!isCollapsed || isMobileDrawerOpen) && (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div className="sidebar-section-title">
            <TagIcon size={14} /> Tags
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {allTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => handleSelectTag(tag)}
                className={`sidebar-item ${selectedTag === tag ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
              >
                <span>#{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside className={`sidebar desktop-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {navContent}
      </aside>

      {isMobileDrawerOpen && (
        <div
          ref={overlayRef}
          className="mobile-drawer-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            overflow: 'hidden',
            touchAction: 'none',
          }}
        >
          <button
            type="button"
            aria-label="Close navigation drawer"
            onClick={onCloseMobile}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(4px)',
              border: 'none',
              cursor: 'default',
              padding: 0,
              margin: 0,
              width: '100%',
              height: '100%',
            }}
          />
          <aside
            ref={panelRef}
            className="mobile-drawer-panel"
            aria-label="Mobile navigation"
            style={{
              position: 'relative',
              zIndex: 201,
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: '#ffffff',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflowY: 'auto',
              overflowX: 'hidden',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Navigation</span>
              <button
                type="button"
                onClick={onCloseMobile}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
