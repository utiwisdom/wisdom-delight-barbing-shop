# Setup and deploy guide (Ubuntu on WSL)

Order: **Neon database → test locally → GitHub → Netlify.**

## 1. Put the folder in WSL

```bash
mkdir -p ~/projects
cp -r /mnt/c/Users/<YOU>/Downloads/wisdom-delight-barbing-shop ~/projects/
cd ~/projects/wisdom-delight-barbing-shop
```
(Work inside the Linux filesystem `~/`, not `/mnt/c/`. It is much faster.)

## 2. Create the Neon database

1. Go to https://neon.tech, create a project (name: `wisdom-delight-barbing`).
2. Open **SQL Editor**, paste all of `db/schema.sql`, click **Run**.
3. Dashboard → **Connection string** → copy it (it starts with `postgresql://` and ends with `sslmode=require`).
4. Edit the prices in `schema.sql` first if you want your real prices (or `UPDATE services SET price = ...` later).

## 3. Test locally

```bash
npm install
cp .env.example .env
nano .env                 # paste your Neon DATABASE_URL, save with Ctrl+O, Enter, Ctrl+X
npx netlify dev           # opens http://localhost:8888
```
Make a booking, then check the `appointments` table in Neon. Try booking the same barber and time twice. The second must fail.

## 4. Push to GitHub FIRST

1. On github.com click **New repository**. Name: `wisdom-delight-barbing-shop`. Leave it **empty** (no README, no .gitignore, no licence).
2. Then in WSL:

```bash
cd ~/projects/wisdom-delight-barbing-shop
git init
git branch -M main
git add .
git status                # confirm .env is NOT listed
git commit -m "Initial commit: barbing shop booking app"
git remote add origin https://github.com/utiwisdom/wisdom-delight-barbing-shop.git
git push -u origin main
```

GitHub asks for a username and password. The password must be a **Personal Access Token** (GitHub → Settings → Developer settings → Tokens (classic) → `repo` scope), not your account password.

Later changes:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

## 5. Deploy on Netlify (from GitHub)

1. Netlify → **Add new site → Import an existing project → GitHub** → choose `wisdom-delight-barbing-shop`.
2. Build settings are read from `netlify.toml` (publish `public`, functions `netlify/functions`). Leave the build command empty.
3. **Before deploying**: Site configuration → **Environment variables** → add `DATABASE_URL` = your Neon connection string.
4. Deploy. Every `git push` to `main` redeploys automatically.
5. Optional: Site configuration → Change site name, e.g. `wisdom-delight-barbing`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Services show "Could not load" | `DATABASE_URL` missing in Netlify (or `.env` locally), or `schema.sql` not run |
| `netlify: command not found` | use `npx netlify dev`, or `npm i -g netlify-cli` |
| Push rejected / auth failed | use a Personal Access Token, not your password |
| Slot says "just taken" | working as designed: someone booked it first |
| Env var added after deploy | trigger **Deploys → Trigger deploy** |

## Security notes

- Never commit `.env`. It is in `.gitignore`.
- If the connection string ever leaks, reset the password in Neon and update Netlify.
