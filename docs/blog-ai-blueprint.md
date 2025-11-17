# AI Blog Platform Blueprint

## Vision

Create a modern blog studio that feels effortless, professional, and delightful. Authors can draft or auto-generate SEO-grade posts, edit them with precision, and publish with confidence. The experience should combine the polish of a design tool, the friendliness of a productivity app, and the velocity of AI-assisted creation.

## Experience Pillars

1. **Effortless** – Users spend their energy on ideas, not tooling. AI handles initial drafts, metadata, and tags with minimal input.
2. **Professional** – Typography, layout, and controls convey credibility. Every interaction reinforces trust.
3. **Delightful** – Micro-interactions (hover lifts, shimmer skeletons, progress sparkles) make the UI feel alive without causing fatigue.

## Feature Breakdown

| Surface | Purpose | Notes |
| --- | --- | --- |
| AI Composer Dialog | Input topic → show generation progress → preview → accept/regenerate. | Multi-step dialog with optimistic UI, support for error + retry. |
| Post Grid | Card-based responsive gallery with hero image, tags, status pill, and metadata stack. | Grid uses CSS masonry `auto-fill` with clamp-based column width for mobile-first. |
| Manual Editor | Modern form with split preview (MDX). Auto slugging, validation chips, tag input, meta panel. | Lives under `/dashboard/blog/[id]/edit` & `/new`. |
| Detail View | Full-screen article page with emphasis on typography hierarchy, meta sidebar, and actions. | `/dashboard/blog/[id]` (admin) + `/blog/[slug]` (public). |
| Delete Flow | Alert dialog w/ contextual copy, double-confirm, immediate UI removal. | Reuses shared `ConfirmActionDialog`. |

## Data Model Extensions

Add a follow-up migration for `blog_posts`:

- `meta_title` (string, nullable)
- `meta_description` (text, nullable)
- `featured_image_url` (string, nullable)
- `tags` (json, default [])
- `ai_context` (json, nullable) – stores provider metadata, prompt, etc.

All new fields should be fillable and cast (`tags` as array, `ai_context` as array, `featured_image_url` string).

## Backend Changes

### Routes

```text
POST   /api/blog-posts/generate    -> BlogPostGenerationController@generate (auth + blog.addon)
POST   /api/blog-posts             -> BlogPostController@store
PUT    /api/blog-posts/{id}        -> BlogPostController@update
```

### Services

- Accepts `topic`, optional `tone`, `keywords`.
- Uses provider (OpenAI, Anthropic, Azure, etc.) configured via env.
- Returns normalized payload: `{ title, slug, excerpt, body_markdown, meta_description, tags: string[], featured_image_url }`.
- Resilient to slow responses (timeout + retry). Raises custom exception for UI to show retry.

### Controllers

- New `BlogPostGenerationController` uses `BlogComposer` and returns preview payload without persisting.
- `BlogPostController@store` / `update` accept new fields + tag arrays. Unique slug logic handles duplicates by auto-appending `-2`, `-3`, ...
- Validation ensures excerpt/body lengths, tag count, optional hero image URL.

### Config & Env

- `AI_BLOG_PROVIDER` (`openai`, `anthropic`, `azure`, `mock`).
- `AI_BLOG_MODEL` (e.g., `gpt-4.1-mini`).
- `AI_BLOG_API_KEY` (injected later).
- `AI_BLOG_TIMEOUT_MS` (default 45000).

Provide `.env.example` placeholders and guard rails (throw 503 if provider missing).

## Frontend Architecture

### State Flow

```text
DashboardBlogPage
  ├─ PostGrid (cards)
  ├─ EmptyState (CTA + illustration)
  ├─ FloatingCreateFAB (AI by default)
  └─ AiComposerDialog (portal)
      ├─ TopicEntryStep
      ├─ GenerationStep (progress w/ spark trail animation)
      └─ PreviewStep (accept/regenerate)
```

- Use React Server Components for initial data fetch (list view) + Client Components for dialogs/interactions (ai composer, forms, editors).
- Data access via `app/lib/api.ts` additions: `blogGenerate`, `blogCreate`, `blogUpdate`, `blogDelete`, `blogList`, `blogDetail`.
- Hooks: `useAiComposer` manages states (`idle`, `loading`, `preview`, `error`).

### Visual Language

- **Color Palette** (OKLCH values from brief) exposed as CSS variables in `app/globals.css`.
- Buttons: primary (deep purple), secondary (soft lavender border), accent (amber).
- Cards: gradient backgrounds with fallback (CSS `conic-gradient`).
- Typographic scale via CSS custom properties + `font-variation-settings` for Inter.
- Animations: use `@keyframes float` for cards, `transition` for button scale, `framer-motion` optional.

### Components to Build / Update

1. `components/blog/PostCard.tsx` – handles layout, fallback image, meta stack, actions.
2. `components/blog/AiComposerDialog.tsx` – multi-step dialog with progress indicator.
3. `components/blog/PostForm.tsx` – reorganize fields, add slug auto-generation, meta + tag chips.
4. `components/blog/TagInput.tsx` – pill-based input with keyboard support.
5. `components/blog/DeleteDialog.tsx` – re-usable confirm dialog.
6. `components/blog/DetailLayout.tsx` – used by dashboard + public view to keep consistency.

### UX Flows

- **AI Generate**: FAB or toolbar button → dialog → `generate` request → show progress (spark animation) → show preview card with Accept/Edit options → Accept saves (calls `POST /api/blog-posts`) + navigates to editor.
- **Manual Editor**: Option within dialog or header button "Manual Mode". Editor uses split-screen live preview.
- **List View**: Masonry grid w/ filters (draft/published). Skeleton states on first load.
- **Delete**: Trigger from card kebab or detail view; toast on success.

## Edge Cases & Loading

- Skeleton loaders for grid + detail view.
- Toasts for AI errors with "Try again" link.
- When duplicate slug arises, backend returns 422; UI surfaces inline message and suggests alternative slug.
- Offline states: show neutral banner when fetch errors occur.

## Testing Plan

- Backend feature tests for generation controller (mock provider) + CRUD validation.
- Frontend Playwright tests covering AI generation happy path, manual creation, edit/publish, delete.
- Storybook (optional) for PostCard and AI dialog components.

## Next Steps

1. Ship migration + backend service + API route.
2. Implement frontend components + integrate with new API endpoints.
3. Polish animations + responsive behavior.
4. Add documentation for env setup and release checklist (seed users, tokens, etc.).
