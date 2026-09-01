import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('App Middleware & 404 Handler', () => {
  it('should return 404 JSON response for nonexistent routes', async () => {
    const response = await request(app).get('/api/nonexistent-route-path');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Route /api/nonexistent-route-path not found',
    });
  });

  it('should preserve 400 status code for malformed JSON request bodies', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ malformed_json: ');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });
});
