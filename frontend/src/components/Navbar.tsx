import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
    onToggleMobileDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileDrawer }) => {
    const { user } = useAuth();

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user && onToggleMobileDrawer && (
                        <button
                            type="button"
                            className="mobile-hamburger-btn"
                            onClick={onToggleMobileDrawer}
                            title="Toggle Navigation Menu"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Menu size={20} />
                        </button>
                    )}

                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Lightbulb size={24} style={{ color: 'var(--primary)' }} />
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                            SHINE<span style={{ color: 'var(--primary)' }}>NOTES</span>
                        </h1>
                    </Link>
                </div>

                {user && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link
                            to="/profile"
                            title={`Account Profile (${user.name})`}
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px',
                                borderRadius: '50%',
                                transition: 'transform 0.2s ease',
                            }}
                        >
                            <div
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                                    border: '2px solid #ffffff',
                                }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};