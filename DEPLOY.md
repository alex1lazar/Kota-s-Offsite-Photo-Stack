# Deploy to GitHub + Netlify

## Step 1: Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in.
2. Click **New repository** (or the **+** menu → New repository).
3. Set:
   - **Repository name:** e.g. `photo-gallery` or `offsite-photos`
   - **Visibility:** Public or Private
   - Leave "Add a README" **unchecked** (you already have one).
4. Click **Create repository**.

---

## Step 2: Push your local repo to GitHub

In the project folder, run (replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name):

```bash
cd "/Users/lazar/Documents/Projects/offsite photos/photo-gallery"

# Add GitHub as remote (use the URL from your new repo’s “Quick setup” page)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push the main branch
git push -u origin main
```

If you use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

---

## Step 3: Deploy on Netlify

1. Go to [netlify.com](https://www.netlify.com) and sign in (or sign up with GitHub).
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and authorize Netlify if asked.
4. Select the repository you just pushed (e.g. `photo-gallery`).
5. Netlify will read `netlify.toml` in the repo. You should see:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy site**.

After the build finishes, Netlify will show a live URL (e.g. `https://random-name-123.netlify.app`). You can change it in **Site settings** → **Domain management** → **Edit site name**.

---

## Step 4 (optional): Custom domain

In Netlify: **Site settings** → **Domain management** → **Add custom domain**, then follow the DNS instructions.

---

## Updating the site

After you change code:

```bash
git add -A
git commit -m "Your message"
git push
```

Netlify will automatically build and deploy when you push to the connected branch (usually `main`).
