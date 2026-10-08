const request = require('supertest');
const { createApp } = require('../src/app');
describe('security boundaries', () => {
  it('defaults to protected and rejects invalid modes', async () => {
    const app = createApp();
    expect((await request(app).get('/api/search?q=ok')).body.mode).toBe(
      'protected'
    );
    expect((await request(app).get('/api/search?mode=typo')).status).toBe(400);
  });
  it('protects anonymous comment writes', async () => {
    const app = createApp();
    expect(
      (
        await request(app)
          .post('/api/comments?mode=protected')
          .send({ text: 'hello' })
      ).status
    ).toBe(403);
    const agent = request.agent(app);
    const token = (await agent.get('/api/csrf-token?mode=protected')).body
      .csrfToken;
    expect(
      (
        await agent
          .post('/api/comments?mode=protected')
          .set('X-CSRF-Token', token)
          .send({ text: '<b>hello</b>' })
      ).status
    ).toBe(201);
    expect(
      (await agent.get('/api/comments?mode=vulnerable')).body.comments
    ).toEqual([]);
  });
  it('rejects attacker origin on protected login', async () => {
    const response = await request(createApp())
      .post('/api/login?mode=protected')
      .set('Origin', 'http://localhost:4000')
      .send({ username: 'student', password: '1234' });
    expect(response.status).toBe(403);
  });
  it('does not let vulnerable session modify protected profile', async () => {
    const agent = request.agent(createApp());
    await agent
      .post('/api/login?mode=vulnerable')
      .send({ username: 'student', password: '1234' });
    expect(
      (
        await agent
          .post('/api/profile/email?mode=protected')
          .send({ email: 'a@example.com' })
      ).status
    ).toBe(401);
  });
  it('returns controlled JSON errors for malformed and oversized requests', async () => {
    const app = createApp();
    expect(
      (
        await request(app)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .send('{')
      ).status
    ).toBe(400);
    expect(
      (
        await request(app)
          .post('/api/login')
          .send({ text: 'a'.repeat(17000) })
      ).status
    ).toBe(413);
    expect((await request(app).get('/unknown')).status).toBe(404);
  });
  it('rotates session on login and guards logout', async () => {
    const agent = request.agent(createApp());
    const before = await agent.get('/api/csrf-token?mode=protected');
    const login = await agent
      .post('/api/login?mode=protected')
      .send({ username: 'student', password: '1234' });
    expect(login.headers['set-cookie'][0].split(';')[0]).not.toBe(
      before.headers['set-cookie'][0].split(';')[0]
    );
    expect((await agent.post('/api/logout?mode=protected')).status).toBe(403);
    const token = (await agent.get('/api/csrf-token?mode=protected')).body
      .csrfToken;
    expect(
      (
        await agent
          .post('/api/logout?mode=protected')
          .set('X-CSRF-Token', token)
      ).status
    ).toBe(200);
    expect((await agent.get('/api/me?mode=protected')).status).toBe(401);
  });
});
