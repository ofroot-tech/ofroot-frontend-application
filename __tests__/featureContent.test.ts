import { featurePages, featurePath, getFeature, getFeaturesForService } from '@/app/lib/feature-content';

describe('feature content contract', () => {
  it('covers every approved feature intent once', () => {
    expect(getFeaturesForService('ai-discoverability')).toHaveLength(12);
    expect(getFeaturesForService('automation-systems')).toHaveLength(10);
    expect(getFeaturesForService('private-company-ai')).toHaveLength(3);
    expect(featurePages).toHaveLength(25);

    const paths = featurePages.map(featurePath);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('keeps every page substantial and answer-ready', () => {
    for (const feature of featurePages) {
      expect(feature.title.length).toBeGreaterThan(20);
      expect(feature.description.length).toBeGreaterThan(80);
      expect(feature.directAnswer.length).toBeGreaterThan(150);
      expect(feature.buyerQuestion.endsWith('?')).toBe(true);
      expect(feature.outcomes).toHaveLength(3);
      expect(feature.included).toHaveLength(4);
      expect(feature.process).toHaveLength(4);
      expect(feature.measures).toHaveLength(3);
      expect(feature.example.steps.length).toBeGreaterThanOrEqual(5);
      expect(feature.faqs.length).toBeGreaterThanOrEqual(3);
      expect(getFeature(feature.service, feature.slug)).toBe(feature);
    }
  });

  it('uses unique titles, descriptions, questions, and direct answers', () => {
    for (const field of ['title', 'description', 'buyerQuestion', 'directAnswer'] as const) {
      const values = featurePages.map(feature => feature[field]);
      expect(new Set(values).size).toBe(values.length);
    }
  });
});
