---
description: Steps to deploy the AgriPulse-AI application to Vercel
---

// turbo-all
# Vercel Deployment Workflow

1. **Verify Database URL**
   - Ensure `DATABASE_URL` in Vercel project settings is set to the Supabase Transaction Pooler URL (Port 6543).
   - Format: `postgresql://postgres.[ID]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`

2. **Generate Prisma Client**
   - The build script in `package.json` already includes `prisma generate`.
   - Command: `npm run build`

3. **Push Changes to Main**
   - Push all recent fixes to your repository.
   - Command: `git add . && git commit -m "Fix Vercel compatibility and mobile responsiveness" && git push origin main`

4. **Trigger Redeploy on Vercel**
   - Go to the Vercel Dashboard and trigger a redeploy from the latest commit on `main`.
