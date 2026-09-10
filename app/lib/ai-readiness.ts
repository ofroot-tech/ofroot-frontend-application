export type ReadinessCategory =
  | 'Workflow'
  | 'Value'
  | 'Data'
  | 'Permissions'
  | 'Controls'
  | 'Operations';

export type ReadinessQuestion = {
  id: string;
  category: ReadinessCategory;
  prompt: string;
  guidance: string;
};

export const readinessQuestions: ReadinessQuestion[] = [
  { id: 'workflow-trigger', category: 'Workflow', prompt: 'The workflow has a clear trigger, outcome, and accountable owner.', guidance: 'A team member can explain what starts the work and what proves it is complete.' },
  { id: 'workflow-exceptions', category: 'Workflow', prompt: 'Common exceptions and recovery paths are documented.', guidance: 'The process does not depend on one person remembering every edge case.' },
  { id: 'value-baseline', category: 'Value', prompt: 'We have a baseline for time, delay, errors, rework, or another business cost.', guidance: 'The team can compare agent performance with the current process.' },
  { id: 'value-outcome', category: 'Value', prompt: 'The use case is tied to a measurable business outcome.', guidance: 'Success means more than producing a plausible response or impressive demo.' },
  { id: 'data-sources', category: 'Data', prompt: 'Approved sources of truth and their owners are known.', guidance: 'The agent will not need to guess which document, system, or record is authoritative.' },
  { id: 'data-quality', category: 'Data', prompt: 'Source freshness, missing data, and conflicts can be detected.', guidance: 'The workflow exposes weak context instead of silently treating it as correct.' },
  { id: 'permissions-scope', category: 'Permissions', prompt: 'Access can be limited to the records, fields, and actions required.', guidance: 'The proposed integration supports least-privilege access.' },
  { id: 'permissions-writes', category: 'Permissions', prompt: 'Writes and external actions can be validated before execution.', guidance: 'Application rules—not the model alone—control what may change.' },
  { id: 'controls-approval', category: 'Controls', prompt: 'Sensitive or high-impact actions have explicit human approval boundaries.', guidance: 'Review happens at the moment a consequential action is proposed.' },
  { id: 'controls-failure', category: 'Controls', prompt: 'The workflow can stop safely, avoid duplicate actions, and route exceptions.', guidance: 'Retries, failures, and missing context do not create uncontrolled side effects.' },
  { id: 'operations-evaluation', category: 'Operations', prompt: 'Representative tasks and edge cases can be used to evaluate behavior.', guidance: 'Quality can be tested before launch and after models, prompts, or sources change.' },
  { id: 'operations-monitoring', category: 'Operations', prompt: 'Owners can inspect runs, alerts, approvals, cost, and business completion.', guidance: 'The operating team can diagnose and recover the workflow after release.' },
];

export const readinessAnswerOptions = [
  { value: 0, label: 'Not in place', description: 'This is missing or informal.' },
  { value: 1, label: 'Partly in place', description: 'Some pieces exist, but they are incomplete or untested.' },
  { value: 2, label: 'In place', description: 'This is documented, owned, and usable for the proposed workflow.' },
] as const;

export type ReadinessResult = {
  score: number;
  stage: string;
  summary: string;
  categoryScores: Array<{ category: ReadinessCategory; score: number }>;
  priorities: ReadinessCategory[];
};

export function calculateReadiness(answers: Record<string, number>): ReadinessResult {
  const categories = Array.from(new Set(readinessQuestions.map(question => question.category)));
  const answeredTotal = readinessQuestions.reduce((total, question) => total + (answers[question.id] ?? 0), 0);
  const maximum = readinessQuestions.length * 2;
  const score = Math.round((answeredTotal / maximum) * 100);

  const categoryScores = categories.map(category => {
    const questions = readinessQuestions.filter(question => question.category === category);
    const total = questions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
    return { category, score: Math.round((total / (questions.length * 2)) * 100) };
  });

  const priorities = [...categoryScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(item => item.category);

  if (score >= 85) return { score, stage: 'Ready to scale carefully', summary: 'The operating foundation is strong. Validate the evidence, keep the first scope bounded, and expand only when production results support it.', categoryScores, priorities };
  if (score >= 70) return { score, stage: 'Ready for a bounded production pilot', summary: 'Most foundations are present. Close the weakest control gaps, define launch evidence, and keep the first agent workflow narrow.', categoryScores, priorities };
  if (score >= 40) return { score, stage: 'Pilot-ready with controls', summary: 'A useful pilot may be possible, but the weakest operating areas should be strengthened before the agent can take consequential actions.', categoryScores, priorities };
  return { score, stage: 'Foundation required', summary: 'Start by defining one workflow, its sources, owner, controls, and measurable value before selecting an agent platform.', categoryScores, priorities };
}
