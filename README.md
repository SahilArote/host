# SP Khamkar & Sons Deployment Guide

This repo has:
- backend: Node.js + Express + MySQL API
- frontend: React + Vite app

This guide deploys:
- backend on Render
- frontend on Vercel

## 1) Prerequisites

Before deploying, make sure you have:
- A GitHub repo with this full project
- A MySQL database reachable from the internet

Important:
- Render does not provide managed MySQL directly in the same way as Postgres.
- Use an external MySQL provider (for example Railway MySQL, PlanetScale, Aiven, or another hosted MySQL).

You will need these DB values:
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

## 2) Deploy Backend on Render

### Create service

1. Open Render dashboard.
2. Click New + -> Web Service.
3. Connect your GitHub repo.
4. Configure:
- Name: spkhamkar-backend (or any name)
- Root Directory: backend
- Environment: Node
- Build Command: npm install
- Start Command: npm start

### Add environment variables in Render

Set these in Render -> Environment:
- NODE_ENV=production
- PORT=10000
- JWT_SECRET=<strong-random-secret>
- DB_HOST=<your-mysql-host>
- DB_PORT=<your-mysql-port, usually 3306>
- DB_USER=<your-mysql-user>
- DB_PASSWORD=<your-mysql-password>
- DB_NAME=<your-mysql-database-name>

Notes:
- Your code uses process.env.PORT, so Render can inject its own port. Setting PORT explicitly is optional but fine.
- JWT_SECRET is required for login/token verification.

### Run migrations and seed (one time)

After first deploy succeeds:
1. Open the Render service.
2. Open Shell.
3. Run:

```bash
npm run migrate
npm run seed
```

Or run both:

```bash
npm run setup
```

### Verify backend

Your backend URL will look like:
- https://your-backend-name.onrender.com

Quick test in browser:
- https://your-backend-name.onrender.com/api/auth/login (POST endpoint, so test using Postman/Insomnia)

Seeded users:
- admin / admin
- sales1 / sales
- sales2 / sales
- factory / factory

## 3) Deploy Frontend on Vercel

### Create project

1. Open Vercel dashboard.
2. Click Add New -> Project.
3. Import the same GitHub repo.
4. Configure:
- Framework Preset: Vite
- Root Directory: frontend
- Build Command: npm run build
- Output Directory: dist

### Keep /api working in production

Your frontend currently calls /api directly.
In local dev, Vite proxy handles this. In production on Vercel, add a rewrite so /api goes to Render backend.

Create file frontend/vercel.json with:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-name.onrender.com/api/$1"
    }
  ]
}
```

Commit and push this file before (or after) first Vercel deploy.

### Redeploy frontend

After adding rewrite, redeploy in Vercel.

## 4) CORS and security notes

Current backend uses open CORS:

```js
app.use(cors());
```

This works, but in production you should restrict origin to your Vercel domain.
Example:

```js
app.use(cors({ origin: 'https://your-frontend.vercel.app' }));
```

Also:
- Use a long random JWT_SECRET.
- Do not commit real DB credentials.

## 5) Common issues

### Frontend loads but API fails

Cause:
- Missing frontend/vercel.json rewrite
- Wrong backend URL in rewrite
- Backend asleep/cold start on free Render tier

Fix:
- Confirm rewrite file is deployed
- Confirm Render backend URL
- Wait for Render cold start and retry

### Backend deploys but DB errors occur

Cause:
- Wrong DB env vars
- DB firewall/network not allowing Render IPs
- Wrong DB_NAME

Fix:
- Recheck all DB vars
- Allow external connections in DB provider
- Run npm run migrate again from Render shell

## 6) Recommended deployment order

1. Deploy backend on Render
2. Run migrate + seed on backend
3. Add frontend rewrite (frontend/vercel.json)
4. Deploy frontend on Vercel
5. Login with seeded users and verify flows

---

If you want, next I can also generate:
- a Render Blueprint file (render.yaml) for one-click backend setup
- frontend/vercel.json directly in this repo so deployment is fully ready
