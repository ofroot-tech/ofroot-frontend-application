import publicStyles from '@/components/growth/PublicPage.module.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';
import HowWeWork from '@/components/sections/HowWeWork';

export const metadata: Metadata = {
  title: 'GPU Rental + Custom LLM Training | OfRoot',
  description:
    'Rent GPU capacity for labs and teams training custom LLMs. We also clean your data, build reliable pipelines, and harden training runs for reproducibility.',
  keywords: [
    'GPU rental',
    'GPU compute',
    'LLM training',
    'custom LLM training',
    'dataset cleaning',
    'data pipelines',
    'reproducible training',
    'training run monitoring',
  ],
  alternates: { canonical: '/gpu-llm-training' },
};

export default function GpuLlmTrainingPage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'GPU + LLM Training', item: `${SITE.url}/gpu-llm-training` },
    ],
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'GPU Rental + Custom LLM Training Support',
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: 'US',
    url: `${SITE.url}/gpu-llm-training`,
    serviceType: [
      'GPU compute rental',
      'Custom LLM training support',
      'Dataset cleaning and QA',
      'Data pipelines and reproducibility',
      'Training run monitoring and recovery',
    ],
    description:
      'We provide GPU capacity and the engineering layer required to train custom LLMs reliably: data cleaning, dataset QA, pipelines, and training run monitoring.',
  };

  const faqs = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you only rent GPUs, or do you help with the training too?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Both. We can provision GPU capacity and also help with dataset preparation, training pipelines, monitoring, and runbooks for reliability.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you help clean and validate our training data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We implement deduplication, normalization, labeling QA, leakage checks, and reproducible dataset builds.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you support sensitive datasets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We use least-privilege access, auditability, and safe handling patterns. We can scope security requirements during the first call.',
        },
      },
    ],
  };

  return (
    <main className={`${publicStyles.page} ${publicStyles.legacy} min-h-screen bg-[#211c2c] text-[#faf9fc]`}>
      <JsonLd data={[breadcrumbs, service, faqs]} />

      <div className="mx-auto max-w-6xl px-6 py-20 space-y-12">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-[2px] border border-[#d2caeb]/16 bg-[#262231] px-3 py-1 text-xs font-semibold text-[#faf9fc]">
            GPU compute + training reliability
          </div>
          <h1 className="text-4xl sm:text-6xl font-medium tracking-tight">
            GPU rental and custom LLM training support.
          </h1>
          <p className="text-lg sm:text-xl text-[#c9bed5] max-w-3xl">
            Training fails for predictable reasons: dirty datasets, leaky splits, brittle pipelines, and long runs with no recovery plan.
            We provide GPU capacity and the engineering layer that makes training repeatable and safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/consulting/book"
              className="inline-flex items-center justify-center rounded-lg bg-[#574064] px-5 py-3 text-white font-semibold shadow-sm hover:bg-[#6d4c70] transition-colors"
            >
              Book a GPU training call
            </Link>
            <Link
              href="/landing/gpu-llm-training"
              className="inline-flex items-center justify-center rounded-lg border border-[#d2caeb]/16 bg-[#211c2c] px-5 py-3 text-[#faf9fc] font-semibold shadow-sm hover:bg-[#262231] transition-colors"
            >
              View the short landing
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">GPU capacity</h2>
            <p className="text-sm text-[#c9bed5]">Provision compute so training is not blocked by hardware availability.</p>
          </div>
          <div className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Data cleaning</h2>
            <p className="text-sm text-[#c9bed5]">Deduplication, normalization, QA, and leakage checks to protect model quality.</p>
          </div>
          <div className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-6 shadow-card space-y-2">
            <h2 className="text-lg font-semibold">Run reliability</h2>
            <p className="text-sm text-[#c9bed5]">Monitoring, checkpoints, and failure recovery so long runs do not end in surprises.</p>
          </div>
        </section>

        <HowWeWork />

        <section className="rounded-[2px] border border-[#d2caeb]/16 bg-[#211c2c]/90 p-8 shadow-card space-y-3">
          <h2 className="text-2xl font-bold">Related</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/agent-integrations" className="underline font-semibold">Agent integrations</Link>
            <Link href="/services/workflow-automation" className="underline font-semibold">Pipelines + delivery automation</Link>
            <Link href="/services/automation-systems" className="underline font-semibold">Reliability and data sanity</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

