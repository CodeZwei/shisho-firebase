# Playwright E2E Testing

We use Playwright on Chromium for end-to-end testing of the webapp.

## Status

Tests have not been written yet. CI integration is not set up. The `app/e2e/` directory exists as a placeholder.

## CI Plan (GitHub Actions)

When tests are written, the CI job should:

1. Cache `~/.cache/ms-playwright` across runs to avoid re-downloading Chromium on every job.
2. Run `npx playwright install --with-deps chromium` (fast on cache hit, ~1-2 min cold).
3. Target the **Vercel preview deployment URL** for the PR rather than spinning up the full stack locally — this avoids needing Firebase credentials in CI and tests against a real deployment.

Vercel generates a unique preview URL for each PR automatically. See [Vercel.md](Vercel.md) for deployment details.
