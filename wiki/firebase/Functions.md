# Firebase Functions

## Decision: Not using Firebase Functions

The backend API is implemented as SvelteKit `+server.ts` route handlers deployed on Vercel, not as Firebase Functions. Both approaches could work; Vercel was chosen to keep the frontend and API in a single deployment and avoid managing a second deployment pipeline.

Firebase Functions would be worth revisiting if either of these needs arise:
- **Firestore triggers** — running code automatically when a document is written (e.g. processing on import)
- **Scheduled jobs** — a nightly sweep to permanently delete entries marked `pending_delete: true` and clean up associated Storage files

For now those use cases don't exist, so the simpler single-deployment approach is preferred.
