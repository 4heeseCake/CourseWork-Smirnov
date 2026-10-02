const request = require('supertest');
const { createApp } = require('../src/app');

async function login(agent, mode) {
  return agent.post(`/api/login?mode=${mode}`).send({
    username: 'student',
    password: '1234',
  });
}

describe('CSRF demo', () => {
  it('allows state change without a token in vulnerable mode', async () => {
    const app = createApp();
    const agent = request.agent(app);
    await login(agent, 'vulnerable');

    const response = await agent
      .post('/api/profile/email?mode=vulnerable')
      .send({ email: 'attacker@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('attacker@example.com');
  });

  it('blocks a protected request without a CSRF token', async () => {
    const app = createApp();
    const agent = request.agent(app);
    await login(agent, 'protected');

    const response = await agent
      .post('/api/profile/email?mode=protected')
      .send({ email: 'new@example.com' });

    expect(response.status).toBe(403);
  });

  it('blocks a forged CSRF token', async () => {
    const app = createApp();
    const agent = request.agent(app);
    await login(agent, 'protected');

    const response = await agent
      .post('/api/profile/email?mode=protected')
      .set('X-CSRF-Token', 'forged-token')
      .send({ email: 'new@example.com' });

    expect(response.status).toBe(403);
  });

  it('blocks a token copied from another session', async () => {
    const app = createApp();
    const first = request.agent(app);
    const second = request.agent(app);

    await login(first, 'protected');
    await login(second, 'protected');

    const tokenResponse = await first.get('/api/csrf-token?mode=protected');
    const foreignToken = tokenResponse.body.csrfToken;

    const response = await second
      .post('/api/profile/email?mode=protected')
      .set('X-CSRF-Token', foreignToken)
      .send({ email: 'new@example.com' });

    expect(response.status).toBe(403);
  });

  it('accepts the valid token from the same session', async () => {
    const app = createApp();
    const agent = request.agent(app);
    await login(agent, 'protected');

    const tokenResponse = await agent.get('/api/csrf-token?mode=protected');
    const response = await agent
      .post('/api/profile/email?mode=protected')
      .set('X-CSRF-Token', tokenResponse.body.csrfToken)
      .send({ email: 'new@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('new@example.com');
  });

  it('returns 401 when cookies/session are absent', async () => {
    const app = createApp();
    const response = await request(app).get('/api/me?mode=protected');

    expect(response.status).toBe(401);
  });

  it('rejects an invalid email value', async () => {
    const app = createApp();
    const agent = request.agent(app);
    await login(agent, 'protected');
    const tokenResponse = await agent.get('/api/csrf-token?mode=protected');

    const response = await agent
      .post('/api/profile/email?mode=protected')
      .set('X-CSRF-Token', tokenResponse.body.csrfToken)
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
  });

  it('sets HttpOnly and SameSite for the protected session cookie', async () => {
    const app = createApp();
    const response = await request(app).post('/api/login?mode=protected').send({
      username: 'student',
      password: '1234',
    });

    const cookie = response.headers['set-cookie'][0];
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
  });
});
