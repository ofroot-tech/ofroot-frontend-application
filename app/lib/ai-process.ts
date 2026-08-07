export type AiProcessPhaseId = 'discover' | 'measure' | 'prioritize' | 'build' | 'improve';

export type AiProcessPhase = {
  id: AiProcessPhaseId;
  number: number;
  title: string;
  description: string;
  deliverables: readonly string[];
};

export type AiProcessStageId =
  | 'business-profile'
  | 'department-discovery'
  | 'process-mapping'
  | 'cost-analysis'
  | 'opportunity-scoring'
  | 'recommended-roadmap'
  | 'proposal'
  | 'build'
  | 'launch'
  | 'roi-monitoring';

export type AiProcessStage = {
  id: AiProcessStageId;
  number: number;
  title: string;
  description: string;
  phase: AiProcessPhaseId;
  deliverables: readonly string[];
};

export type AiProcessFaq = {
  question: string;
  answer: string;
};

export const AI_PROCESS_PHASES: readonly AiProcessPhase[] = [
  {
    id: 'discover',
    number: 1,
    title: 'Discover',
    description: 'We interview the people doing the work and map the tools, handoffs, delays, and recurring tasks behind each process.',
    deliverables: ['Business context', 'Department interviews', 'Process inventory', 'System inventory'],
  },
  {
    id: 'measure',
    number: 2,
    title: 'Measure',
    description: 'We calculate what manual work costs using the company’s own time, labor, volume, and error data.',
    deliverables: ['Annual manual-work cost', 'Delay and error estimates', 'Cost-of-inaction analysis'],
  },
  {
    id: 'prioritize',
    number: 3,
    title: 'Prioritize',
    description: 'We rank opportunities by expected value, effort, risk, urgency, and time to impact.',
    deliverables: ['Opportunity scorecard', 'Recommended priorities', 'Phased roadmap'],
  },
  {
    id: 'build',
    number: 4,
    title: 'Build',
    description: 'OfRoot implements the selected workflow using the simplest reliable combination of automation, APIs, AI, and existing software.',
    deliverables: ['Implementation', 'Testing', 'Documentation', 'Launch plan'],
  },
  {
    id: 'improve',
    number: 5,
    title: 'Improve',
    description: 'We measure the actual result, fix weak points, and identify the next highest-value opportunity.',
    deliverables: ['ROI dashboard', 'Adoption review', 'Optimization backlog', 'Expansion plan'],
  },
] as const;

export const AI_PROCESS_STAGES: readonly AiProcessStage[] = [
  { id: 'business-profile', number: 1, title: 'Business Profile', description: 'Define the company, goals, operating constraints, and success measures.', phase: 'discover', deliverables: ['Business profile', 'Success criteria'] },
  { id: 'department-discovery', number: 2, title: 'Department Discovery', description: 'Interview the teams closest to the work and document recurring friction.', phase: 'discover', deliverables: ['Interview notes', 'Department inventory'] },
  { id: 'process-mapping', number: 3, title: 'Process Mapping', description: 'Trace tools, inputs, decisions, handoffs, exceptions, and outputs.', phase: 'discover', deliverables: ['Current-state process map', 'System inventory'] },
  { id: 'cost-analysis', number: 4, title: 'Cost Analysis', description: 'Measure manual time, labor cost, delay, rework, and error exposure.', phase: 'measure', deliverables: ['Cost-of-inaction model', 'Assumptions register'] },
  { id: 'opportunity-scoring', number: 5, title: 'Opportunity Scoring', description: 'Compare value, effort, risk, urgency, and time to impact.', phase: 'prioritize', deliverables: ['Opportunity scorecard', 'Ranked opportunities'] },
  { id: 'recommended-roadmap', number: 6, title: 'Recommended Roadmap', description: 'Sequence the highest-value work into practical, reviewable phases.', phase: 'prioritize', deliverables: ['Prioritized roadmap', 'Recommended architecture'] },
  { id: 'proposal', number: 7, title: 'Proposal', description: 'Confirm the selected outcome, delivery scope, evidence plan, and responsibilities.', phase: 'prioritize', deliverables: ['Implementation proposal', 'Delivery plan'] },
  { id: 'build', number: 8, title: 'Build', description: 'Implement the selected system with small releases and visible validation.', phase: 'build', deliverables: ['Working system', 'Test evidence', 'Operating documentation'] },
  { id: 'launch', number: 9, title: 'Launch', description: 'Release safely, confirm real behavior, and hand off operating ownership.', phase: 'build', deliverables: ['Launch record', 'Runbook', 'Rollback plan'] },
  { id: 'roi-monitoring', number: 10, title: 'ROI Monitoring', description: 'Compare measured results with the approved baseline and improve weak points.', phase: 'improve', deliverables: ['ROI review', 'Optimization backlog'] },
] as const;

export const AI_PROCESS_AUDIT_DELIVERABLES = [
  'Current-state process map',
  'Bottleneck analysis',
  'Cost-of-inaction calculation',
  'Automation opportunity list',
  'Prioritized roadmap',
  'Recommended system design',
  'Estimated ROI',
  'Phased implementation plan',
  'Implementation proposal',
] as const;

export const AI_PROCESS_IMPLEMENTATION_EXAMPLES = [
  'AI-assisted document processing',
  'CRM routing and follow-up',
  'Customer onboarding workflows',
  'Internal knowledge assistants',
  'Lead qualification',
  'Operational reporting',
  'Proposal generation',
  'Support automation',
  'System integrations',
] as const;

export const AI_PROCESS_FAQS: readonly AiProcessFaq[] = [
  { question: 'What is an AI Process Audit?', answer: 'It is a structured review of how work moves through your company, what manual effort costs, and which AI or automation opportunities have the clearest business case.' },
  { question: 'Do we need to replace our current software?', answer: 'Usually not. We start by improving the process and the connections between tools you already use. Replacement is recommended only when the evidence supports it.' },
  { question: 'How do you calculate ROI?', answer: 'We use your approved inputs for time, loaded labor cost, work volume, delays, errors, and expected adoption. Every estimate keeps its assumptions visible.' },
  { question: 'What happens after the audit?', answer: 'You receive a ranked roadmap and practical implementation plan. You can use it internally, take it to another partner, or ask OfRoot to implement the selected work.' },
  { question: 'Can you implement the recommendations?', answer: 'Yes. OfRoot can scope and build the selected systems, validate them, document operations, and measure results after launch.' },
  { question: 'How long does the process take?', answer: 'The schedule depends on the number of departments, process complexity, data availability, and stakeholder access. The agreed scope defines the timeline before work begins.' },
] as const;
