import type { Metadata } from 'next';
import SignalHeader from '../SignalHeader';
import SubscriptionClient from '../subscriptions/SubscriptionClient';
import news from '../news.module.css';
import styles from '../subscriptions/subscription.module.css';

export const metadata: Metadata = { title: 'Your Signal Preferences', referrer: 'no-referrer', robots: { index: false, follow: false }, alternates: { canonical: '/news/preferences' } };

export default function SignalPreferencesPage() {
  return <main id="main-content" className={news.news}><div className={news.container}><SignalHeader current="subscribe" /><header className={styles.intro}><p className={styles.eyebrow}>SIGNAL / YOUR PREFERENCES</p><h1>Keep the signal.<br />Choose the frequency.</h1><p>Your topics and delivery choices are always yours to change.</p></header><SubscriptionClient mode="preferences" /></div></main>;
}
