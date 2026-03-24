import { hasCompetitiveAnalysisAccess, isPaidPlan } from '../app/lib/plans';

describe('plans access', () => {
  it('recognizes paid plans', () => {
    expect(isPaidPlan('pro')).toBe(true);
    expect(isPaidPlan('business')).toBe(true);
    expect(isPaidPlan('free')).toBe(false);
    expect(isPaidPlan(null)).toBe(false);
  });

  it('allows competitive analysis for paid users and admins', () => {
    expect(hasCompetitiveAnalysisAccess({ plan: 'pro', top_role: 'client' })).toBe(true);
    expect(hasCompetitiveAnalysisAccess({ plan: null, top_role: 'admin' })).toBe(true);
    expect(hasCompetitiveAnalysisAccess({ plan: null, top_role: 'owner' })).toBe(true);
    expect(hasCompetitiveAnalysisAccess({ plan: 'free', top_role: 'client' })).toBe(false);
  });
});
