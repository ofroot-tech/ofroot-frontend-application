import type { NewsArticle } from '../news/types';
import type { BriefEvidence, BriefPerspective } from './types';

/** These editorial lenses are questions, selected from the actual research title.
 * They never turn an abstract into claims of performance or production readiness. */
function researchLens(title: string) {
  if (/retriev|\brag\b|grounding|knowledge graph/i.test(title)) return {
    audience: 'Teams evaluating retrieval and company-knowledge systems',
    relevance: 'Treat this as a lead for evaluating how evidence is retrieved and kept current. An abstract does not establish production readiness or independent replication.',
    question: 'Compare the retrieval corpus, source permissions, grounding checks, and data-refresh assumptions with your own knowledge workflow.',
  };
  if (/agent|tool.use|tool.call|model context protocol|\bmcp\b/i.test(title)) return {
    audience: 'Teams considering agents, tool access, or connected workflows',
    relevance: 'Use this record to frame an agent evaluation, including where tool access begins and ends. An abstract does not establish production readiness or independent replication.',
    question: 'Check tool permissions, failure recovery, human checkpoints, and the evaluation tasks before testing a similar workflow.',
  };
  if (/attack|security|privacy|adversarial|vulnerabil/i.test(title)) return {
    audience: 'Teams evaluating the security or privacy of AI systems',
    relevance: 'The threat model and evaluation setting determine how useful this research is for your environment. An abstract does not establish production readiness or independent replication.',
    question: 'Read the full threat model and tested defenses, then compare access assumptions and failure cases with your deployment.',
  };
  if (/interoperab|integration|\bapi\b|connector|schema/i.test(title)) return {
    audience: 'Teams evaluating interoperability and system integrations',
    relevance: 'The interface assumptions matter when judging whether this research can inform a real integration. An abstract does not establish production readiness or an available connector.',
    question: 'Check the interfaces, schema assumptions, supported versions, authentication model, and failure behavior in the full paper.',
  };
  if (/clinical|patient|health|medical|diagnos/i.test(title)) return {
    audience: 'Teams assessing healthcare research and evaluation methods',
    relevance: 'Read this as a research lead whose data, population, and evaluation setting need inspection. An abstract does not establish production readiness or clinical suitability.',
    question: 'Review the study population, data access, validation setting, and reported limitations before considering a separate evaluation.',
  };
  return {
    audience: 'Teams evaluating the approach described in this research record',
    relevance: 'Use the named research record to plan a bounded comparison with your existing workflow. An abstract does not establish production readiness or independent replication.',
    question: 'Read the full methods, baselines, resource requirements, and limitations; define a small evaluation against your current workflow.',
  };
}

export function composePerspective(article: NewsArticle, evidence: BriefEvidence): BriefPerspective {
  const fact = (label: string) => evidence.facts.find(item => item.label === label)?.value;
  const basis = `Prepared automatically from the matching ${evidence.publisher} record. OfRoot’s questions are editorial guidance, separate from the source’s claims; no human review is represented.`;
  if (article.sourceId === 'cisa') {
    const identifier = fact('CVE') || evidence.title;
    const product = [fact('Vendor'), fact('Product')].filter(Boolean).join(' / ');
    return {
      changed: `${identifier} appears in CISA’s Known Exploited Vulnerabilities catalog${product ? ` for ${product}` : ''}.`,
      audience: product ? `Teams whose inventory includes ${product}; check the exact affected versions in vendor guidance.` : 'Teams checking this exact vulnerability against their software inventory.',
      relevance: `Catalog inclusion makes ${identifier} a useful inventory and remediation check. It does not show that your organization has been compromised.`,
      nextStep: `Compare ${identifier} with your asset inventory, then review the matching catalog entry and current vendor instructions.${fact('Federal agency due date') ? ` The recorded ${fact('Federal agency due date')} deadline is for covered U.S. federal agencies, not a universal deadline.` : ''}`,
      basis,
    };
  }
  if (article.sourceId === 'federal-register') {
    const kind = fact('Document type') || 'Document';
    const identifier = fact('Document number') || evidence.title;
    const proposed = /proposed/i.test(kind);
    return {
      changed: `The Federal Register identifies ${identifier} as ${/^[aeiou]/i.test(kind) ? 'an' : 'a'} ${kind.toLowerCase()}${fact('Effective date recorded') ? `, with an effective date recorded as ${fact('Effective date recorded')}` : '; no effective date is supplied in this brief’s metadata'}.`,
      audience: `Teams checking whether the scope of “${evidence.title}” includes their workflows, data, or services. Applicability must be read in the official document.`,
      relevance: proposed ? 'A proposed rule is a proposal, so distinguish its consultation and planning implications from requirements already in force.' : `The recorded ${kind.toLowerCase()} status matters when separating proposals, notices, and rules. The abstract alone does not establish your obligations.`,
      nextStep: `Open document ${identifier} and check affected parties, jurisdiction, status, and dates before changing a business process.`,
      basis,
    };
  }
  if (article.kind === 'research') {
    const lens = researchLens(evidence.title);
    return {
      changed: `The author-supplied record${fact('DOI') ? ` ${fact('DOI')}` : ''} makes an abstract and publication details available for “${evidence.title}”.`,
      audience: `${lens.audience}. Use the linked paper to determine whether the research setting matches your needs.`,
      relevance: lens.relevance,
      nextStep: lens.question,
      basis,
    };
  }
  return {
    changed: `${evidence.publisher} published the announcement “${evidence.title}”. This brief covers its agency-supplied summary.`,
    audience: 'Teams monitoring the particular product, program, or topic named in this announcement; read its scope before assuming it applies to your work.',
    relevance: 'The announcement is a route to the agency’s stated scope and next steps. Its presence here does not establish clinical benefit, approval, or commercial availability.',
    nextStep: `Read “${evidence.title}” at the agency source, including any supporting records and status updates, before drawing a product or clinical conclusion.`,
    basis,
  };
}
