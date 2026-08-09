# Validation

- `git diff --check`: passed.
- `xmllint --noout public/ofroot-tech-logo.svg`: passed.
- Focused ESLint: passed with zero errors and one existing warning.
- `tsc --noEmit`: passed.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 next build`: passed; 168 of 168 static pages generated.
- Local desktop/mobile runtime: passed at 1440px and 390px without horizontal overflow.
- Vercel production deployment and canonical verification: pending.
