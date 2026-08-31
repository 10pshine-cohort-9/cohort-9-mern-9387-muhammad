import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { fetchAPI } from '../services/api';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
            return;
        }

        try {
            setIsChangingPassword(true);
            await fetchAPI('/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            toast.success('Password updated successfully.');
            setPasswordMessage({ text: 'Password updated successfully!', type: 'success' });
            setTimeout(() => {
                onClose();
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordMessage(null);
            }, 1800);
        } catch (err) {
            const msg = (err as Error).message || 'Failed to update password';
            setPasswordMessage({ text: msg, type: 'error' });
            toast.error(msg);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '16px',
            }}
        >
            <button
                type="button"
                aria-label="Close modal backdrop"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
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
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Change password"
                style={{
                    position: 'relative',
                    zIndex: 1001,
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '440px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Change Security Password
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {passwordMessage && (
                    <div
                        style={{
                            padding: '10px 14px',
                            backgroundColor: passwordMessage.type === 'success' ? '#ECFDF5' : '#FEE2E2',
                            border: `1px solid ${passwordMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                            color: passwordMessage.type === 'success' ? '#047857' : '#991B1B',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : null}
                        {passwordMessage.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="current-pass">Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="current-pass"
                                type={showCurrentPassword ? 'text' : 'password'}
                                required
                                className="form-control"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="new-pass">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="new-pass"
                                type={showNewPassword ? 'text' : 'password'}
                                required
                                className="form-control"
                                placeholder="At least 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-pass">Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="confirm-pass"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                className="form-control"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                            {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
