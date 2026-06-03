<script lang="ts">
	import { untrack } from 'svelte';
	import type { PageData } from './$types';
	import type { Media } from '../_types';
	import { fetchWithAuth } from '$lib/fetchWithAuth';

	let { data }: { data: PageData } = $props();
	let mediaList: Media[] = $state(untrack(() => data.mediaList));

	async function addMedia(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const input = form.elements.namedItem('text') as HTMLInputElement;
		const pageUrl = input.value.trim();
		if (!pageUrl) return;

		const res = await fetchWithAuth('/api/media', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ items: [{ pageUrl }] }),
		});
		if (res.ok) {
			form.reset();
			const listRes = await fetchWithAuth('/api/media');
			if (listRes.ok) mediaList = await listRes.json();
		}
	}

	async function deleteMedia(id: string) {
		const item = mediaList.find((m) => m.id === id);
		if (!item) return;
		item.pending_delete = true;

		const res = await fetchWithAuth(`/api/media/${id}`, { method: 'DELETE' });
		if (res.ok) {
			mediaList = mediaList.filter((m) => m.id !== id);
		} else {
			item.pending_delete = false;
		}
	}
</script>

<svelte:head>
	<title>Media List</title>
	<meta name="description" content="List of Media" />
</svelte:head>

<div class="media-list">
	<h1>Media List</h1>

	<form class="new" onsubmit={addMedia}>
		<input name="text" aria-label="Add Media Page URL" placeholder="+ tap to record a page URL" />
	</form>

	{#each mediaList as media (media.id)}
		<div class="media">
			<span class="text">{media.pageUrl}</span>
			<button
				class="delete"
				aria-label="Delete media"
				disabled={media.pending_delete}
				onclick={() => deleteMedia(media.id)}
			></button>
		</div>
	{/each}
</div>

<style>
	.media-list {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}

	.new {
		margin: 0 0 0.5rem 0;
	}

	input {
		border: 1px solid transparent;
	}

	input:focus-visible {
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #ff3e00 !important;
		outline: none;
	}

	.text {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
	}

	.new input {
		font-size: 28px;
		width: 100%;
		padding: 0.5em 1em 0.3em 1em;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		text-align: center;
	}

	.media {
		display: grid;
		grid-template-columns: 1fr 2rem;
		grid-gap: 0.5rem;
		align-items: center;
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transition: filter 0.2s, transform 0.2s;
	}

	.media button {
		width: 2em;
		height: 2em;
		border: none;
		background-color: transparent;
		background-position: 50% 50%;
		background-repeat: no-repeat;
	}

	.delete {
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5 5V22H19.5V5H4.5Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M10 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 5H22' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 5L9.6445 2H14.3885L16 5H8Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
		opacity: 0.2;
	}

	.delete:hover,
	.delete:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>
