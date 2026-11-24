# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 5: Build for production (generates the dist/ folder with all assets).
npm run build

# Step 6: Preview the production build locally.
npm run preview
```

### Deploying to Hostinger / Any Static Host

After running `npm run build`, upload the entire contents of the **`dist/`** folder to your hosting provider's `public_html` directory. The build includes:

- ✅ Minified JS/CSS bundles
- ✅ PWA service worker & manifest
- ✅ All static assets (images, fonts, videos)
- ✅ Pre-configured `.htaccess` for SPA routing
- ✅ Offline fallback page

### Automatic GitHub → Hostinger updates

The existing `.github/workflows/deploy-hostinger.yml` runs on every push to `main`, or manually from **Actions → Deploy to Hostinger → Run workflow**. It installs locked dependencies, builds the website, and uploads only `dist/` using encrypted FTPS. Hosting must support FTPS; do not downgrade to unencrypted FTP.

1. Back up your current Hostinger website before the first deployment.
2. In the GitHub repository that will deploy the site, open **Settings → Secrets and variables → Actions → New repository secret**. Add:
   - `FTP_SERVER`: the FTP hostname or IP supplied by Hostinger (without a URL scheme).
   - `FTP_USERNAME`: the hosting FTP account username.
   - `FTP_PASSWORD`: the hosting FTP account password.
   - `VITE_SUPABASE_URL`: the existing public backend endpoint used by this project.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: the existing public backend publishable key. Never use a service-role or other private server key.
3. Confirm the folder shown when logging in with that FTP account. The default upload destination is `./public_html/`. If the account already opens inside `public_html`, add an Actions **variable** named `FTP_SERVER_DIR` with value `./`. For other account roots, use the relative path to this website's folder, always ending with `/`.
4. Open **Actions → Deploy to Hostinger → Run workflow** and select `main`. Missing secrets produce an explicit setup error without revealing their values.
5. After a successful run, open the website and refresh `/admissions` and `/contact`. The build includes `public/.htaccess` to support direct page visits. Also verify an admission submission and any sign-in flow; hosting changes do not move Lovable Cloud, and authentication redirect settings may need the new domain.

Future pushes to `main` deploy automatically. A failed build will not start an upload. Uploads are serialized and do not wipe the entire hosting directory, but previously deployed website files can be replaced or removed during synchronization: use an account scoped to this website only. Deployment duration depends on the build and upload size.

If using the repository mirror, configure secrets in whichever repository runs this deployment, and avoid enabling two upload workflows against the same hosting folder. Lovable publication and Hostinger deployment are separate operations.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
