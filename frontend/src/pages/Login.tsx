import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '420px', margin: '60px auto' }}>
                <h2 style={{ marginBottom: '8px' }}>Log In</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                    Access your Shine Notes account
                </p>

                {error && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            className="form-control"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                        {loading ? 'Signing in...' : 'Log In'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};