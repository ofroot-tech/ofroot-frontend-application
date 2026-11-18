/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import PartnerInquiryForm from '@/components/partners/PartnerInquiryForm';

jest.mock('@/components/growth/GrowthAuditForm.module.css', () => ({}));
jest.mock('@/components/partners/PartnerInquiryForm.module.css', () => ({}));
jest.mock('@/components/partners/PartnerAnalytics', () => ({ partnerEvent: jest.fn() }));

let container: HTMLDivElement;
let root: Root;
const fetchMock = jest.fn();
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  global.fetch = fetchMock;
  fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => ({ ok: true, requestId: 'synthetic-security-reference' }) });
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: () => '12345678-1234-4234-8234-123456789012' });
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

async function fillAndSubmit(description = 'Review a synthetic application and its access controls.') {
  const values: Record<string, string> = { name: 'Synthetic Tester', email: 'qa@example.invalid', company: 'Synthetic Company', partnerType: 'direct', description, timeframe: 'planning' };
  for (const [name, value] of Object.entries(values)) {
    (container.querySelector(`[name="${name}"]`) as HTMLInputElement).value = value;
  }
  (container.querySelector('[name="consent"]') as HTMLInputElement).checked = true;
  await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

it('saves security scope through the email-free partner endpoint and shows the returned reference', async () => {
  await act(async () => root.render(<PartnerInquiryForm enabled intent="security" />));
  expect((container.querySelector('[name="need"]') as HTMLSelectElement).value).toBe('project');
  await fillAndSubmit();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, request] = fetchMock.mock.calls[0];
  expect(url).toBe('/api/partner-inquiry');
  expect(JSON.parse(request.body)).toMatchObject({ need: 'project', partnerType: 'direct', consent: true, description: 'Application security inquiry: Review a synthetic application and its access controls.' });
  expect(container.textContent).toContain('Your inquiry is saved.');
  expect(container.textContent).toContain('synthetic-security-reference');
});

it('keeps the security context inside the existing maximum description length', async () => {
  await act(async () => root.render(<PartnerInquiryForm enabled intent="security" />));
  expect((container.querySelector('[name="description"]') as HTMLTextAreaElement).maxLength).toBe(2970);
  await fillAndSubmit('x'.repeat(2970));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).description).toHaveLength(3000);
});

it('preserves security answers after a failed save and permits a retry', async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Temporary save failure.' }) });
  await act(async () => root.render(<PartnerInquiryForm enabled intent="security" />));
  await fillAndSubmit();
  expect(container.querySelector('[role="alert"]')?.textContent).toBe('Temporary save failure.');
  expect((container.querySelector('[name="description"]') as HTMLTextAreaElement).value).toBe('Review a synthetic application and its access controls.');
  await fillAndSubmit();
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls.every(([url]) => url === '/api/partner-inquiry')).toBe(true);
  expect(container.textContent).toContain('Your inquiry is saved.');
});

it('does not route disabled security intake to the legacy email-sending form', async () => {
  await act(async () => root.render(<PartnerInquiryForm intent="security" />));
  expect(container.querySelector('form')).toBeNull();
  expect(container.querySelector('a[href^="/book"]')).toBeNull();
  expect(container.textContent).toContain('temporarily unavailable');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('keeps the existing partnership form wording and unselected engagement type', async () => {
  await act(async () => root.render(<PartnerInquiryForm enabled />));
  expect(container.textContent).toContain('Send partnership inquiry');
  expect(container.textContent).toContain('Tell us about the role or project.');
  expect((container.querySelector('[name="need"]') as HTMLSelectElement).value).toBe('');
});
