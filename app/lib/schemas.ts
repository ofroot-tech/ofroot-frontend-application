/**
 * Structured Data Schemas
 *
 * Purpose:
 *  - Centralized schema.org JSON-LD generators for SEO.
 *  - Includes pricing schema, organization schema, FAQ schema.
 *  - Used by pages to enhance discoverability and rich snippets.
 *
 * Standards:
 *  - JSON-LD format (schema.org)
 *  - Compatible with Google, Bing, schema validators
 */

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OfRoot',
    url: 'https://ofroot.technology',
    logo: 'https://ofroot.technology/ofroot-logo.png',
    description: 'On-demand engineering, automation, and AI by subscription.',
    sameAs: [
      'https://twitter.com/ofroot_tech',
      'https://www.linkedin.com/company/106671711',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      url: 'https://ofroot.technology/consulting/book',
    },
  };
}

export function generatePricingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'OfRoot Tech & Consulting',
    description: 'SaaS platform and consulting services for engineering teams',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        description: 'Self-serve engineering platform',
        price: '29',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://ofroot.technology/subscribe',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        description: 'Advanced features and priority support',
        price: '99',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://ofroot.technology/subscribe',
      },
      {
        '@type': 'Offer',
        name: 'Enterprise',
        description: 'Custom pricing and dedicated support',
        priceCurrency: 'USD',
        url: 'https://ofroot.technology/consulting/book',
      },
      {
        '@type': 'Offer',
        name: 'Consulting Retainer',
        description: 'Dedicated engineering retainer ($6K–$12K+/month)',
        priceCurrency: 'USD',
        url: 'https://ofroot.technology/consulting/book',
      },
    ],
  };
}

export function generateConsultingFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does a discovery call cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It is free. No credit card required. We just want to understand your project.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if I am not ready to commit to a retainer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'That is fine. We can discuss options: hourly consulting, a smaller project, or just architectural advice. The call is about finding the best fit.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you work with non-technical founders?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We have worked with founders, PMs, and non-technical co-founders. We will translate technical concepts and be clear about tradeoffs.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long until we can start?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After the call, typically 1–2 weeks. We will align on the statement of work, then begin onboarding and project scoping.',
        },
      },
      {
        '@type': 'Question',
        name: 'What time zones do you work in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'US Eastern (ET). We can accommodate early/late calls if needed, but typically 9am–5pm ET works best.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I send a project brief before the call?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. After you book, you will get a confirmation with a form to share context. The more you tell us, the better we can prepare.',
        },
      },
    ],
  };
}

export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'OfRoot Consulting',
    description: 'Senior architecture and engineering consulting services',
    url: 'https://ofroot.technology/consulting',
    areaServed: 'US',
    availableLanguage: ['en'],
    telephone: '+1-XXX-XXX-XXXX',
    email: 'hello@ofroot.technology',
    serviceType: [
      'Architecture Consulting',
      'Engineering Automation',
      'AI Integration',
      'Code Delivery',
      'DevOps',
      'Scalability',
      'Stability & Growth',
    ],
  };
}
