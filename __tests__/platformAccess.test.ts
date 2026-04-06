import { derivePlatformAccess, hasEditionAccess } from '../app/lib/platform-access';

describe('platform access', () => {
  it('grants both editions to privileged roles', () => {
    const access = derivePlatformAccess({ plan: 'free', top_role: 'admin' });
    expect(access.enabledEditions).toEqual(['helpr', 'ontask']);
  });

  it('grants the selected edition when product slug is present', () => {
    const access = derivePlatformAccess({ plan: 'free', top_role: 'client', product_slug: 'helpr' });
    expect(access.enabledEditions).toEqual(['helpr']);
    expect(access.enabledFeatures).toContain('edition_helpr');
  });

  it('respects explicit tenant feature entitlements', () => {
    const access = derivePlatformAccess({
      plan: 'free',
      top_role: 'client',
      tenantFeatures: ['edition_ontask', 'billing'],
    });

    expect(access.enabledEditions).toEqual(['ontask']);
    expect(access.enabledFeatures).toEqual(expect.arrayContaining(['edition_ontask', 'billing']));
  });

  it('falls back to both editions for legacy paid plans without explicit edition data', () => {
    const access = derivePlatformAccess({ plan: 'pro', top_role: 'client' });
    expect(access.enabledEditions).toEqual(['helpr', 'ontask']);
  });

  it('checks user edition access from enabled editions first', () => {
    expect(
      hasEditionAccess(
        {
          plan: 'free',
          top_role: 'client',
          product_slug: null,
          enabled_editions: ['helpr'],
          enabled_features: [],
        },
        'helpr'
      )
    ).toBe(true);

    expect(
      hasEditionAccess(
        {
          plan: 'free',
          top_role: 'client',
          product_slug: null,
          enabled_editions: ['helpr'],
          enabled_features: [],
        },
        'ontask'
      )
    ).toBe(false);
  });
});
