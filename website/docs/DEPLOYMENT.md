# Syariah App Website Deployment

## Routes

- `/` landing page
- `/download` official Windows download page
- `/downloads/SyariahAppSetup.exe` official Windows installer
- `/admin/statistics` statistics dashboard
- `/api/track` anonymous visit/download tracking
- `/api/stats` aggregated statistics

## Environment Variables

Set these in Vercel Project Settings, not in the repository:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run `supabase/schema.sql` in Supabase SQL Editor before enabling production traffic.

## Data Stored

The tracking endpoint stores only:

- event type: `visit` or `download`
- page path
- platform
- installer version
- country code from Vercel headers, when available
- timestamp

It does not store email, password, IP address, token, or other personal data.

## Validation And Release Flow

```bash
npm run verify
git status
git add .
git commit -m "feat: update website distribution system"
git push origin main
```

Vercel Git integration deploys automatically after the push to `main`.

## Large Installer Note

`downloads/SyariahAppSetup.exe` is 257,702,767 bytes. If the Vercel plan rejects large static files, keep the public route unchanged and move the binary to a first-party Vercel storage option such as Vercel Blob, then stream or serve it behind `/downloads/SyariahAppSetup.exe`.
