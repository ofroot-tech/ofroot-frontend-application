/** Confirmation and preference links carry mailbox-authorized capabilities.
 * These new routes stay outside analytics and error-payload collection. */
export function isPrivateSignalRoute(value: string | undefined | null): boolean {
  if (!value) return false;
  try {
    const path = new URL(value, 'https://www.ofroot.technology').pathname;
    return /^\/news\/(subscribe|confirm|preferences|unsubscribe)(?:\/|$)/.test(path) || /^\/api\/news\/subscriptions(?:\/|$)/.test(path)
      || /^\/dashboard\/owner\/signal(?:\/|$)/.test(path) || /^\/api\/admin\/signal(?:\/|$)/.test(path);
  } catch { return false; }
}

export function isPrivateSignalBrowser(): boolean {
  return typeof window !== 'undefined' && isPrivateSignalRoute(window.location.pathname);
}
