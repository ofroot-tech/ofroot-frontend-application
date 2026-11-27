import type { SecurityArticleDraft } from './application-security-content';

const newsPath = '/news/mycolorado-uploaded-document-incident-update';
const guidePath = '/blog/check-document-access-on-every-download';
const sources = [
  { label: 'Colorado: myColorado incident update and FAQ', href: 'https://mycolorado.gov/' },
  { label: 'OWASP Insecure Direct Object Reference Prevention Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html' },
  { label: 'OWASP File Upload Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html' },
  { label: 'AWS: Download and upload objects with presigned URLs', href: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html' },
];

export const MYCOLORADO_NEWS_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-27', sourcesCheckedAt: '2026-11-27', kind: 'news',
  slug: 'mycolorado-uploaded-document-incident-update', href: newsPath,
  title: 'Colorado reports access to myColorado users’ documents',
  label: 'Signal / U.S. incident update',
  description: 'What Colorado’s November 25 update confirms, with practical questions for teams storing private uploads.',
  summary: 'Colorado’s November 25 update says unauthorized access primarily involved uploaded PDFs and photographs in myColorado’s myCards and Documents section, including passports, vehicle registrations and insurance cards. The state says payment information was not involved. It is still matching accessed files to individual users.',
  summarySourceIds: [1],
  sections: [
    {
      id: 'dates', title: 'Detection, the scope update and planned notices are different dates',
      paragraphs: ['The state says unusual activity was detected late on November 18. Its November 25 update estimates that roughly 100,000 users’ data was involved and anticipates individual notices beginning November 27. That is a preliminary estimate and a planned start, not confirmation that notices have been delivered.', 'The official page still reports the app unavailable without a confirmed restoration timeline. Affected users should consult the state’s current update and individual notices for information about their own files.'],
      sourceIds: [1],
    },
    {
      id: 'scope', title: 'The public update leaves the technical cause open',
      paragraphs: ['The update does not establish the technical entry method or a final affected-person count. It does not diagnose a particular file-permission flaw. The review below is OfRoot’s general engineering guidance, rather than a finding about the state’s implementation.'],
      sourceIds: [1],
    },
    {
      id: 'engineering-reading', title: 'OfRoot’s reading: private files need a retrieval policy',
      paragraphs: ['An application may check who can upload a file and still need separate controls for previewing, downloading or sharing it. Review each retrieval path against the user’s current permissions and the document’s owner. OWASP’s guidance covers checks on referenced objects and controlled storage for uploaded files.', 'The companion guide turns that into a small test using synthetic documents and authorized test accounts. It also distinguishes application permissions from temporary storage links: AWS documents that a presigned S3 URL can be reused until its applicable expiration. Test the access policy your product actually promises.'],
      sourceIds: [2, 3, 4],
    },
  ],
  sourceNote: 'Dated state update checked November 27. OfRoot’s file-access review is separate engineering analysis.',
  sources,
};

export const DOCUMENT_ACCESS_GUIDE_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-27', sourcesCheckedAt: '2026-11-27', kind: 'guide',
  slug: 'check-document-access-on-every-download', href: guidePath,
  title: 'Check private document access on every download',
  label: 'Application security / Practical guide',
  description: 'A focused review of who can retrieve private files, how sharing works and what happens when permission changes.',
  summary: 'Choose one private-document workflow and map every way its files can be retrieved. Use synthetic documents and test accounts to check the owner, another user and another tenant. Review direct storage links and sharing lifetimes separately from application sessions, then record both allowed and denied results.',
  sections: [
    {
      id: 'context', title: 'Start with the file’s intended audience',
      paragraphs: ['Colorado’s document-access update prompts a broader question about private uploads. The method here is OfRoot’s engineering analysis, not an explanation of that incident’s cause.', 'Choose a document type and define who should read it: its owner, a named collaborator, an approved support role or nobody outside one organization. Write down sharing, expiry and revocation expectations before choosing the storage mechanism. Public assets require a different policy from private uploads.'],
      sourceIds: [1],
    },
    {
      id: 'paths', title: 'Map all the ways the document can leave storage',
      paragraphs: ['Include the main download, inline preview, thumbnail, mobile endpoint, export, background job and any direct object-storage URL. Record where each path checks permission and which identity reads the underlying file.', 'OWASP’s upload guidance addresses controlled storage and retrieval. A check on the upload form does not settle access through a second endpoint, a preview service or a bucket URL. Follow the same private-document policy through those paths.'],
      sourceIds: [3],
    },
    {
      id: 'test-accounts', title: 'Compare access with synthetic users and documents',
      paragraphs: ['In an authorized test environment, create synthetic files for two users and, where relevant, two tenants. Confirm each intended reader can retrieve the correct file. Then use the test accounts to check that requests for the other user’s or tenant’s file are denied.', 'Check file content and metadata as well as response codes. A denied download should not still reveal a preview, filename or sensitive description outside the intended policy. OWASP emphasizes object-level permission checks even when identifiers are long or difficult to guess.'],
      sourceIds: [2],
    },
    {
      id: 'sharing', title: 'Treat a storage link as its own access decision',
      paragraphs: ['For S3, AWS describes presigned URLs as bearer tokens: possession can grant the specified access, and a URL can be used repeatedly before its applicable expiration. Its lifetime is also limited by the signing credentials and relevant storage policies.', 'Check who can create a link, which object and operation it allows, where it is exposed and how long it remains usable. Revoking an application session does not by itself establish that an already issued storage URL is invalid. If the product requires immediate withdrawal of access, choose and test a mechanism that enforces that requirement.'],
      sourceIds: [4],
    },
    {
      id: 'changes', title: 'Retest after permissions or ownership change',
      paragraphs: ['Change the synthetic user’s role, remove a collaborator or move the test document between permitted scopes. Recheck application endpoints and previously issued links against the documented policy, including any allowed delay before access ends.', 'Keep customer documents, live credentials and production storage out of the experiment. Record unresolved paths with an owner and next action rather than treating a hidden download button as evidence that access has been revoked.'],
    },
    {
      id: 'handoff', title: 'Keep evidence that another engineer can assess',
      paragraphs: ['Record the environment, document type, test identities, relevant role or tenant, expected access and actual result. Include link-expiry behavior without copying usable signed URLs or secret values into a report.', 'Retest authorized workflows after a fix and keep a rollback plan that preserves the private-file policy. This review addresses one part of application security; it does not certify an application or establish that any particular incident has been fully resolved.'],
    },
  ],
  sources,
};
