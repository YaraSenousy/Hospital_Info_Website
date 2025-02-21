const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken'); // Path to your middleware

const app = express();
app.use(cookieParser());
app.use(express.json());

// Test route
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

describe('verifyToken Middleware', () => {
  it('should grant access with a valid token', async () => {
    const token = jwt.sign({ userId: 123, role: 'user' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/protected')
      .set('Cookie', `token=${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
        message: 'Access granted',
        user: {
          userId: 123,
          role: 'user',
          iat: expect.anything(), // Match any value for `iat`
        },
      });
  });

  it('should deny access without a token', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Access denied. No token provided.' });
  });

  it('should deny access with an invalid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Cookie', 'token=invalid-token');

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid token' });
  });

  it('should deny access with an expired token', async () => {
    const token = jwt.sign({ userId: 123, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '-1s' }); // Expired token
    const res = await request(app)
      .get('/protected')
      .set('Cookie', `token=${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Token expired' });
  });
});