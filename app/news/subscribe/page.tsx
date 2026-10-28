import type { Metadata } from 'next';
import SignalHeader from '../SignalHeader';
import SubscriptionClient from '../subscriptions/SubscriptionClient';
import news from '../news.module.css';
import styles from '../subscriptions/subscription.module.css';

export const metadata: Metadata = { title: 'Subscribe to Signal — Your Topics, Your Digest', description: 'Choose Signal topics, original OfRoot articles, and a daily or weekly digest. Confirm your email and manage your preferences without a password.', alternates: { canonical: '/news/subscribe' } };

export default function SignalSubscribePage() {
  return <main id="main-content" className={news.news}><div className={news.container}><SignalHeader current="subscribe" /><header className={styles.intro}><p className={styles.eyebrow}>OFROOT SIGNAL / SUBSCRIBE</p><h1>What matters to you.<br />Delivered by Signal.</h1><p>Choose your interests, your reading, and your rhythm. Get one considered roundup with a direct link to every article and its sources.</p></header><SubscriptionClient mode="subscribe" /></div></main>;
}
