const request = require('supertest');
const express = require('express');
const redis = require('redis-mock');
const { promisify } = require('util');

// Mock Redis client
jest.mock('redis', () => require('redis-mock'));

const app = require('../src/index');  // Adjust this path as needed

describe('Cart Service', () => {
  let client;

  beforeAll(() => {
    client = redis.createClient();
  });

  afterEach(async () => {
    await promisify(client.flushall).bind(client)();
  });

  afterAll(() => {
    client.quit();
  });

  test('GET /cart/:userId returns empty cart for new user', async () => {
    const response = await request(app).get('/cart/user123');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({});
  });

  test('POST /cart/:userId/items adds item to cart', async () => {
    const response = await request(app)
      .post('/cart/user123/items')
      .send({ productId: 'prod1', quantity: 2 });
    expect(response.statusCode).toBe(201);

    const cartResponse = await request(app).get('/cart/user123');
    expect(cartResponse.body).toEqual({ prod1: '2' });
  });

  test('PUT /cart/:userId/items/:productId updates item in cart', async () => {
    await request(app)
      .post('/cart/user123/items')
      .send({ productId: 'prod1', quantity: 2 });

    const updateResponse = await request(app)
      .put('/cart/user123/items/prod1')
      .send({ quantity: 3 });
    expect(updateResponse.statusCode).toBe(200);

    const cartResponse = await request(app).get('/cart/user123');
    expect(cartResponse.body).toEqual({ prod1: '3' });
  });

  test('DELETE /cart/:userId/items/:productId removes item from cart', async () => {
    await request(app)
      .post('/cart/user123/items')
      .send({ productId: 'prod1', quantity: 2 });

    const deleteResponse = await request(app)
      .delete('/cart/user123/items/prod1');
    expect(deleteResponse.statusCode).toBe(200);

    const cartResponse = await request(app).get('/cart/user123');
    expect(cartResponse.body).toEqual({});
  });

  test('DELETE /cart/:userId clears entire cart', async () => {
    await request(app)
      .post('/cart/user123/items')
      .send({ productId: 'prod1', quantity: 2 });
    await request(app)
      .post('/cart/user123/items')
      .send({ productId: 'prod2', quantity: 1 });

    const clearResponse = await request(app)
      .delete('/cart/user123');
    expect(clearResponse.statusCode).toBe(200);

    const cartResponse = await request(app).get('/cart/user123');
    expect(cartResponse.body).toEqual({});
  });
});