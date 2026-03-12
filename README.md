# Voyage Kundu Ops PWA

Role-based hotel operations PWA with shared backend state for tasks, complaints,
agenda, permissions and audit logs.

## Local development

This workspace includes a local Node.js runtime because the machine did not have
global `node` or `npm`.

Frontend:

```bash
./npmw run dev
```

Backend:

```bash
./node-v20.19.0-darwin-arm64/bin/node server/index.mjs
```

Other commands:

```bash
./npmw run build
./npmw run preview
./npmw run lint
./npmw run test
```

## Production architecture

The app is prepared for a shared infrastructure that works for PC, iPhone,
iPad and Android without using macOS as the host.

- Frontend: Render Static Site
- Backend: Render Web Service
- Database: Render PostgreSQL
- Deploy definition: `render.yaml`

Frontend reads `VITE_API_URL`.
Backend reads `DATABASE_URL` in production.

## Authentication and roles

The application now uses backend-backed login sessions.

- Default login password: `Voyage365!`
- Backend env override: `DEFAULT_LOGIN_PASSWORD`
- Session storage: server-side state

Seed users:

- `gizem.yonetici` -> manager
- `selim.muduryrd` -> deputy
- `ece.sef` -> chief
- `deniz.asistan` -> assistant

Server-side role restrictions:

- `manager`: can manage tasks, complaints, ala carte, agenda and permissions
- `deputy`: can manage tasks, complaints and ala carte
- `chief`: can manage tasks, complaints and ala carte
- `assistant`: can manage complaints only

Recommended first production step:

1. Set `DEFAULT_LOGIN_PASSWORD` in Render to a private strong password.
2. Redeploy the backend.
3. Verify users can sign in with the new password.

## Render deploy

1. Push this project to GitHub.
2. Open Render.
3. Choose `New +`.
4. Choose `Blueprint`.
5. Connect the GitHub repository.
6. Render will detect `render.yaml`.
7. Approve the blueprint.
8. Wait for these services to be created:
   - `voyage-kundu-ops`
   - `voyage-kundu-api`
   - `voyage-kundu-db`

After deploy, the public app URL will be the frontend service URL.

## GitHub upload

If this folder is not yet in git:

```bash
git init
git add .
git commit -m "Initial Voyage Kundu ops platform"
```

Create an empty GitHub repo, then:

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## Important note

The frontend is already connected to the backend API. Shared state now belongs
on the server side, not in local-only browser storage.

## Files

- Frontend app: `src/App.jsx`
- Frontend styles: `src/App.css`
- Backend API: `server/index.mjs`
- Render blueprint: `render.yaml`
- PWA manifest: `public/manifest.webmanifest`
- Service worker: `public/sw.js`
