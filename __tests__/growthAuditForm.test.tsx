/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import GrowthAuditForm from '@/components/growth/GrowthAuditForm';
import { track } from '@/app/lib/ab';

jest.mock('@/app/lib/ab', () => ({ track: jest.fn() }));

describe('project inquiry form (all requests mocked)', () => {
  let container: HTMLDivElement;
  let root: Root;
  const fetchMock = jest.fn();

  beforeEach(async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    window.history.replaceState({}, '', '/book?source=qa-test&utm_source=local-test');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    global.fetch = fetchMock;
    fetchMock.mockReset();
    jest.mocked(track).mockClear();
    await act(async () => root.render(<GrowthAuditForm />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  function fill() {
    const values: Record<string, string> = {
      businessName: 'Synthetic QA Business', email: 'qa@example.com',
      growthBottleneck: 'Reporting', desiredOutcome: 'Review synthetic reporting requirements.',
    };
    for (const [name, value] of Object.entries(values)) {
      const field = container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
      field.value = value;
    }
  }

  async function submit() {
    await act(async () => {
      container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  }

  it('keeps four required fields and records one start event per mounted form', () => {
    expect(container.querySelectorAll('[required]')).toHaveLength(4);
    const input = container.querySelector('input')!;
    act(() => input.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    act(() => input.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    expect(jest.mocked(track).mock.calls.filter(([event]) => event.action === 'booking_form_started')).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retains entered values after an error and allows a successful retry', async () => {
    fill();
    fetchMock.mockResolvedValueOnce({ ok: false });
    await submit();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('could not be saved');
    expect(container.querySelector<HTMLInputElement>('[name="businessName"]')!.value).toBe('Synthetic QA Business');
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    fetchMock.mockResolvedValueOnce({ ok: true });
    await submit();
    expect(container.querySelector('[role="status"]')?.textContent).toContain('request is in');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/sales-inquiry');
    const body = JSON.parse(options.body);
    expect(body.email).toBe('qa@example.com');
    expect(body.payload.ctaSource).toBe('qa-test');
    expect(body.payload.landingPage).toBe('/book');
    expect(body.payload.utm).toEqual({ source: 'local-test', medium: null, campaign: null, content: null, term: null });
    expect(jest.mocked(track).mock.calls.filter(([event]) => event.action === 'booking_form_submitted')).toHaveLength(1);
  });

  it('preserves the production home-services focus, event labels and full attribution', async () => {
    act(() => root.unmount());
    window.history.replaceState({}, '', '/book?focus=home-services-automation&utm_source=qa&utm_medium=test&utm_campaign=synthetic&utm_content=link&utm_term=workflow');
    root = createRoot(container);
    await act(async () => root.render(<GrowthAuditForm />));
    expect(container.textContent).toContain('Map the path from lead to payment.');
    expect(container.querySelector<HTMLSelectElement>('[name="growthBottleneck"]')!.value).toBe('Automation');
    expect(container.querySelectorAll('[required]')).toHaveLength(4);
    act(() => container.querySelector('input')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    fill();
    fetchMock.mockResolvedValueOnce({ ok: true });
    await submit();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.payload.ctaSource).toBe('home-services-automation');
    expect(body.payload.landingPage).toBe('/book');
    expect(body.payload.utm).toEqual({ source: 'qa', medium: 'test', campaign: 'synthetic', content: 'link', term: 'workflow' });
    expect(container.querySelector('[role="status"]')?.textContent).toContain('workflow-audit request is in');
    const events = jest.mocked(track).mock.calls.map(([event]) => event);
    expect(events.map(event => event.label)).toEqual(['home_services_workflow_audit', 'home_services_workflow_audit']);
    expect(events.every(event => event.meta?.focus === 'home-services-automation')).toBe(true);
  });

  it('disables the submit button while a request is pending', async () => {
    fill();
    let complete!: (value: { ok: boolean }) => void;
    fetchMock.mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
    act(() => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    await act(async () => complete({ ok: true }));
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});
