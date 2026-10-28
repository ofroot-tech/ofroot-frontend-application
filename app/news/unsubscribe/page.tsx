import type { Metadata } from 'next';
import SignalHeader from '../SignalHeader';
import SubscriptionClient from '../subscriptions/SubscriptionClient';
import news from '../news.module.css';
import styles from '../subscriptions/subscription.module.css';

export const metadata: Metadata = { title: 'Unsubscribe from Signal', referrer: 'no-referrer', robots: { index: false, follow: false }, alternates: { canonical: '/news/unsubscribe' } };

export default function SignalUnsubscribePage() {
  return <main id="main-content" className={news.news}><div className={news.container}><SignalHeader current="subscribe" /><header className={styles.intro}><p className={styles.eyebrow}>SIGNAL / DELIVERY CONTROL</p><h1>Your inbox.<br />Your decision.</h1><p>Stop Signal digests whenever you choose.</p></header><SubscriptionClient mode="unsubscribe" /></div></main>;
}
