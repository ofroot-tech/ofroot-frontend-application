# Validation

- Passed: static canonical-host source contract (exit 0).
- Passed: live naked host 307 to www; live www host 200 (existing production behavior).
- Blocked: Jest, TypeScript, and build due absent `node_modules/.bin/{jest,tsc,next}`. Build error: `sh: next: command not found` (exit 127).
