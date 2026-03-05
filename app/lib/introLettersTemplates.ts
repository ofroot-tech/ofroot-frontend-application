export type IntroService = 'workflow_automation' | 'landing_pages';

export type IntroTemplate = {
  subjectTemplate: string;
  bodyTemplate: string;
};

export const INTRO_SERVICE_LABELS: Record<IntroService, string> = {
  workflow_automation: 'workflow automation',
  landing_pages: 'marketing landing pages',
};

const TEMPLATES: Record<IntroService, IntroTemplate> = {
  workflow_automation: {
    subjectTemplate: '{{companyName}} + OfRoot | Intro for {{serviceName}}',
    bodyTemplate: `Hi {{leaderName}},

I’m reaching out because teams like {{companyName}} often lose momentum to repetitive operations work.

At OfRoot, we help leadership teams implement {{serviceName}} that reduce manual handoffs, speed up follow-up, and keep execution reliable.

If useful, I can share a short plan tailored to your current process.

Best,
{{senderName}}`,
  },
  landing_pages: {
    subjectTemplate: '{{leaderName}} at {{companyName}} + OfRoot | Intro for {{serviceName}}',
    bodyTemplate: `Hi {{leaderName}},

I work with companies like {{companyName}} to build high-converting {{serviceName}} aligned to real acquisition goals.

At OfRoot, we design and ship landing page systems focused on message clarity, conversion flow, and clean handoff into your lead pipeline.

If useful, I can send a quick concept based on your current offer.

Best,
{{senderName}}`,
  },
};

export function getDefaultIntroTemplate(service: IntroService): IntroTemplate {
  const source = TEMPLATES[service];
  return {
    subjectTemplate: source.subjectTemplate,
    bodyTemplate: source.bodyTemplate,
  };
}

type IntroTemplateTokens = {
  leaderName: string;
  companyName: string;
  serviceName: string;
  senderName: string;
};

export function renderIntroTemplate(template: string, tokens: IntroTemplateTokens) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key: string) => {
    if (!(key in tokens)) return match;
    const value = tokens[key as keyof IntroTemplateTokens];
    return value ?? '';
  });
}
