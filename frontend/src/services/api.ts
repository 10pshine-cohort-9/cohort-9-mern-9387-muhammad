const resolveApiBaseUrl = (): string => {
    const rawUrl = import.meta.env.VITE_API_URL;
    if (!rawUrl || typeof rawUrl !== 'string') {
        return 'http://localhost:4000/api';
    }

    try {
        const parsed = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
        const isLoopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

        if (parsed.protocol === 'http:' && !isLoopback) {
            return '/api';
        }
        return rawUrl.replace(/\/+$/, '');
    } catch {
        return '/api';
    }
};

const API_BASE_URL = resolveApiBaseUrl();

export const fetchAPI = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data as T;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Network or API error');
    }
};