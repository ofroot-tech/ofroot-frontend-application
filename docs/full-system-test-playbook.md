# Full System Seed & Test Playbook

Use this guide any time you need to boot the full Ofroot stack locally, reseed data, and smoke-test feature areas end-to-end. It assumes macOS, PHP 8.2+, Node 18+, and that both repositories (`ofroot-api`, `ofroot-frontend-application`) live under `~/Projects` as in the standard setup.

---

## 1. Prerequisites

- **Backend**: PHP ≥ 8.2, Composer, SQLite (built-in), `php` CLI on PATH.
- **Frontend**: Node.js ≥ 18, npm.
- **Shared**: Git, curl, and (optional) `python3` for scripted checks.
- **Env secrets**: The shared dev seed password `ofroot-dev-pass`.

> Tip: run `php -v` and `node -v` once to confirm correct versions before investing in a long seed/test cycle.

---

## 2. Environment Configuration

### Backend (`ofroot-api/.env`)

Ensure the following keys exist (replace or append as needed):

```dotenv
APP_ENV=local
APP_DEBUG=true
ADMIN_EMAILS="dimitri.mcdaniel@gmail.com"
DEV_SEED_PASSWORD=ofroot-dev-pass
DB_CONNECTION=sqlite
DB_DATABASE="${APP_PATH}/database/database.sqlite"
```

### Frontend (`ofroot-frontend-application/.env.local`)

```dotenv
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
ADMIN_EMAILS=dimitri.mcdaniel@gmail.com
DEV_SEED_PASSWORD=ofroot-dev-pass
```

You can keep other service URLs (Prisma, Mongo, Sentry) as-is for local testing.

---

## 3. One-Time Setup

1. Install PHP deps:

   ```bash
   cd /Users/ofroot/Projects/ofroot-api
   composer install
   ```

2. Install Node deps:

   ```bash
   cd /Users/ofroot/Projects/ofroot-frontend-application
   npm install
   ```

3. Create the SQLite file if it does not exist:

   ```bash
   cd /Users/ofroot/Projects/ofroot-api
   mkdir -p database && touch database/database.sqlite
   ```

---

## 4. Seeding & Data Refresh

### Full refresh

Use when schema or persona data may be stale:

```bash
cd /Users/ofroot/Projects/ofroot-api
php artisan migrate:fresh --seed
DEV_SEED_PASSWORD=ofroot-dev-pass php artisan db:seed --class=UserSeeder
```

This recreates the schema, populates docs/blog/invoices, and adds persona users for every role (`persona+employee@ofroot.dev`, `persona+hr-manager@ofroot.dev`, etc.).

### Targeted reseed options

- **Personas only**: `DEV_SEED_PASSWORD=ofroot-dev-pass php artisan db:seed --class=UserSeeder`
- **Docs/blog refresh**: `php artisan db:seed --class=DocsSeeder` and `BlogPostSeeder`
- **Leads/tenants sample data**: set `APP_SEED_ALLOWED=true` temporarily, then `php artisan db:seed --class=TenantAndLeadSeeder`

> Never enable `APP_SEED_ALLOWED` in production; the seeder defends against it but don’t rely solely on guards.

---

## 5. Running the Stack Locally

### Laravel API (port 8000)

```bash
cd /Users/ofroot/Projects/ofroot-api
php artisan serve --host=127.0.0.1 --port=8000
```

### Next.js dashboard (port 3000)

```bash
cd /Users/ofroot/Projects/ofroot-frontend-application
npm run dev
```

With both processes running, the dashboard will point to the local API via `NEXT_PUBLIC_API_BASE_URL`.

---

## 6. Authentication + Impersonation Flow

1. Visit `http://localhost:3000/auth/login`.
2. Sign in as the seeded super admin:
   - Email: `dimitri.mcdaniel@gmail.com`
   - Password: `ofroot-dev-pass`
3. Open the sidebar **Impersonate** switcher (visible because the admin has the blog addon).
4. Choose one of the seeded personas:
   - Role: `Employee`, Plan: `Any plan` → impersonates `persona+employee@ofroot.dev`
   - Role: `HR Manager`, Plan: `Any plan` → impersonates `persona+hr-manager@ofroot.dev`
5. Click **Impersonate**. A successful POST to `/api/admin/impersonate` returns a new Sanctum token and the browser reloads under that persona.
6. To revert, either impersonate the `Admin` persona or log out/in as the super admin again.

### API-level spot check (optional)

You can confirm tokens quickly without the UI:

```bash
cd /Users/ofroot/Projects/ofroot-api
python3 scripts/impersonation_check.py   # or inline script from docs/README
```

The helper script should print JSON responses for both employee and HR manager impersonations.

---

## 7. Feature Test Checklist

Use the impersonation personas below to cover each feature domain.

### 7.1 Admin (super admin user)

- **Overview dashboard**: Metrics cards load (tenants/users). Ensure zero values show as `0` not placeholders.
- **Users table**: Confirm persona emails, role badges, and subscription metadata appear.
- **Docs workspace**: Navigate to `/dashboard/docs` and verify markdown renders.

### 7.2 Payroll Manager (`persona+payroll-manager@ofroot.dev`)

- Visit `/dashboard/payroll`:
   - Lifecycle widgets show counts and progress bars.
   - Roster card lists segments (New hires, On leave, Contractors).
   - Approvals table / Empty states show correctly when no data.
- Trigger mock actions (e.g., approve/dismiss buttons) and ensure toast/snackbar feedback appears (client-side state only for now).

### 7.3 HR Manager (`persona+hr-manager@ofroot.dev`)

- HR-specific quick actions populate in Super Tools.
- Access `/dashboard/crm/leads` and `/dashboard/crm/contacts`; verify they load without authorization errors.
- Check `/dashboard/subscribers` for tabular data.

### 7.4 Employee persona

- Validate limited navigation: should see only payroll summary tiles relevant to employees.
- Verify that restricted routes (e.g., Docs) redirect or show forbidden messages.

### 7.5 Blog editor (`dimitri.mcdaniel@gmail.com` or `persona+manager@ofroot.dev` with blog addon)

- `/dashboard/blog`: confirm post list renders, and “Create post” button opens the editor.
- Smoke-test AI generation flow if API key present; otherwise confirm validation errors surface cleanly.

### 7.6 Leads & Tenants (admin role)

- `/dashboard/tenants`: table paginates and search works.
- `/dashboard/leads`: ensure new lead modal submits to `/api/leads` (requires API running).

Document any failures in Linear; attach screenshots plus API responses when available.

---

## 8. Resetting Between Test Runs

- **Drop persona tokens**: `php artisan sanctum:prune-expired --hours=0`
- **Clear caches** (rarely needed): `php artisan cache:clear && php artisan config:clear`
- **Frontend cache reset**: delete `.next/` or run `npm run clean` if added.

---

## 9. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Could not open input file: artisan` | Ensure you run commands from `ofroot-api` root or pass absolute path (`php /path/to/artisan ...`). |
| Login fails after reseed | Confirm `DEV_SEED_PASSWORD` matches in both `.env` files and rerun `php artisan migrate:fresh --seed`. |
| Impersonate dropdown missing | Check `ADMIN_EMAILS` includes your login email and your account has `has_blog_addon` true (UserSeeder handles this for Dimitri). |
| 403 on `/api/admin/*` | You’re not using a token for an email in `ADMIN_EMAILS`. Impersonate as admin or re-login as Dimitri. |
| Frontend hitting wrong API | Re-check `NEXT_PUBLIC_API_BASE_URL`; you may need to restart `npm run dev` after editing `.env.local`. |

---

## 10. Automation Prospects

- Add a Pest smoke suite that runs `php artisan migrate:fresh --seed` and hits `/api/admin/impersonate` for each persona to catch seed regressions.
- Consider a Playwright script mirroring Section 7 so QA can replay the checklist automatically.

---

By following this playbook you can go from a blank database to validating every major persona-driven workflow (admin, HR, payroll, employee, blog editor) in under 10 minutes.
