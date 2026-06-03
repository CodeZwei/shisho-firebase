<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { fetchWithAuth } from '$lib/fetchWithAuth';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let title = $state(untrack(() => data.media.title));
	let pageUrl = $state(untrack(() => data.media.pageUrl));
	let imageUrl = $state(untrack(() => data.media.imageUrl));
	let notes = $state(untrack(() => data.media.notes));
	let rating = $state(untrack(() => data.media.rating));

	let tagsCopyright = $state(untrack(() => data.media.tags_copyright.join(', ')));
	let tagsCharacter = $state(untrack(() => data.media.tags_character.join(', ')));
	let tagsArtist = $state(untrack(() => data.media.tags_artist.join(', ')));
	let tagsGeneral = $state(untrack(() => data.media.tags_general.join(', ')));
	let tagsMeta = $state(untrack(() => data.media.tags_meta.join(', ')));

	type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
	let saveStatus: SaveStatus = $state('idle');
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

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
				title,
				pageUrl,
				imageUrl,
				notes,
				rating,
				tags_copyright: parseTags(tagsCopyright),
				tags_character: parseTags(tagsCharacter),
				tags_artist: parseTags(tagsArtist),
				tags_general: parseTags(tagsGeneral),
				tags_meta: parseTags(tagsMeta),
			}),
		});

		saveStatus = res.ok ? 'saved' : 'error';
		resetTimer = setTimeout(() => (saveStatus = 'idle'), 2000);
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
</script>

<svelte:head>
	<title>{title || 'Media Detail'}</title>
</svelte:head>

<div class="detail">
	<a class="back" href="/media/list">← Back to list</a>

	<div class="preview">
		{#if imageUrl}
			<img src={imageUrl} alt={title || 'preview'} />
		{:else}
			<div class="img-placeholder"></div>
		{/if}
	</div>

	<div class="fields">
		<label>
			<span>Image URL</span>
			<input type="url" bind:value={imageUrl} placeholder="https://…" />
		</label>

		<label>
			<span>Title</span>
			<input type="text" bind:value={title} placeholder="Title" />
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
			<span>Tags — Copyright</span>
			<input type="text" bind:value={tagsCopyright} placeholder="marvel, dc" />
		</label>
		<label>
			<span>Tags — Character</span>
			<input type="text" bind:value={tagsCharacter} placeholder="spider-man, batman" />
		</label>
		<label>
			<span>Tags — Artist</span>
			<input type="text" bind:value={tagsArtist} placeholder="artist name" />
		</label>
		<label>
			<span>Tags — General</span>
			<input type="text" bind:value={tagsGeneral} placeholder="action, superhero" />
		</label>
		<label>
			<span>Tags — Meta</span>
			<input type="text" bind:value={tagsMeta} placeholder="hd, scan" />
		</label>
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

	label span {
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
