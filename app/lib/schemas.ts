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

import { CANONICAL_SITE_URL } from '@/app/config/site';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OfRoot',
    url: CANONICAL_SITE_URL,
    logo: `${CANONICAL_SITE_URL}/ofroot-logo.png`,
    description: 'AI-powered growth and operations systems for visibility, conversion, and company knowledge.',
    sameAs: [
      'https://twitter.com/ofroot_tech',
      'https://www.linkedin.com/company/106671711',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      url: `${CANONICAL_SITE_URL}/book`,
    },
  };
}

export function generatePricingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'OfRoot AI Growth Systems',
    description: 'AI discoverability, revenue automation, private company AI, and ongoing growth-system optimization.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Growth Systems Build',
        description: 'A focused production build for one priority conversion or automation workflow.',
        price: '3500',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: `${CANONICAL_SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Ongoing Optimization',
        description: 'Ongoing implementation, monitoring, and growth-system optimization.',
        price: '6000',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: `${CANONICAL_SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Company Intelligence System',
        description: 'Custom private company AI implementation around approved sources and access rules.',
        priceCurrency: 'USD',
        url: `${CANONICAL_SITE_URL}/book`,
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
    url: `${CANONICAL_SITE_URL}/consulting`,
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
