# Deploying to Vercel

## Quick Start

### Option 1: Import from GitHub (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `pnpm vercel-build`
   - **Output Directory**: `apps/react-demo/dist`
   - **Install Command**: `pnpm install --frozen-lockfile`
5. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy (from repository root)
vercel

# Deploy to production
vercel --prod
```

## Build Configuration

The project is configured with:

- **`vercel.json`** - Vercel project configuration
- **`vercel-build` script** - Builds all packages + demo
- **`.vercelignore`** - Files to exclude from deployment

## Project Settings

When importing to Vercel, use these settings:

### Build & Development Settings

```
Framework Preset: Other
Root Directory: ./
Build Command: pnpm vercel-build
Output Directory: apps/react-demo/dist
Install Command: pnpm install --frozen-lockfile
Development Command: pnpm demo:react
```

### Environment Variables

No environment variables needed for this demo.

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` triggers production deployment
- Pull requests get preview deployments

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build fails with "workspace not found"

Make sure you're deploying from the repository root, not a subdirectory.

### TypeScript errors during build

Ensure all packages build successfully locally:
```bash
pnpm build
```

### Missing dependencies

Clear node_modules and reinstall:
```bash
pnpm clean
rm -rf node_modules
pnpm install --frozen-lockfile
```

## What Gets Built

1. Core package (`@qzlcorp/typed-i18n`)
2. React package (`@qzlcorp/typed-i18n-react`)
3. Vue package (`@qzlcorp/typed-i18n-vue`)
4. React demo app (output to `apps/react-demo/dist`)

Only the demo app's `dist` folder is deployed to Vercel.
