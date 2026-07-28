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
- Final deployment: `dpl_FhS9NDcoG4fuGWLTdcn3RBBHbu27`, Ready, commit `249a33a`.
- Canonical route: 401 invalid signature; two original Health events returned 202.
- Idempotency: altered-body reuse returned 409; byte-exact retry returned 200 duplicate.
- Production readback: receipts 2, lifecycle rows 2, aggregates one account-created and one activated.
- Privacy readback: zero prohibited health/patient columns.
- Exact cleanup: deleted aggregate 2, lifecycle 2, receipt 2, referral 1, clinic 1; all scoped post-counts zero.
