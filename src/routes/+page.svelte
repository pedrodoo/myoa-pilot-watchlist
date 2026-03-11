<script lang="ts">
	import AddMovieSearch from '$lib/components/AddMovieSearch.svelte';
	import ItemList from '$lib/components/ItemList.svelte';
	import MovieDetailModal from '$lib/components/MovieDetailModal.svelte';
	import { LayoutList, LayoutGrid } from '@lucide/svelte';
	import { strings } from '$lib/strings';
	import type { ViewItem } from '$lib/types';
	import {
		filterAndSort,
		type FilterState,
		type SortBy,
		type SortDir,
		type SortState
	} from '$lib/watchlist-filter';
	import type { PageServerData, ActionData } from './$types';

	const STORAGE_KEY = 'watchlist-view';
	type ViewMode = 'list' | 'grid';

	function getStoredViewMode(): ViewMode {
		if (typeof document === 'undefined') return 'list';
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored === 'grid' ? 'grid' : 'list';
	}

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let detailModalOpen = $state(false);
	let selectedForDetail = $state<ViewItem | null>(null);
	let viewMode = $state<ViewMode>('list');
	let filterState = $state<FilterState>({ statusFilter: 'all' });
	let sortState = $state<SortState>({
		sortBy: 'date',
		sortDir: 'desc'
	});

	$effect(() => {
		if (typeof document === 'undefined') return;
		viewMode = getStoredViewMode();
	});

	$effect(() => {
		if (typeof document === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, viewMode);
	});

	$effect(() => {
		if (!detailModalOpen) selectedForDetail = null;
	});

	const rawItems: ViewItem[] = $derived(
		(data.movies ?? []).map((m) => ({
			id: m.id,
			label: m.title,
			addedAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
			posterUrl: m.posterPath ?? null,
			status: (m.status ?? 'want_to_watch') as ViewItem['status'],
			rating: m.rating ?? undefined,
			tmdbId: m.tmdbId ?? null
		}))
	);

	const items: ViewItem[] = $derived(
		filterAndSort(rawItems, filterState, sortState)
	);

	// #region agent log
	$effect(() => {
		const movies = data.movies ?? [];
		const first = movies[0];
		fetch('http://127.0.0.1:7484/ingest/74056abd-fecd-436c-9573-3f0ff2acc70e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7d08e'},body:JSON.stringify({sessionId:'e7d08e',location:'+page.svelte:effect',message:'page data',data:{moviesLength:movies.length,firstRating:first?.rating},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
	});
	// #endregion
</script>

<AddMovieSearch />
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

<div class="list-toolbar">
	<div class="list-toolbar-filters" role="group" aria-label="Filter and sort">
		<label class="filter-label">
			<span class="filter-label-text">{strings.filterStatus}</span>
			<select
				class="filter-select"
				aria-label={strings.filterStatus}
				bind:value={filterState.statusFilter}
			>
				<option value="all">{strings.filterStatusAll}</option>
				<option value="want_to_watch">{strings.filterStatusWantToWatch}</option>
				<option value="watched">{strings.filterStatusWatched}</option>
			</select>
		</label>
		<label class="filter-label">
			<span class="filter-label-text">{strings.sortBy}</span>
			<select
				class="filter-select sort-select"
				aria-label={strings.sortBy}
				value={`${sortState.sortBy}_${sortState.sortDir}`}
				onchange={(e) => {
					const v = (e.currentTarget as HTMLSelectElement).value;
					const [by, dir] = v.split('_') as [SortBy, SortDir];
					sortState = { ...sortState, sortBy: by, sortDir: dir };
				}}
			>
				<option value="date_desc">{strings.sortNewestFirst}</option>
				<option value="date_asc">{strings.sortOldestFirst}</option>
				<option value="title_asc">{strings.sortTitleAZ}</option>
				<option value="title_desc">{strings.sortTitleZA}</option>
				<option value="rating_desc">{strings.sortRatingHighLow}</option>
				<option value="rating_asc">{strings.sortRatingLowHigh}</option>
				<option value="status_asc">{strings.sortWantToWatchFirst}</option>
				<option value="status_desc">{strings.sortWatchedFirst}</option>
			</select>
		</label>
	</div>
	<div class="list-toolbar-actions" role="group" aria-label="View mode">
		<button
			type="button"
			class="view-toggle"
			class:active={viewMode === 'list'}
			aria-label={strings.listView}
			aria-pressed={viewMode === 'list'}
			onclick={() => (viewMode = 'list')}
		>
			<LayoutList size={18} />
		</button>
		<button
			type="button"
			class="view-toggle"
			class:active={viewMode === 'grid'}
			aria-label={strings.gridView}
			aria-pressed={viewMode === 'grid'}
			onclick={() => (viewMode = 'grid')}
		>
			<LayoutGrid size={18} />
		</button>
	</div>
</div>

<ItemList
		viewMode={viewMode}
		{items}
		deleteAction="?/deleteMovie"
		toggleStatusAction="?/toggleMovieStatus"
		ratingAction="?/setMovieRating"
		itemIdParam="id"
		onPosterClick={(item) => {
			selectedForDetail = item;
			detailModalOpen = true;
		}}
	/>
<MovieDetailModal bind:open={detailModalOpen} item={selectedForDetail} />

<style>
	.list-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}
	.list-toolbar-filters {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
	.filter-label {
		display: inline-flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		gap: var(--space-2);
		white-space: nowrap;
		flex-shrink: 0;
		min-height: 36px;
	}
	.filter-label-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted, var(--color-text));
		line-height: 36px;
	}
	.filter-select {
		height: 36px;
		box-sizing: border-box;
		padding: 0 var(--space-2);
		font-size: var(--text-sm);
		background: var(--color-bg);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
	}
	.filter-select:hover,
	.filter-select:focus {
		border-color: var(--color-accent);
		outline: none;
	}
	.sort-select {
		min-width: 10rem;
	}
	.list-toolbar-actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}
	.view-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background: transparent;
		color: var(--color-text);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
	}
	.view-toggle:hover {
		background: var(--color-border);
	}
	.view-toggle.active {
		background: var(--color-border);
		color: var(--color-accent);
		border-color: var(--color-accent);
	}
</style>
