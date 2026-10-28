import { escapeEmailHtml, signalSender } from './config';
import { SubscriptionError } from './types';

export type SignalEmail = { to: string; subject: string; html: string; text: string; idempotencyKey: string; unsubscribeUrl?: string };

/** All subscription mail uses checked provider receipts. A confirmation is
 * transactional; digest messages also carry RFC 8058 unsubscribe headers. */
export async function sendSignalEmail(message: SignalEmail, fetcher: typeof fetch = fetch): Promise<{ id: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new SubscriptionError('Signal subscriptions are temporarily unavailable. Please try again later.', 503);
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': message.idempotencyKey, 'User-Agent': 'OfRootSignal/1.0' },
    body: JSON.stringify({ from: signalSender(), to: [message.to], subject: message.subject, html: message.html, text: message.text,
      ...(message.unsubscribeUrl ? { headers: { 'List-Unsubscribe': `<${message.unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click', 'List-Id': 'Signal digest <signal.ofroot.technology>' } } : {}),
      tags: [{ name: 'product', value: 'signal' }],
    }),
  });
  if (!response.ok) throw new SubscriptionError('We could not send that email. Please try again later.', 502);
  const receipt = await response.json();
  if (typeof receipt.id !== 'string' || !receipt.id) throw new SubscriptionError('Email delivery was not confirmed. Please try again later.', 502);
  return { id: receipt.id };
}

export function signalEmailFrame(heading: string, bodyHtml: string, footer = ''): string {
  return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#17141f;color:#faf9fc;font-family:Arial,Helvetica,sans-serif"><div style="max-width:640px;margin:auto;padding:40px 24px"><p style="color:#ffb78f;font-size:22px;letter-spacing:-.5px">▥ Signal <span style="color:#c0b5cc;font-size:10px;letter-spacing:1px"> / OFROOT</span></p><h1 style="font-size:30px;line-height:1.15;letter-spacing:-1px;margin:32px 0 24px">${escapeEmailHtml(heading)}</h1>${bodyHtml}<div style="margin-top:36px;padding-top:24px;border-top:1px solid #51415f;color:#c0b5cc;font-size:12px;line-height:1.8">${footer || 'OfRoot Signal · Technology with a clear path to the source.'}</div></div></body></html>`;
}
