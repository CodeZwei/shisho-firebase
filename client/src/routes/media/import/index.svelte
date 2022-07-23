<script lang="ts">
	import { auth } from '$lib/firebase/client';
	import { enhance } from '$lib/form';
	import { onMount } from 'svelte';

	let count = 0;

	onMount(async () => {
		const authToken = await auth.currentUser?.getIdToken();

		const headers: HeadersInit = { 'Content-Type': 'application/json' };

		if (authToken) {
			headers['firebase-auth-token'] = authToken;
		}

		try {
			const response = await fetch('/media/import/count', {
				method: 'GET',
				headers,
			});
			console.log(response);
			const body = await response.json();
			console.log(body);

			count = body.count;
		} catch (error) {
			console.error(`Error in load function for /: ${error}`);
		}
	});
</script>

<svelte:head>
	<title>Media Bulk Import</title>
	<meta name="description" content="Bulk Importer for Media Page URLs" />
</svelte:head>

<div class="bulk-import">
	<h1>Media Bulk Import</h1>

	<h3>Count: {count}</h3>

	<form
		class="import"
		action="/media/import"
		method="post"
		use:enhance={{
			result: async ({ form }) => {
				form.reset();
			},
		}}
	>
		<textarea
			name="text"
			aria-label="Bulk add Media URLs"
			placeholder="Add media urls (with notes in parens), separated with a new line"
		/>
		<button type="submit"> Submit </button>
	</form>
</div>

<style>
	.bulk-import {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}

	.import {
		margin: 0 0 0.5rem 0;
	}

	textarea {
		border: 1px solid transparent;
		width: 100%;
		min-height: 600px;
	}
</style>
