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
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    } as unknown as Response);

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
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    } as unknown as Response);

    const result = await fetchAPI('/protected', { method: 'POST', body: JSON.stringify({ key: 'val' }) });
    expect(result).toEqual(mockData);
  });

  it('throws custom error when response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 'Resource not found' }),
    } as unknown as Response);

    await expect(fetchAPI('/invalid')).rejects.toThrow('Resource not found');
  });

  it('throws generic error when non-Error object is thrown', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue('Server crash string');

    await expect(fetchAPI('/crash')).rejects.toThrow('Network or API error');
  });
});
