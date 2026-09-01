import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Notes Protected Routes Authorization', () => {
  it('should return 401 Unauthorized when requesting GET /api/notes without token', async () => {
    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Not authorized, no token provided',
    });
  });

  it('should return 401 Unauthorized when requesting POST /api/notes with invalid token', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Authorization', 'Bearer invalid_jwt_token_string')
      .send({
        title: 'Test Note',
        content: 'Test Content',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Not authorized, token failed',
    });
  });

  it('should return 401 Unauthorized when requesting DELETE /api/notes/:id without token', async () => {
    const response = await request(app).delete(
      '/api/notes/650000000000000000000001',
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Not authorized, no token provided',
    });
  });

  it('should return 401 Unauthorized when requesting GET /api/notes/export without token', async () => {
    const response = await request(app).get('/api/notes/export');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Not authorized, no token provided',
    });
  });

  it('should return 401 Unauthorized when requesting POST /api/notes/import without token', async () => {
    const response = await request(app).post('/api/notes/import').send({ notes: [] });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Not authorized, no token provided',
    });
  });
});
