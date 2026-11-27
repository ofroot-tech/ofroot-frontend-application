export const SIGNAL_NOVEMBER_26 = {
  href: '/news/issue/2026-11-26',
  title: 'Who pays for Copilot reviews?',
  description: 'GitHub’s Copilot billing change, Cloudflare’s search beta, and a safer way to turn emails into tasks.',
  publishedAt: '2026-11-26',
  intro: 'This week, GitHub is changing which account pays for some Copilot reviews, Cloudflare has a new way for AI tools to search a public site, and Vercel says its workflow engine spends less time between steps. We also tested a simple way to turn incoming email into tasks while keeping a person in charge of what gets created.',
  notes: [
    {
      id: 'github-copilot-billing',
      title: 'GitHub will change the default for Copilot review billing on December 30',
      summary: 'For eligible Copilot Business and Enterprise accounts with no billing choice saved, GitHub says it will start charging the organization that owns the repository for reviews requested by members with paid Copilot licenses. Existing billing choices stay in effect. If you want those reviews to keep using members’ allowances, select Member in Copilot policy before the switch.',
      source: {
        label: 'GitHub’s November 25 announcement',
        href: 'https://github.blog/changelog/2026-11-25-copilot-code-review-billing-will-default-to-the-organization/',
      },
    },
    {
      id: 'cloudflare-search-for-agents',
      title: 'Cloudflare adds a way for AI tools to search your public website',
      summary: 'Cloudflare’s new Search for Agents beta gives AI tools a search address on your domain that returns relevant text from your pages. It is available on all Cloudflare plans, subject to AI Search pricing and limits. Before turning it on, check which pages you want to make searchable.',
      source: {
        label: 'Cloudflare’s November 25 product documentation',
        href: 'https://developers.cloudflare.com/ai-search/how-to/search-for-agents/',
      },
    },
    {
      id: 'vercel-workflow-sdk',
      title: 'Vercel reports less waiting between workflow steps',
      summary: 'In Vercel’s benchmark, three quarters of the waits between steps were 7 milliseconds or less in Workflow SDK 5.8, down from 85 milliseconds in version 5.2. The new engine applies to new runs on supported setups after upgrading. Check that steps which write records or send messages can run again without creating duplicates.',
      source: {
        label: 'Vercel’s November 25 changelog',
        href: 'https://vercel.com/changelog/workflows-speculative-execution',
      },
    },
  ],
};

export const INBOUND_EMAIL_GUIDE = {
  slug: 'turn-inbound-emails-into-crm-tasks',
  href: '/blog/turn-inbound-emails-into-crm-tasks',
  title: 'How to turn inbound emails into CRM tasks with an approval step',
  description: 'Turn shared inbox messages into draft tasks, keep a person in charge of approvals, and check what happens if a request runs twice.',
  summary: 'An incoming message creates a draft, and a person decides whether it should become a task. In our local test with synthetic messages, replaying a message or its approval still produced just one task for that message.',
  publishedAt: SIGNAL_NOVEMBER_26.publishedAt,
  steps: [
    {
      title: 'Create a draft for each message.',
      detail: 'Keep the subject, sender, a link back to the message if your mail provider supports it, and the provider’s stable message ID. Pair the ID with the mailbox so a repeat delivery finds the same draft.',
      takeaway: 'Use the mailbox and the provider’s stable message ID to match repeat deliveries to the same draft.',
    },
    {
      title: 'Give the reviewer a clear decision.',
      detail: 'Show the proposed task title and let the reviewer choose an owner, approve, or reject. A blank title or missing owner keeps the draft pending. An approved draft can create one task. A rejected draft closes without creating one.',
      takeaway: 'Require a title, an owner, and approval before creating a task.',
    },
    {
      title: 'Handle repeats and uncertain results.',
      detail: 'Carry the same message key into the task record. If the CRM times out during a create request, check for a task with that key before trying again. Confirm how your CRM handles repeated requests before using automatic retries.',
      takeaway: 'Check for an existing task with the same message key after a timeout.',
    },
    {
      title: 'Try the awkward cases first.',
      detail: 'In a test environment, replay a message, approve twice, reject an irrelevant message, and simulate a failed write. Confirm that the reviewer can still see what needs their attention.',
      takeaway: 'Test duplicate deliveries, repeat approvals, rejected messages, and failed writes.',
    },
  ],
  checks: [
    { action: 'Receive a quote request', result: 'One draft appeared and zero tasks were created.' },
    { action: 'Receive the same request again', result: 'The existing draft was reused.' },
    { action: 'Approve twice', result: 'One task was created for the message.' },
    { action: 'Reject a promotion', result: 'No task was created.' },
    { action: 'Approve a message with a blank subject', result: 'The request stayed pending.' },
    { action: 'Interrupt a local write and retry', result: 'The incomplete write was rolled back. The retry created one task.' },
  ],
};
