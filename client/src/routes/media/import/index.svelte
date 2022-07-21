<script lang="ts">
	import { enhance } from '$lib/form';
</script>

<svelte:head>
	<title>Media Bulk Import</title>
	<meta name="description" content="Bulk Importer for Media Page URLs" />
</svelte:head>

<div class="bulk-import">
	<h1>Media Bulk Import</h1>

	<form
		class="import"
		action="/media/import"
		method="post"
		use:enhance={{
			result: async ({ form }) => {
				form.reset();
			}
		}}
	>
		<textarea
			name="inputs"
			aria-label="Bulk add Media URLs"
			placeholder="Add media urls (with notes in parens), separated with a new line"
		/>
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
