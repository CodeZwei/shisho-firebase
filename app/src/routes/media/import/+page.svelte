<script lang="ts">
	let text = $state('');
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;

		const items = text
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.startsWith('http'))
			.map((line) => {
				const [pageUrl, ...rest] = line.split(' ');
				return { pageUrl, notes: rest.join(' ') };
			});

		if (items.length > 0) {
			await fetch('/api/media', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items }),
			});
			text = '';
		}

		submitting = false;
	}
</script>

<svelte:head>
	<title>Media Bulk Import</title>
	<meta name="description" content="Bulk Importer for Media Page URLs" />
</svelte:head>

<div class="bulk-import">
	<h1>Media Bulk Import</h1>

	<form class="import" onsubmit={handleSubmit}>
		<textarea
			bind:value={text}
			aria-label="Bulk add Media URLs"
			placeholder="Add media urls (with notes after a space), separated by a new line"
		></textarea>
		<button type="submit" disabled={submitting}>Submit</button>
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
