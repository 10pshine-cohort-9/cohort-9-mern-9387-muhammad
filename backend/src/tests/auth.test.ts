import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Auth Validation & Endpoints', () => {
  describe('POST /api/auth/register validation', () => {
    it('should reject registration if name is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Name is required',
      });
    });

    it('should reject registration if email is invalid', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'invalid-email-format',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Please provide a valid email address',
      });
    });

    it('should reject registration if password is less than 6 characters', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    });
  });

  describe('POST /api/auth/login validation', () => {
    it('should reject login if email is invalid', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'bademail',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Please provide a valid email address',
      });
    });

    it('should reject login if password is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'user@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Password is required',
      });
    });
  });

  describe('PUT /api/auth/change-password authentication check', () => {
    it('should reject password change if no authorization token is provided', async () => {
      const response = await request(app).put('/api/auth/change-password').send({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(response.status).toBe(401);
    });
  });
});
