# ofroot-frontend-application

A modern frontend application built with [Next.js](https://nextjs.org), designed for deployment on [Vercel](https://vercel.com).

## Tech Stack
- **Next.js** (React framework)
- **Tailwind CSS** (utility-first CSS)
- **Vanta.js** (animated backgrounds, topology effect)
- **p5.js** (rendering library for Vanta.js topology)
- **TypeScript** (type safety)

## Backend Communication
- Communicates with a **Laravel** backend
  - Handles authorization, authentication, and all backend logic
  - API endpoints for data, user management, and more

## Vanta.js Integration
This project uses Vanta.js for animated backgrounds. The topology effect is implemented on the home page.

### Dependencies
- `vanta` - Core Vanta.js library
- `p5` - Required for topology effect rendering
- `@types/p5` (dev) - TypeScript types for p5.js

### Customizing Colors
To change the background colors of the Vanta effect:
1. Open `app/page.tsx`
2. Locate the `TOPOLOGY` initialization in the `useEffect`
3. Modify the `color` and `backgroundColor` options:
   - `color`: Hex color for particles/lines (e.g., `0x007cf0` for blue)
   - `backgroundColor`: Hex color for the background (e.g., `0xffffff` for white)
4. Save and the changes will hot-reload

Example:
```tsx
vantaEffect.current = TOPOLOGY({
  // ... other options
  color: 0xff6b6b,        // Red particles
  backgroundColor: 0x2c3e50, // Dark blue background
});
```

### Best Practices for Next.js & Vercel
1. **Use Client Components**: Add `'use client'` at the top of components using Vanta to ensure client-side rendering.
2. **Dynamic Imports**: Import Vanta effects dynamically inside `useEffect` to avoid SSR issues.
   ```tsx
   const TOPOLOGY = (await import('vanta/dist/vanta.topology.min')).default;
   ```
3. **Proper Cleanup**: Always destroy the Vanta effect in the cleanup function to prevent memory leaks.
4. **Vercel Optimization**: Vanta works seamlessly with Vercel deployments. Ensure effects are initialized only on the client-side for optimal performance.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the home page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Vercel Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vanta.js Documentation](https://www.vantajs.com/)

## Vercel Deployment (recommended)

Recommended settings to ensure a smooth deployment:

- Framework Preset: `Next.js` (auto-detects the App Router and static/SSR routes).
- Root Directory: `./` (use this if the project lives at the repository root).
- Install Command: `npm ci` (or `npm install` if you prefer).
- Build Command: `npm run build` (Vercel will run `next build`).
- Output Directory: leave blank (Vercel auto-detects Next.js output). If you need to set one, use `.next`.
- Environment Variables: add any runtime keys (for example `NEXT_PUBLIC_API_URL`, `API_URL`, or third-party keys) under the "Environment Variables" panel before deploying.
- Node Version: pin via `engines` in `package.json` or add a `.nvmrc` if you want a specific Node.js version on Vercel.

Notes and best practices:
- Keep `Framework Preset` as `Next.js` and `Root Directory` as `./` for the defaults shown in your screenshot — this is correct for this repo.
- Vanta effects are client-only; ensure components using Vanta include `'use client'` and use dynamic imports (this repo already does this in `app/page.tsx`).
- If you see the warning about `@next/font`, migrate to the built-in `next/font` (Next.js 14 will remove `@next/font`). You can run the codemod: `npx @next/codemod@latest built-in-next-font .` before deploying.
- Add any required environment variables before deployment so server-side builds that depend on them succeed.

Deploying:
1. Import the repository into Vercel and choose the `ofroot-frontend-application` project name.
2. Confirm the framework preset is `Next.js` and the root directory is `./`.
3. Add environment variables (if any) and click Deploy.

This project is configured to work with Vercel's default Next.js settings.

---

This frontend is designed to work seamlessly with a Laravel backend and is optimized for Vercel hosting.
