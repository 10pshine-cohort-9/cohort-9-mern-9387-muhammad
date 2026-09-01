import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAPI } from '../api';

describe('fetchAPI utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('performs successful GET request without token', async () => {
    const mockData = { success: true, data: [] };
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    const result = await fetchAPI('/test-endpoint');
    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-endpoint'),
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it('attaches Authorization header when token exists in localStorage', async () => {
    localStorage.setItem('token', 'sample-jwt-token');
    const mockData = { id: 1 };
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    const result = await fetchAPI('/protected', { method: 'POST', body: JSON.stringify({ key: 'val' }) });
    expect(result).toEqual(mockData);

    const fetchCalls = vi.mocked(globalThis.fetch).mock.calls;
    expect(fetchCalls.length).toBeGreaterThan(0);
    const callOptions = fetchCalls[0]?.[1];
    const headers = callOptions?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer sample-jwt-token');
  });

  it('throws custom error when response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Resource not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(fetchAPI('/invalid')).rejects.toThrow('Resource not found');
  });

  it('throws generic error when non-Error object is thrown', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue('Server crash string');

    await expect(fetchAPI('/crash')).rejects.toThrow('Network or API error');
  });
});
