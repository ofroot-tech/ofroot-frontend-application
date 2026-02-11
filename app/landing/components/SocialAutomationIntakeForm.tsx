'use client';

import { FormEvent, useState } from 'react';
import { toast } from '@/components/Toaster';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function formatMessage(data: FormData) {
  const lines = [
    'Social Media Lead Capture Automation Intake',
    '',
    'Business Information',
    `- Legal Business Name: ${data.get('legalBusinessName') || ''}`,
    `- Public Brand Name: ${data.get('publicBrandName') || ''}`,
    `- Primary Contact Name & Role: ${data.get('primaryContactNameRole') || ''}`,
    `- Primary Contact Email: ${data.get('primaryContactEmail') || ''}`,
    `- Primary Contact Phone: ${data.get('primaryContactPhone') || ''}`,
    '',
    'Social Media Accounts',
    `- Facebook Page URL: ${data.get('facebookPageUrl') || ''}`,
    `- Instagram Username: ${data.get('instagramUsername') || ''}`,
    `- Instagram Business/Creator: ${data.get('instagramBusinessOrCreator') || ''}`,
    `- Facebook + Instagram connected: ${data.get('facebookInstagramConnected') || ''}`,
    `- Uses DMs for sales/support: ${data.get('usesDmForSalesSupport') || ''}`,
    '',
    'Automation Scope',
    `- Platforms: ${data.get('platformsToAutomate') || ''}`,
    `- Trigger scope: ${data.get('triggerScope') || ''}`,
    `- Specific post links: ${data.get('specificPostLinks') || ''}`,
    `- Trigger keywords: ${data.get('triggerKeywords') || ''}`,
    '',
    'Public Comment Response Preferences',
    `- Preferred tone: ${data.get('preferredTone') || ''}`,
    `- Sample preferred wording: ${data.get('sampleWording') || ''}`,
    `- Prohibited words/phrases: ${data.get('prohibitedWords') || ''}`,
    '',
    'Direct Message Strategy',
    `- Primary DM goal: ${data.get('primaryDmGoal') || ''}`,
    `- Desired call-to-action: ${data.get('desiredCallToAction') || ''}`,
    `- Ask for location: ${data.get('askLocation') || ''}`,
    `- Ask for timeline: ${data.get('askTimeline') || ''}`,
    `- Ask for budget: ${data.get('askBudget') || ''}`,
    '',
    'Lead Routing & Notifications',
    `- Lead destination: ${data.get('leadDestination') || ''}`,
    `- CRM system: ${data.get('crmSystem') || ''}`,
    `- Notification recipients: ${data.get('notificationRecipients') || ''}`,
    `- Business hours restrictions: ${data.get('businessHoursRestrictions') || ''}`,
    '',
    'Volume & Permissions',
    `- Estimated comments per day: ${data.get('estimatedCommentsPerDay') || ''}`,
    `- Grant admin access: ${data.get('grantAdminAccess') || ''}`,
    `- Account model: ${data.get('accountModel') || ''}`,
    '',
    'Approval & Launch',
    `- Final message approver: ${data.get('finalMessageApprover') || ''}`,
    `- Target go-live date: ${data.get('targetGoLiveDate') || ''}`,
    `- Emergency pause contact: ${data.get('emergencyPauseContact') || ''}`,
    '',
    'Business Goals & Lead Qualification',
    `- Primary service to promote: ${data.get('primaryServiceToPromote') || ''}`,
    `- Average job value: ${data.get('averageJobValue') || ''}`,
    `- Ideal customer location: ${data.get('idealCustomerLocation') || ''}`,
    `- Qualified lead definition: ${data.get('qualifiedLeadDefinition') || ''}`,
    `- Unqualified lead definition: ${data.get('unqualifiedLeadDefinition') || ''}`,
    `- Lead owner: ${data.get('leadOwner') || ''}`,
    `- Capacity limits: ${data.get('capacityLimits') || ''}`,
    `- Primary goal: ${data.get('primaryGoal') || ''}`,
    '',
    'Authorization',
    `- Client Signature: ${data.get('clientSignature') || ''}`,
    `- Signature Date: ${data.get('signatureDate') || ''}`,
  ];
  return lines.join('\n');
}

export default function SocialAutomationIntakeForm() {
  const [status, setStatus] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus('submitting');
    setError(null);

    try {
      const name = String(formData.get('primaryContactNameRole') || '').trim();
      const email = String(formData.get('primaryContactEmail') || '').trim();
      const message = formatMessage(formData);

      const response = await fetch('/api/sales-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to submit intake');
      }

      setStatus('success');
      toast({ type: 'success', title: 'Intake submitted', message: 'We will review this and follow up with implementation steps.' });
      form.reset();
    } catch (submitError: any) {
      const message = submitError?.message || 'Failed to submit intake';
      setStatus('error');
      setError(message);
      toast({ type: 'error', title: 'Submission failed', message });
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Client intake and implementation questionnaire</h2>
        <p className="mt-2 text-sm text-gray-600">Complete this form so we can configure comment and DM automation with lead routing, compliance, and reporting.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="legalBusinessName" required placeholder="Legal business name" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="publicBrandName" required placeholder="Public brand name" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="primaryContactNameRole" required placeholder="Primary contact name and role" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="primaryContactEmail" type="email" required placeholder="Primary contact email" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="primaryContactPhone" placeholder="Primary contact phone (optional)" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input name="facebookPageUrl" required placeholder="Facebook page URL" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="instagramUsername" required placeholder="Instagram username" className="rounded-md border border-gray-300 px-3 py-2" />
          <select name="instagramBusinessOrCreator" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Instagram business or creator?</option>
            <option>Yes</option>
            <option>No</option>
            <option>Not Sure</option>
          </select>
          <select name="facebookInstagramConnected" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Facebook and Instagram connected?</option>
            <option>Yes</option>
            <option>No</option>
            <option>Not Sure</option>
          </select>
          <select name="usesDmForSalesSupport" required className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2">
            <option value="">Do you use DMs for sales or support?</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select name="platformsToAutomate" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Platforms to automate</option>
            <option>Instagram</option>
            <option>Facebook</option>
            <option>Both</option>
          </select>
          <select name="triggerScope" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Trigger scope</option>
            <option>All posts</option>
            <option>Specific posts</option>
            <option>Keyword-based</option>
          </select>
          <input name="specificPostLinks" placeholder="If specific posts, provide links" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" />
          <textarea name="triggerKeywords" placeholder="If keyword-based, list keywords" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" rows={2} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select name="preferredTone" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Preferred tone</option>
            <option>Friendly</option>
            <option>Professional</option>
            <option>Sales-focused</option>
            <option>Casual</option>
          </select>
          <input name="sampleWording" placeholder="Sample preferred wording (optional)" className="rounded-md border border-gray-300 px-3 py-2" />
          <textarea name="prohibitedWords" placeholder="Any prohibited words or phrases" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" rows={2} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select name="primaryDmGoal" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Primary DM goal</option>
            <option>Qualify</option>
            <option>Pricing</option>
            <option>Book Call</option>
            <option>Collect Info</option>
            <option>Other</option>
          </select>
          <input name="desiredCallToAction" required placeholder="Desired call-to-action" className="rounded-md border border-gray-300 px-3 py-2" />
          <select name="askLocation" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">May we ask for location?</option>
            <option>Yes</option>
            <option>No</option>
          </select>
          <select name="askTimeline" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">May we ask for timeline?</option>
            <option>Yes</option>
            <option>No</option>
          </select>
          <select name="askBudget" required className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2">
            <option value="">May we ask for budget?</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select name="leadDestination" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Where should leads be logged?</option>
            <option>Sheet</option>
            <option>CRM</option>
            <option>Email</option>
          </select>
          <input name="crmSystem" placeholder="If CRM, specify system" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="notificationRecipients" required placeholder="Notification recipients" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="businessHoursRestrictions" placeholder="Business hours restrictions (if any)" className="rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select name="estimatedCommentsPerDay" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Estimated comments per day</option>
            <option>0-20</option>
            <option>20-50</option>
            <option>50-100</option>
            <option>100+</option>
          </select>
          <select name="grantAdminAccess" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Will you grant admin access for setup?</option>
            <option>Yes</option>
            <option>No</option>
          </select>
          <select name="accountModel" required className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2">
            <option value="">Account model</option>
            <option>Client-owned</option>
            <option>Agency-managed</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input name="finalMessageApprover" required placeholder="Who approves final message copy?" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="targetGoLiveDate" type="date" required className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="emergencyPauseContact" required placeholder="Emergency pause contact" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input name="primaryServiceToPromote" required placeholder="Primary service you want to promote" className="rounded-md border border-gray-300 px-3 py-2" />
          <select name="averageJobValue" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Average job value</option>
            <option>Under $1k</option>
            <option>$1k-$5k</option>
            <option>$5k-$15k</option>
            <option>$15k+</option>
          </select>
          <input name="idealCustomerLocation" required placeholder="Ideal customer location or service radius" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" />
          <textarea name="qualifiedLeadDefinition" required placeholder="What makes a lead qualified?" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" rows={3} />
          <textarea name="unqualifiedLeadDefinition" required placeholder="What makes a lead unqualified?" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" rows={3} />
          <select name="leadOwner" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Who handles incoming leads?</option>
            <option>Owner</option>
            <option>Sales Rep</option>
            <option>Office Manager</option>
            <option>Other</option>
          </select>
          <select name="capacityLimits" required className="rounded-md border border-gray-300 px-3 py-2">
            <option value="">Do you have capacity limits?</option>
            <option>Unlimited</option>
            <option>Limited crews</option>
            <option>Seasonal restrictions</option>
          </select>
          <select name="primaryGoal" required className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2">
            <option value="">Primary goal with this automation</option>
            <option>More calls</option>
            <option>Higher-quality leads</option>
            <option>Booked appointments</option>
            <option>Revenue growth</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input name="clientSignature" required placeholder="Client signature" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="signatureDate" type="date" required className="rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-600">By submitting, you authorize OfRoot Technology to configure social automation systems within your Meta and connected platforms for the purposes described.</p>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center justify-center rounded-md bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Intake'}
          </button>
        </div>

        {status === 'success' && <p className="text-sm font-medium text-green-700">Intake submitted successfully. We will follow up with implementation steps.</p>}
        {status === 'error' && <p className="text-sm font-medium text-red-700">{error || 'Submission failed.'}</p>}
      </form>
    </section>
  );
}
