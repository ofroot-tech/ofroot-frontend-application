import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FeaturePage from '@/components/growth/FeaturePage';
import { featurePages, featurePath, getFeature } from '@/app/lib/feature-content';
import { SITE_URL } from '@/app/lib/growth-content';

type Params = Promise<{ service: string; feature: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return featurePages.map(feature => ({ service: feature.service, feature: feature.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { service, feature: slug } = await params;
  const feature = getFeature(service, slug);
  if (!feature) return {};
  const path = featurePath(feature);
  const title = feature.seoTitle || `${feature.eyebrow} Services`;
  const description = feature.seoDescription || feature.description;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      title: `${title} · OfRoot`,
      description,
      images: [{ url: `${SITE_URL}/og.jpg`, width: 1200, height: 630, alt: `OfRoot ${feature.eyebrow}` }],
    },
    twitter: { card: 'summary_large_image', title: `${title} · OfRoot`, description, images: [`${SITE_URL}/og.jpg`] },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { service, feature: slug } = await params;
  const feature = getFeature(service, slug);
  if (!feature) notFound();
  return <FeaturePage content={feature} />;
}
