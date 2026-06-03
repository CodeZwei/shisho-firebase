<script lang="ts">
	import { fetchWithAuth } from '$lib/fetchWithAuth';

	let text = $state('');
	let submitting = $state(false);
	type ImportStatus = 'idle' | 'success' | 'error';
	let importStatus: ImportStatus = $state('idle');
	let importedCount = $state(0);

	let parsedItems = $derived(
		text
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.startsWith('http'))
			.map((line) => {
				const [pageUrl, ...rest] = line.split(' ');
				return { pageUrl, notes: rest.join(' ') };
			})
	);

	$effect(() => {
		if (text && importStatus === 'success') importStatus = 'idle';
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (parsedItems.length === 0) return;

		submitting = true;
		importStatus = 'idle';

		const res = await fetchWithAuth('/api/media', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ items: parsedItems }),
		});

		if (res.ok) {
			importedCount = parsedItems.length;
			importStatus = 'success';
			text = '';
		} else {
			importStatus = 'error';
		}

		submitting = false;
	}

	function buttonLabel(): string {
		if (submitting) return 'Importing…';
		if (parsedItems.length === 0) return 'Import';
		return `Import ${parsedItems.length} URL${parsedItems.length !== 1 ? 's' : ''}`;
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

		{#if text}
			<p class="hint">{parsedItems.length} URL{parsedItems.length !== 1 ? 's' : ''} detected</p>
		{/if}

		<div class="footer">
			<button type="submit" disabled={submitting || parsedItems.length === 0}>
				{buttonLabel()}
			</button>
			{#if importStatus === 'success'}
				<p class="status success">✓ Imported {importedCount} item{importedCount !== 1 ? 's' : ''}</p>
			{:else if importStatus === 'error'}
				<p class="status error">Import failed — check the console and try again</p>
			{/if}
		</div>
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
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	textarea {
		border: 1px solid var(--primary-color);
		border-radius: 6px;
		width: 100%;
		min-height: 600px;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		box-sizing: border-box;
		resize: vertical;
	}

	textarea:focus {
		outline: none;
		border-color: var(--accent-color);
	}

	.hint {
		margin: 0;
		font-size: 0.8rem;
		color: #888;
	}

	.footer {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	button {
		padding: 0.5rem 1.5rem;
		background-color: var(--accent-color);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.95rem;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.status {
		margin: 0;
		font-size: 0.85rem;
	}

	.status.success {
		color: #2a9d5c;
	}

	.status.error {
		color: var(--accent-color);
	}
</style>
