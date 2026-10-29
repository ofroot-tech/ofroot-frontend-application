import { buildDigestPreview } from '@/app/news/subscriptions/digest-preview';

describe('Signal illustrative digest preview', () => {
  it('matches topics and content choices without inventing current stories', () => {
    const preview = buildDigestPreview(['policy', 'cybersecurity'], 'briefs');
    expect(preview.map(item => item.topic)).toEqual(['policy', 'cybersecurity']);
    expect(preview.every(item => item.kind === 'brief')).toBe(true);
    expect(preview[0].title).toContain('rule');
    expect(preview[1].detail).toContain('vulnerability');
    expect(buildDigestPreview(['integrations'], 'insights')).toEqual([expect.objectContaining({ topic: 'integrations', kind: 'insight' })]);
    expect(buildDigestPreview(['ai', 'ai', 'integrations'], 'both').map(item => item.kind)).toEqual(['brief', 'brief', 'insight']);
  });
  it('keeps no-topic state empty and never includes reading links or private mailbox fields', () => {
    expect(buildDigestPreview([], 'both')).toEqual([]);
    expect(Object.keys(buildDigestPreview(['ai'], 'briefs')[0]).sort()).toEqual(['detail', 'kind', 'title', 'topic']);
  });
});
