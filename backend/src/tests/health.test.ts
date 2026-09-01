import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('GET /health', () => {
  it('should return 200 OK with server status and environment', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty(
      'message',
      'Shine Notes API is running',
    );
    expect(response.body).toHaveProperty('environment');
  });
});
