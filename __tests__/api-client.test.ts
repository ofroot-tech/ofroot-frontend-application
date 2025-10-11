// Ensure API base URL is set before importing the client
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
process.env.NEXT_PUBLIC_API_BASE_URL = BASE;

describe('Auth API client', () => {
  it('rejects on invalid credentials or unreachable backend', async () => {
    const { api } = await import('../app/lib/api');
    await expect(api.login('nope@example.com', 'wrong')).rejects.toBeTruthy();
  });
});
