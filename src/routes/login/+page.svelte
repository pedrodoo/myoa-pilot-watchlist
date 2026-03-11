<script lang="ts">
	import { getContext } from 'svelte';
	import { tick } from 'svelte';
	import MoviePosterRow from '$lib/components/MoviePosterRow.svelte';
	import { strings } from '$lib/strings';
	import type { PageData } from './$types';

	type Movie = {
		id: number;
		title: string;
		posterUrl: string | null;
		release_date: string | null;
	};

	type MoviePosterRowRef = { scrollBy: (delta: number) => void };

	let { data }: { data: PageData } = $props();
	const openLoginModal = getContext<() => void>('openLoginModal');

	let movies = $state<Movie[]>([]);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let hasLoadedMore = $state(false);
	let loadingMore = $state(false);
	let moviePosterRowRef = $state<MoviePosterRowRef | null>(null);

	$effect.pre(() => {
		if (hasLoadedMore) return;
		movies = data.topRatedMovies ?? [];
		currentPage = data.topRatedPage ?? 1;
		totalPages = data.topRatedTotalPages ?? 1;
	});

	const canLoadMore = $derived(totalPages > currentPage);

	async function handleLoadMore(viewportWidth: number) {
		if (loadingMore || currentPage >= totalPages) return;
		hasLoadedMore = true;
		loadingMore = true;
		try {
			const res = await fetch(`/login/top-rated?page=${currentPage + 1}`);
			if (!res.ok) throw new Error('Load failed');
			const json = await res.json();
			const next = (json.results ?? []) as Movie[];
			movies = [...movies, ...next];
			currentPage = json.page ?? currentPage + 1;
			totalPages = json.total_pages ?? totalPages;
			await tick();
			moviePosterRowRef?.scrollBy(viewportWidth);
		} finally {
			loadingMore = false;
		}
	}
</script>

{#if movies.length}
	<section class="section-full-bleed">
		<h2 class="section-heading">{strings.topRatedMovies}</h2>
		<MoviePosterRow
			bind:this={moviePosterRowRef}
			movies={movies}
			onItemClick={openLoginModal}
			canLoadMore={canLoadMore}
			onLoadMore={handleLoadMore}
			loadingMore={loadingMore}
		/>
	</section>
{/if}

<style>
	.section-full-bleed {
		width: 100vw;
		position: relative;
		left: 50%;
		margin-left: -50vw;
		padding-left: var(--space-6);
		padding-right: var(--space-6);
		min-height: calc(100vh - 5rem);
	}
	.section-full-bleed :global(.movie-row-bleed) {
		padding-left: 0;
		padding-right: 0;
	}
	.section-heading {
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--space-2);
	}
</style>
