import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfigExport} */
export default defineConfig(() => {
	// const env = loadEnv(mode, process.cwd(), '');
	// See https://firebase.google.com/docs/admin/setup#initialize-sdk for getting these creds
	process.env[
		'GOOGLE_APPLICATION_CREDENTIALS'
	] = `${process.cwd()}/shisho-app-firebase-adminsdk-1ltb7-fbe973716c.json`;

	return {
		plugins: [sveltekit()],
	
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	};
});