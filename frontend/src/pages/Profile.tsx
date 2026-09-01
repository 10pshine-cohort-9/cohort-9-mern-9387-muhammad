import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    User as UserIcon,
    Mail,
    ShieldCheck,
    ArrowLeft,
    LogOut,
    Calendar,
    StickyNote,
    Pin,
    Inbox,
    Trash,
    Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { type Note } from '../types/note';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        total: 0,
        pinned: 0,
        archived: 0,
        trash: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                const response = await fetchAPI<{ data: Note[] }>('/notes');
                const allNotes = response.data || [];

                if (isMounted) {
                    setStats({
                        total: allNotes.filter((n) => !n.isTrashed && !n.isArchived).length,
                        pinned: allNotes.filter((n) => n.isPinned && !n.isTrashed && !n.isArchived).length,
                        archived: allNotes.filter((n) => n.isArchived && !n.isTrashed).length,
                        trash: allNotes.filter((n) => n.isTrashed).length,
                    });
                }
            } catch (err) {
                console.error('Failed to load note statistics:', err);
            } finally {
                if (isMounted) {
                    setLoadingStats(false);
                }
            }
        };

        if (user) {
            void fetchStats();
        }

        return () => {
            isMounted = false;
        };
    }, [user]);

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLogoutWithToast = () => {
        toast.success('Logged out successfully.');
        handleLogout();
    };

    return (
        <div className="container" style={{ maxWidth: '680px', padding: '40px 16px' }}>
            <Link
                to="/dashboard"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    marginBottom: '24px',
                }}
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <div
                className="card"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '32px',
                    borderRadius: '16px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                    <div
                        style={{
                            width: '76px',
                            height: '76px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.2rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                            border: '3px solid #ffffff',
                        }}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {user.name}
                        </h2>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#ECFDF5',
                                color: '#047857',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: '12px',
                            }}
                        >
                            <ShieldCheck size={14} /> Signed In Account
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.05em' }}>
                        Account Information
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <UserIcon size={18} style={{ color: 'var(--primary)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <Mail size={18} style={{ color: 'var(--primary)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.email}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <Calendar size={18} style={{ color: 'var(--primary)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Member Since</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                                        : 'August 2026'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.05em' }}>
                        Your Activity Overview
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px 12px', borderRadius: '12px', textAlign: 'center' }}>
                            <StickyNote size={20} style={{ color: '#047857', marginBottom: '6px' }} />
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#047857' }}>
                                {loadingStats ? '-' : stats.total}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065F46' }}>Active</div>
                        </div>

                        <div style={{ backgroundColor: '#FEFCE8', border: '1px solid #FEF08A', padding: '16px 12px', borderRadius: '12px', textAlign: 'center' }}>
                            <Pin size={20} style={{ color: '#A16207', marginBottom: '6px' }} />
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#A16207' }}>
                                {loadingStats ? '-' : stats.pinned}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#854D0E' }}>Pinned</div>
                        </div>

                        <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '16px 12px', borderRadius: '12px', textAlign: 'center' }}>
                            <Inbox size={20} style={{ color: '#0369A1', marginBottom: '6px' }} />
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0369A1' }}>
                                {loadingStats ? '-' : stats.archived}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#075985' }}>Archived</div>
                        </div>

                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '16px 12px', borderRadius: '12px', textAlign: 'center' }}>
                            <Trash size={20} style={{ color: '#B91C1C', marginBottom: '6px' }} />
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#B91C1C' }}>
                                {loadingStats ? '-' : stats.trash}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991B1B' }}>In Trash</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.05em' }}>
                        Quick Actions
                    </h3>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setIsPasswordModalOpen(true)}
                            style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid var(--border)' }}
                        >
                            <Key size={16} /> Change Password
                        </button>

                        <button
                            type="button"
                            className="btn"
                            onClick={handleLogoutWithToast}
                            style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}
                        >
                            <LogOut size={16} /> Logout Account
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

