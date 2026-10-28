import type { NewsCategory } from '../news/types';

/** Signal consent and delivery preferences are independent of paid accounts. */
export type SignalContent = 'briefs' | 'insights' | 'both';
export type SignalFrequency = 'weekly' | 'daily';
export type SignalPreferences = { topics: NewsCategory[]; content: SignalContent; frequency: SignalFrequency };
export type SignalSubscriber = SignalPreferences & {
  id: string; email: string; status: 'pending' | 'active' | 'paused' | 'unsubscribed' | 'suppressed';
  confirmedAt: string | null; nextSendAt: string | null; lastSentAt: string | null; tokenVersion: number;
};
export type SubscriberView = SignalPreferences & { email: string; status: SignalSubscriber['status']; nextSendAt: string | null };
export type DigestItem = {
  key: string; title: string; url: string; excerpt: string; topic: NewsCategory;
  kind: 'brief' | 'insight'; publishedAt: string; source: string; sourceUrl: string;
};

export class SubscriptionError extends Error {
  constructor(message: string, public status = 400) { super(message); this.name = 'SubscriptionError'; }
}
