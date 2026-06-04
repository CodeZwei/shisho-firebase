<script lang="ts">
	import { untrack } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { fetchWithAuth } from '$lib/fetchWithAuth';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let title = $state(untrack(() => data.media.user.title ?? ''));
	let pageUrl = $state(untrack(() => data.media.pageUrl));
	let notes = $state(untrack(() => data.media.user.notes));
	let rating = $state(untrack(() => data.media.user.rating));
	let tagsUser = $state(untrack(() => data.media.user.tags.join(', ')));

	type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
	let saveStatus: SaveStatus = $state('idle');
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

	type ImportStatus = 'idle' | 'importing' | 'success' | 'error';
	let importStatus: ImportStatus = $state('idle');
	let importError: string = $state('');

	function parseTags(raw: string): string[] {
		return raw
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
	}

	async function save() {
		saveStatus = 'saving';
		if (resetTimer) clearTimeout(resetTimer);

		const res = await fetchWithAuth(`/api/media/${data.media.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				'user.title': title || null,
				pageUrl,
				'user.notes': notes,
				'user.rating': rating,
				'user.tags': parseTags(tagsUser),
			}),
		});

		saveStatus = res.ok ? 'saved' : 'error';
		resetTimer = setTimeout(() => (saveStatus = 'idle'), 2000);
	}

	async function reimport() {
		importStatus = 'importing';
		importError = '';

		const res = await fetchWithAuth(`/api/media/${data.media.id}/import`, { method: 'POST' });

		if (res.ok) {
			importStatus = 'success';
			setTimeout(() => {
				importStatus = 'idle';
				invalidateAll();
			}, 1500);
		} else {
			const body = await res.json().catch(() => ({}));
			importError = (body as { error?: string }).error ?? 'Import failed';
			importStatus = 'error';
			setTimeout(() => (importStatus = 'idle'), 3000);
		}
	}

	async function deleteItem() {
		await fetchWithAuth(`/api/media/${data.media.id}`, { method: 'DELETE' });
		goto('/media/list');
	}

	function setRating(n: number) {
		rating = rating === n ? 0 : n;
	}

	const saveStatusLabel: Record<SaveStatus, string> = {
		idle: '',
		saving: 'Saving…',
		saved: 'Saved',
		error: 'Error saving',
	};

	const importStatusLabel: Record<ImportStatus, string> = {
		idle: 'Reimport',
		importing: 'Importing…',
		success: 'Imported',
		error: 'Failed',
	};

	function formatDate(ms: number | null): string {
		if (!ms) return 'Never';
		return new Date(ms).toLocaleString();
	}
</script>

<svelte:head>
	<title>{title || data.media.external.title || 'Media Detail'}</title>
</svelte:head>

<div class="detail">
	<a class="back" href="/media/list">← Back to list</a>

	<div class="preview">
		{#if data.media.external.imageUrl}
			<img src={data.media.external.imageUrl} alt={title || data.media.external.title || 'preview'} />
		{:else}
			<div class="img-placeholder"></div>
		{/if}
	</div>

	<div class="fields">
		<label>
			<span>Title</span>
			<input type="text" bind:value={title} placeholder="Title override (optional)" />
		</label>

		<label class="url-label">
			<span>Page URL</span>
			<div class="url-row">
				<input type="url" bind:value={pageUrl} placeholder="https://…" />
				<a href={pageUrl} target="_blank" rel="noopener noreferrer" aria-label="Open page" class="open-link">↗</a>
			</div>
		</label>

		<label>
			<span>Notes</span>
			<textarea bind:value={notes} rows="4" placeholder="Notes…"></textarea>
		</label>

		<div class="rating-field">
			<span>Rating</span>
			<div class="rating">
				{#each [1, 2, 3, 4, 5] as n}
					<button
						type="button"
						class={n <= Math.round(rating) ? 'star filled' : 'star'}
						aria-label="Set rating to {n}"
						onclick={() => setRating(n)}
					></button>
				{/each}
			</div>
		</div>

		<label>
			<span>Tags — My Tags</span>
			<input type="text" bind:value={tagsUser} placeholder="custom, tags" />
		</label>

		{#if data.media.external.tags_copyright.length || data.media.external.tags_character.length || data.media.external.tags_artist.length || data.media.external.tags_general.length || data.media.external.tags_meta.length}
			<div class="scraped-tags">
				<span class="section-label">Scraped Tags</span>
				{#if data.media.external.tags_copyright.length}
					<div class="tag-row"><span>Copyright</span><p>{data.media.external.tags_copyright.join(', ')}</p></div>
				{/if}
				{#if data.media.external.tags_character.length}
					<div class="tag-row"><span>Character</span><p>{data.media.external.tags_character.join(', ')}</p></div>
				{/if}
				{#if data.media.external.tags_artist.length}
					<div class="tag-row"><span>Artist</span><p>{data.media.external.tags_artist.join(', ')}</p></div>
				{/if}
				{#if data.media.external.tags_general.length}
					<div class="tag-row"><span>General</span><p>{data.media.external.tags_general.join(', ')}</p></div>
				{/if}
				{#if data.media.external.tags_meta.length}
					<div class="tag-row"><span>Meta</span><p>{data.media.external.tags_meta.join(', ')}</p></div>
				{/if}
			</div>
		{/if}

		<div class="import-section">
			<span class="section-label">Import</span>
			<div class="import-meta">
				<span class="import-status" class:status-success={data.media.import.status === 'success'} class:status-failed={data.media.import.status === 'failed'}>
					{data.media.import.status}
				</span>
				<span class="import-date">Last run: {formatDate(data.media.import.last_imported_at)}</span>
			</div>
			{#if data.media.import.last_error}
				<p class="import-error">{data.media.import.last_error}</p>
			{/if}
			{#if importStatus === 'error'}
				<p class="import-error">{importError}</p>
			{/if}
			<button
				type="button"
				class="btn-import"
				class:success={importStatus === 'success'}
				class:error={importStatus === 'error'}
				onclick={reimport}
				disabled={importStatus === 'importing'}
			>
				{importStatusLabel[importStatus]}
			</button>
		</div>
	</div>

	<div class="actions">
		<div class="save-group">
			<button type="button" class="btn-save" onclick={save} disabled={saveStatus === 'saving'}>
				Save
			</button>
			<span class="save-status" class:error={saveStatus === 'error'}>
				{saveStatusLabel[saveStatus]}
			</span>
		</div>
		<button type="button" class="btn-delete" onclick={deleteItem}>Delete</button>
	</div>
</div>

<style>
	.detail {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 4rem auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.back {
		font-size: 0.85rem;
		color: var(--text-color);
	}

	.preview {
		width: 100%;
		height: 16rem;
		border-radius: 8px;
		overflow: hidden;
		background-color: var(--secondary-color);
	}

	.preview img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}

	.img-placeholder {
		width: 100%;
		height: 100%;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	label span,
	.section-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--heading-color);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input,
	textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--primary-color);
		border-radius: 6px;
		background: white;
		font-size: 0.9rem;
		color: var(--text-color);
		width: 100%;
		box-sizing: border-box;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--accent-color);
	}

	textarea {
		resize: vertical;
	}

	.url-label .url-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.url-row input {
		flex: 1;
	}

	.open-link {
		font-size: 1.1rem;
		color: var(--accent-color);
		text-decoration: none;
		padding: 0.4rem;
		flex-shrink: 0;
	}

	.rating-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.rating-field > span {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--heading-color);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.rating {
		display: flex;
		gap: 4px;
	}

	.star {
		width: 2rem;
		height: 2rem;
		border: none;
		background: transparent;
		cursor: pointer;
		padding: 0;
		font-size: 1.5rem;
		line-height: 1;
	}

	.star::before {
		content: '☆';
		color: #ccc;
	}

	.star.filled::before {
		content: '★';
		color: #f5a623;
	}

	.star:hover::before {
		color: #f5a623;
	}

	.scraped-tags {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.75rem;
		background: var(--secondary-color);
		border-radius: 6px;
	}

	.scraped-tags .section-label {
		margin-bottom: 0.25rem;
	}

	.tag-row {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.tag-row span {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--heading-color);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tag-row p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-color);
		word-break: break-word;
	}

	.import-section {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.75rem;
		background: var(--secondary-color);
		border-radius: 6px;
	}

	.import-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.import-status {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #888;
	}

	.import-status.status-success {
		color: #2e7d32;
	}

	.import-status.status-failed {
		color: var(--accent-color);
	}

	.import-date {
		font-size: 0.75rem;
		color: #888;
	}

	.import-error {
		margin: 0;
		font-size: 0.8rem;
		color: var(--accent-color);
	}

	.btn-import {
		align-self: flex-start;
		padding: 0.4rem 1rem;
		background: transparent;
		color: var(--heading-color);
		border: 1px solid var(--primary-color);
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.btn-import:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.btn-import.success {
		color: #2e7d32;
		border-color: #2e7d32;
	}

	.btn-import.error {
		color: var(--accent-color);
		border-color: var(--accent-color);
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.5rem;
	}

	.save-group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.btn-save {
		padding: 0.5rem 1.5rem;
		background-color: var(--accent-color);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.95rem;
		cursor: pointer;
	}

	.btn-save:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.save-status {
		font-size: 0.85rem;
		color: var(--text-color);
	}

	.save-status.error {
		color: var(--accent-color);
	}

	.btn-delete {
		padding: 0.5rem 1rem;
		background: transparent;
		color: #999;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.btn-delete:hover {
		color: var(--accent-color);
		border-color: var(--accent-color);
	}
</style>
