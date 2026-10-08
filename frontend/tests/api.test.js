import { afterEach, expect, it, vi } from 'vitest';
import { apiRequest } from '../src/lib/api';
afterEach(() => vi.unstubAllGlobals());
it('preserves JSON header and adds session CSRF token', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'token' }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ user: {} }) });
  vi.stubGlobal('fetch', fetchMock);
  await apiRequest('/api/profile/email', 'protected', {
    method: 'POST',
    headers: { 'X-Test': 'yes' },
    body: JSON.stringify({ email: 'new@example.com' }),
  });
  expect(fetchMock.mock.calls[1][1].headers).toEqual({
    'Content-Type': 'application/json',
    'X-Test': 'yes',
    'X-CSRF-Token': 'token',
  });
});
