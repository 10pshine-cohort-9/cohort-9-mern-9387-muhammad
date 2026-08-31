const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const fetchAPI = async <T = any>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> => {
    const token = localStorage.getItem('token');

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