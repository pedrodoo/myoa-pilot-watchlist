<script lang="ts">
	import { enhance } from '$app/forms';
	import { Search } from '@lucide/svelte';
	import { strings } from '$lib/strings';

	const PLACEHOLDER_POSTER = '/placeholder-poster.svg';

	interface TmdbResult {
		id: number;
		title: string;
		poster_path: string | null;
		posterUrl: string | null;
		release_date: string | null;
	}

	let query = $state('');
	let results = $state<TmdbResult[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

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
		} catch (e) {
			error = e instanceof Error ? e.message : 'Search failed';
		} finally {
			loading = false;
		}
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
		<ul class="tmdb-results">
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
						<button type="submit" class="result-button">
							<img
								src={r.posterUrl ?? PLACEHOLDER_POSTER}
								alt=""
								width="50"
								height="75"
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
	.tmdb-results {
		list-style: none;
		margin: var(--space-4) 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
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
		cursor: pointer;
		font-size: var(--text-base);
	}
	.result-button:hover {
		background: var(--color-border);
	}
	.result-poster {
		width: 50px;
		height: 75px;
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
