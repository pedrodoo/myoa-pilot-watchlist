<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { ChevronLeft, ChevronRight, Search } from '@lucide/svelte';
	import { strings } from '$lib/strings';

	const PLACEHOLDER_POSTER = '/placeholder-poster.svg';

	interface TmdbResult {
		id: number;
		title: string;
		poster_path: string | null;
		posterUrl: string | null;
		release_date: string | null;
		vote_average?: number;
		vote_count?: number;
	}

	let query = $state('');
	let results = $state<TmdbResult[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let searchPage = $state(1);
	let searchTotalPages = $state(1);
	let listEl = $state<HTMLUListElement | null>(null);
	let scrollLeft = $state(0);
	let loadingMore = $state(false);

	async function doSearch() {
		const q = query.trim();
		if (!q) return;
		loading = true;
		error = null;
		results = [];
		try {
			const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}`);
			const data = await res.json();
			if (!res.ok) {
				error = data.error ?? 'Search failed';
				return;
			}
			results = data.results ?? [];
			searchPage = data.page ?? 1;
			searchTotalPages = data.total_pages ?? 1;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Search failed';
		} finally {
			loading = false;
		}
	}

	async function loadMore() {
		const q = query.trim();
		if (!q || loadingMore || searchPage >= searchTotalPages || !listEl) return;
		loadingMore = true;
		try {
			const res = await fetch(
				`/api/tmdb/search?query=${encodeURIComponent(q)}&page=${searchPage + 1}`
			);
			const data = await res.json();
			if (!res.ok) return;
			const next = (data.results ?? []) as TmdbResult[];
			results = [...results, ...next];
			searchPage = data.page ?? searchPage + 1;
			searchTotalPages = data.total_pages ?? searchTotalPages;
			await tick();
			const viewportWidth = listEl.parentElement?.clientWidth ?? 0;
			listEl.scrollTo({ left: listEl.scrollLeft + viewportWidth, behavior: 'smooth' });
		} finally {
			loadingMore = false;
		}
	}

	function scrollLeftByViewport() {
		if (!listEl) return;
		const viewportWidth = listEl.parentElement?.clientWidth ?? 0;
		listEl.scrollTo({ left: listEl.scrollLeft - viewportWidth, behavior: 'smooth' });
	}

	function getYear(releaseDate: string | null): string {
		if (!releaseDate) return '';
		const y = releaseDate.slice(0, 4);
		return /^\d{4}$/.test(y) ? y : '';
	}
</script>

<div class="add-movie-search">
	<form
		class="add-item-form"
		onsubmit={(e) => {
			e.preventDefault();
			doSearch();
		}}
	>
		<label>
			<div class="add-item-row">
				<input
					type="text"
					bind:value={query}
					placeholder={strings.searchMovie}
					disabled={loading}
				/>
				<button type="submit" class="btn-primary" disabled={loading}>
					<Search size={18} style="vertical-align: -0.2em; margin-right: 0.25rem;" />
					{strings.search}
				</button>
			</div>
		</label>
	</form>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if loading}
		<p class="search-status">{strings.searchResults}…</p>
	{:else if results.length === 0 && query.trim() !== '' && !error}
		<p class="search-status">{strings.noResults}</p>
	{:else if results.length > 0}
		<div class="tmdb-results-bleed">
			{#if scrollLeft > 0}
				<button
					type="button"
					class="carousel-chevron carousel-chevron-left"
					aria-label="Scroll left"
					onclick={scrollLeftByViewport}
				>
					<ChevronLeft size={24} />
				</button>
			{/if}
			{#if searchPage < searchTotalPages}
				<button
					type="button"
					class="carousel-chevron carousel-chevron-right"
					aria-label="Load more results"
					onclick={loadMore}
					disabled={loadingMore}
				>
					<ChevronRight size={24} />
				</button>
			{/if}
			<ul
				class="tmdb-results"
				bind:this={listEl}
				onscroll={() => {
					scrollLeft = listEl?.scrollLeft ?? 0;
				}}
			>
				{#each results as r (r.id)}
				<li>
					<form
						method="post"
						action="?/addMovie"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update();
								if (result.type === 'success' || result.type === 'redirect') {
									results = [];
									query = '';
								}
							};
						}}
						class="result-form"
					>
						<input type="hidden" name="title" value={r.title} />
						<input type="hidden" name="tmdbId" value={r.id} />
						{#if r.posterUrl}
							<input type="hidden" name="poster_path" value={r.posterUrl} />
						{/if}
						{#if r.vote_average != null}
							<input type="hidden" name="tmdb_rating" value={r.vote_average} />
						{/if}
						<button type="submit" class="result-button">
							<img
								src={r.posterUrl ?? PLACEHOLDER_POSTER}
								alt=""
								width="100"
								height="150"
								class="result-poster"
							/>
							<span class="result-info">
								<span class="result-title">{r.title}</span>
								{#if getYear(r.release_date)}
									<span class="result-year">{getYear(r.release_date)}</span>
								{/if}
							</span>
						</button>
					</form>
				</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.add-movie-search {
		margin-bottom: var(--space-8);
	}
	.search-status {
		font-size: var(--text-body-muted);
		color: var(--color-text-muted);
		margin: var(--space-3) 0 0;
	}
	.tmdb-results-bleed {
		width: 100vw;
		position: relative;
		left: 50%;
		margin-left: -50vw;
		margin-top: var(--space-4);
		padding-left: var(--space-6);
		padding-right: var(--space-6);
	}
	.carousel-chevron {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		background: var(--color-bg);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}
	.carousel-chevron:hover:not(:disabled) {
		background: var(--color-border);
	}
	.carousel-chevron:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.carousel-chevron-left {
		left: var(--space-2);
	}
	.carousel-chevron-right {
		right: var(--space-2);
	}
	.tmdb-results {
		list-style: none;
		margin: 0;
		padding: 0;
		width: 100%;
		display: grid;
		grid-template-rows: repeat(2, auto);
		grid-auto-flow: column;
		grid-auto-columns: 220px;
		gap: var(--space-2);
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}
	.tmdb-results::-webkit-scrollbar {
		display: none;
	}
	@media (max-width: 480px) {
		.tmdb-results {
			display: flex;
			flex-direction: column;
			overflow: visible;
		}
	}
	.tmdb-results li {
		border-bottom: none;
		padding: 0;
	}
	.result-form {
		margin: 0;
		display: block;
	}
	.result-button {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		text-align: left;
		padding: var(--space-2);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg);
		color: var(--color-text);
		cursor: pointer;
		font-size: var(--text-base);
	}
	.result-button:hover {
		background: var(--color-border);
	}
	.result-poster {
		width: 100px;
		height: 150px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}
	.result-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}
	.result-title {
		font-weight: var(--font-weight-medium);
	}
	.result-year {
		font-size: var(--text-body-muted);
		color: var(--color-text-muted);
	}
</style>
