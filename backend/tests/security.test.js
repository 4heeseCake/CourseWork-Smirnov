const request = require('supertest');
const { createApp } = require('../src/app');

const XSS_PAYLOAD = '<img src=x onerror="alert(1)">';

describe('XSS demo endpoints', () => {
  it('returns raw input in vulnerable reflected XSS mode', async () => {
    const app = createApp();
    const response = await request(app)
      .get('/api/search')
      .query({ mode: 'vulnerable', q: XSS_PAYLOAD });

    expect(response.status).toBe(200);
    expect(response.body.value).toBe(XSS_PAYLOAD);
  });

  it('sanitizes reflected XSS in protected mode', async () => {
    const app = createApp();
    const response = await request(app)
      .get('/api/search')
      .query({ mode: 'protected', q: XSS_PAYLOAD });

    expect(response.status).toBe(200);
    expect(response.body.value).not.toContain('onerror');
  });

  it('stores raw comments in vulnerable mode', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/comments?mode=vulnerable')
      .send({ text: XSS_PAYLOAD });

    expect(response.status).toBe(201);
    expect(response.body.comment.text).toBe(XSS_PAYLOAD);
  });

  it('sanitizes stored comments in protected mode', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/comments?mode=protected')
      .send({ text: XSS_PAYLOAD });

    expect(response.status).toBe(201);
    expect(response.body.comment.text).not.toContain('onerror');
  });

  it('neutralizes mixed-case and nested XSS attempts', async () => {
    const app = createApp();
    const payload =
      '<p><ScRiPt>alert(1)</ScRiPt><img SRC=x OnErRoR="alert(2)"><strong>safe</strong></p>';
    const response = await request(app)
      .get('/api/search')
      .query({ mode: 'protected', q: payload });

    expect(response.body.value.toLowerCase()).not.toContain('<script');
    expect(response.body.value.toLowerCase()).not.toContain('onerror');
    expect(response.body.value).toContain('<strong>safe</strong>');
  });

  it('adds CSP and additional security headers in protected mode', async () => {
    const app = createApp();
    const response = await request(app).get(
      '/api/search?mode=protected&q=test'
    );

    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
