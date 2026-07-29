const request = require('supertest');
const app = require('../server');
const pool = require('../src/db');

describe('Auth - Register', () => {
  
  test('should register a new user successfully', async () => {
    const uniqueEmail = `test_${Date.now()}@allForOne.com`;
    
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jest Test User',
        email: uniqueEmail,
        password: '123456',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe(uniqueEmail);
    expect(res.body.data.is_verified).toBe(false);
  });

  test('should reject registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Incomplete User',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('should reject registration with non-company email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Wrong Domain User',
        email: 'test@gmail.com',
        password: '123456',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

});

afterAll(async () => {
  await pool.end();
});