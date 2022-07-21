# Shisho (for Firebase)

Welcome to the shisho-firebase wiki!

This is a re-implementation of Shisho based on Firebase online technologies instead of an offline Sqlite Database.

## App Components

### Metadata Storage

Media Metadata storage will be stored in [Cloud Firestore](https://firebase.google.com/docs/firestore) as JSON documents.

### Media Storage

Media files themselves may be stored offline in a NAS solution, or in [Firebase Storage](https://firebase.google.com/docs/storage) if the monthly costs are low enough.

### Web App

A [SvelteKit](https://kit.svelte.dev/) web frontend will allow for general querying and manipulation of media metadata. In particular it will have a single and bulk entry creation, and listing of media based on tags and other fields.

This app may be hosted on Github Pages or Firebase Hosting

### CLI

Shisho comes as an executable CLI which can emulate many of the Web App interactions. This will be useful for offline batch processing.

### Chrome Extension

Optionally, shisho will have a new chrome extension (similar to the original project) which will make capturing media easier directly from a browser session.
