import { test, expect } from './fixtures';

test.describe('POST /api/name', () => {
  test('rejects a request with no token', async ({ request }) => {
    const res = await request.post('/api/name', {
      data: { name: 'Aarav' },
    });
    expect(res.status()).toBe(403);
  });

  test('rejects a request with an empty body', async ({ request }) => {
    const res = await request.post('/api/name', { data: {} });
    expect(res.status()).toBe(403);
  });

  test('rejects an unverifiable token', async ({ request }) => {
    const res = await request.post('/api/name', {
      data: { name: 'Aarav', 'cf-turnstile-response': 'fake-token-that-will-not-verify' },
    });
    expect(res.status()).toBe(403);
  });
});