# Publishing Guide

This document explains how to publish packages to npm.

## Prerequisites

1. **NPM Token**: Ensure `NPM_TOKEN` secret is configured in GitHub repository settings
2. **Permissions**: You need write access to the repository and npm organization

## Version Management

Each package has independent versioning. The version is read from each package's `package.json`.

### Semantic Versioning

- **Patch** (1.0.0 → 1.0.1): Bug fixes, no API changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

## Publishing Workflow

### Step 1: Update Version

Use the npm scripts to bump the version for the package you want to publish:

```bash
# For core package
pnpm version:core patch   # or minor, major

# For React package
pnpm version:react minor  # or patch, major

# For Vue package
pnpm version:vue major    # or patch, minor
```

This will:
- Update the `version` field in `package.json`
- Create a git tag (you can delete this if not needed)

### Step 2: Commit and Push

```bash
git add .
git commit -m "chore: bump core to 1.0.1"
git push
```

### Step 3: Trigger Publish via GitHub Actions

1. Go to GitHub repository
2. Navigate to **Actions** tab
3. Select **Publish** workflow from the left sidebar
4. Click **Run workflow** button
5. Select which package to publish:
   - `core` - Publish @qzlcorp/typed-i18n only
   - `react` - Publish @qzlcorp/typed-i18n-react only
   - `vue` - Publish @qzlcorp/typed-i18n-vue only
   - `all` - Publish all three packages

The workflow will:
- ✅ Run all tests
- ✅ Build all packages
- ✅ Publish selected package(s) to npm

## Common Scenarios

### Scenario 1: Bug Fix in Core Only

```bash
# 1. Bump version
pnpm version:core patch  # 1.0.0 → 1.0.1

# 2. Commit and push
git add packages/core/package.json
git commit -m "fix: resolve translation caching issue"
git push

# 3. Trigger GitHub Actions
# Select "core" in the workflow dispatch
```

**Note**: React and Vue don't need version updates because they use `^1.0.0` in peerDependencies, which accepts any 1.x.x version.

### Scenario 2: New Feature in React Only

```bash
# 1. Bump version
pnpm version:react minor  # 1.0.0 → 1.1.0

# 2. Commit and push
git add packages/react/package.json
git commit -m "feat: add useTranslationWithFallback hook"
git push

# 3. Trigger GitHub Actions
# Select "react" in the workflow dispatch
```

### Scenario 3: Breaking Change in Core

When core has breaking changes, you must update all dependent packages:

```bash
# 1. Update core version
pnpm version:core major  # 1.0.0 → 2.0.0

# 2. Update peerDependencies in React and Vue
# Edit packages/react/package.json:
#   "peerDependencies": {
#     "@qzlcorp/typed-i18n": "^2.0.0"  // Change from ^1.0.0
#   }
# Edit packages/vue/package.json:
#   "peerDependencies": {
#     "@qzlcorp/typed-i18n": "^2.0.0"  // Change from ^1.0.0
#   }

# 3. Update React and Vue code if needed to work with new core API

# 4. Bump React and Vue versions
pnpm version:react major  # 1.0.0 → 2.0.0
pnpm version:vue major    # 1.0.0 → 2.0.0

# 5. Commit and push all changes
git add .
git commit -m "feat!: breaking API change in core

BREAKING CHANGE: defineModule now requires explicit type parameter"
git push

# 6. Trigger GitHub Actions
# Select "all" to publish all three packages
```

## Version Dependencies

### Current Setup

**packages/core/package.json**:
```json
{
  "version": "1.0.0"
}
```

**packages/react/package.json**:
```json
{
  "version": "1.0.0",
  "peerDependencies": {
    "@qzlcorp/typed-i18n": "^1.0.0"
  },
  "devDependencies": {
    "@qzlcorp/typed-i18n": "workspace:*"
  }
}
```

**packages/vue/package.json**:
```json
{
  "version": "1.0.0",
  "peerDependencies": {
    "@qzlcorp/typed-i18n": "^1.0.0",
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "@qzlcorp/typed-i18n": "workspace:*"
  }
}
```

### Explanation

- **peerDependencies**: `"^1.0.0"` means "compatible with any 1.x.x version"
  - Users installing the package must have core version 1.x.x
  - Automatically includes patch (1.0.x) and minor (1.x.0) updates
  
- **devDependencies**: `"workspace:*"` means "use the local workspace version"
  - Only used during development and testing
  - Ensures tests run against the current local code

## Important Notes

1. **Cannot republish same version**: npm will reject if you try to publish a version that already exists. Always increment the version first.

2. **Version must match**: The version you publish is read from `package.json`. Update it before triggering the workflow.

3. **Tests must pass**: The workflow will fail if any tests don't pass. Fix tests before publishing.

4. **Independent packages**: Each package can be published independently. You don't need to publish all three every time.

5. **Semantic versioning matters**: Follow semver rules to avoid breaking user applications:
   - Patch: backwards compatible bug fixes
   - Minor: backwards compatible new features
   - Major: breaking changes

## Troubleshooting

### Publish failed with "version already exists"

You forgot to bump the version. Run the appropriate `pnpm version:*` command.

### Tests failing in CI

Run `pnpm test` locally first. Fix any failing tests before pushing.

### Wrong package published

No undo button! You'll need to publish a new patch version to fix issues.

### Forgot to update peerDependencies after core major version

React/Vue users will get the wrong core version. Publish a new major version with corrected peerDependencies.
