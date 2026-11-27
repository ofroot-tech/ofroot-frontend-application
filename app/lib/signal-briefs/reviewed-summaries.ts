import { createHash } from 'node:crypto';
import type { BriefEvidence } from './types';

// The abstract must still match the one used to write the note. A publisher
// correction sends readers back to the current source excerpt on the next check.
const reviewed: Record<string, { abstractHash: string; text: string }> = {
  'https://arxiv.org/abs/2611.34711': {
    abstractHash: '4c54a874badd97253e887cd3371b68aab8ab47d030abb06b7a4dcf6de10b97f1',
    text: 'The researchers tested whether an AI could build small neural networks from written instructions alone. They report proving that 12 of the first 15 networks behaved exactly as specified within defined input limits, including one network that needed a small fix.',
  },
  'https://arxiv.org/abs/2611.34241': {
    abstractHash: '006b0b929ba1d5eb76c66d84b4bc5b8de6bec0ec7b4c162425a4f74569ad04dd',
    text: 'TigerTTS turns text into speech in two passes. One model drafts the whole utterance, and a second refines it. The author reports generating speech about 20 times faster than real time on one graphics processor in the tested setup.',
  },
  'https://arxiv.org/abs/2611.34560': {
    abstractHash: 'f2acf688a504f974787a9f34dacb68b7638d68b9939e42e71ddc2701daf3162d',
    text: 'The researchers built a system that helps a robot remember what it sees and the forces it feels, then adapt as contact changes. They report an average success rate of about 83% across eight tasks that needed both kinds of memory.',
  },
  'https://arxiv.org/abs/2611.34090': {
    abstractHash: '49cca4ef1166bd5d882ef70e76e2f16eb5e7cd3b2f42a4dd9b5b000613a5a99d',
    text: 'The author argues that words like “understanding” and “belief” can be useful when talking about AI. He proposes choosing what those words should mean for AI based on what people need to describe and what evidence shows about how the system works.',
  },
};

export function getReviewedSummary(evidence: BriefEvidence): string | undefined {
  const note = reviewed[evidence.url];
  if (note && createHash('sha256').update(evidence.abstract).digest('hex') === note.abstractHash) return note.text;
}
