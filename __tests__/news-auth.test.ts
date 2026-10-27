import { authorizedRefresh } from '@/app/lib/news/auth';

test('refresh authorization requires configured exact bearer credentials', () => {
  expect(authorizedRefresh(null, 'secret')).toBe(false);
  expect(authorizedRefresh('Bearer secret', '')).toBe(false);
  expect(authorizedRefresh('Bearer wrong!', 'secret')).toBe(false);
  expect(authorizedRefresh('Bearer secret-more', 'secret')).toBe(false);
  expect(authorizedRefresh('Bearer secret', 'secret')).toBe(true);
});
