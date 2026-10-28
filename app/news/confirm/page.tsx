import type { Metadata } from 'next';
import SignalHeader from '../SignalHeader';
import SubscriptionClient from '../subscriptions/SubscriptionClient';
import news from '../news.module.css';
import styles from '../subscriptions/subscription.module.css';

export const metadata: Metadata = { title: 'Confirm Your Signal Subscription', referrer: 'no-referrer', robots: { index: false, follow: false }, alternates: { canonical: '/news/confirm' } };

export default function SignalConfirmPage() {
  return <main id="main-content" className={news.news}><div className={news.container}><SignalHeader current="subscribe" /><header className={styles.intro}><p className={styles.eyebrow}>SIGNAL / EMAIL CONFIRMATION</p><h1>A clear choice.<br />Confirmed by you.</h1><p>Start your Signal subscription by confirming the email you requested.</p></header><SubscriptionClient mode="confirm" /></div></main>;
}
