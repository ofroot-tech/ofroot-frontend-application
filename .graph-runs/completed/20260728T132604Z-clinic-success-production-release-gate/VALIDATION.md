# Validation

- Target: Technology Supabase `mkgycihcekojbvmsexgv`.
- Migration ledger: local and remote `20260728121108` match.
- Schema: ten FORCE-RLS tables; zero prohibited Health-bearing column names.
- API roles: no schema or table access.
- Receiver login: dedicated, non-privileged, transaction-pooler connection; receiver tables only.
- Vercel: all three Production-sensitive variable names present; values not retrieved.
- Tests: four suites, nineteen tests passed.
- TypeScript and scoped ESLint: passed.
- Isolated production build: passed; receiver route listed.
- Integration: first event 202, identical retry 200, database counts 1/1/1.
- Cleanup: all synthetic rows removed and absence verified.
- Live deployment: pending.
