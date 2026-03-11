<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { strings } from '$lib/strings';

	const PLACEHOLDER_POSTER = '/placeholder-poster.svg';

	interface Movie {
		id: number;
		title: string;
		posterUrl: string | null;
		release_date: string | null;
	}

	let {
		movies = [],
		onItemClick,
		canLoadMore = false,
		onLoadMore,
		loadingMore = false
	}: {
		movies: Movie[];
		onItemClick?: () => void;
		canLoadMore?: boolean;
		onLoadMore?: (viewportWidth: number) => Promise<void>;
		loadingMore?: boolean;
	} = $props();

	let listEl = $state<HTMLUListElement | null>(null);
	let scrollLeft = $state(0);

	function getYear(releaseDate: string | null): string {
		if (!releaseDate) return '';
		const y = releaseDate.slice(0, 4);
		return /^\d{4}$/.test(y) ? y : '';
	}

	/** Scroll the carousel by a number of pixels (positive = right). */
	export function scrollBy(delta: number) {
		if (!listEl) return;
		listEl.scrollTo({ left: listEl.scrollLeft + delta, behavior: 'smooth' });
	}

	/** Width of the visible viewport for the carousel. */
	export function getViewportWidth(): number {
		return listEl?.parentElement?.clientWidth ?? 0;
	}

	async function handleLoadMore() {
		if (!onLoadMore || !listEl) return;
		const viewportWidth = listEl.parentElement?.clientWidth ?? 0;
		await onLoadMore(viewportWidth);
	}

	function handleScrollLeft() {
		const viewportWidth = listEl?.parentElement?.clientWidth ?? 0;
		scrollBy(-viewportWidth);
	}
</script>

<section class="movie-poster-row">
	<div class="movie-row-bleed">
		{#if scrollLeft > 0}
			<button
				type="button"
				class="carousel-chevron carousel-chevron-left"
				aria-label="Scroll left"
				onclick={handleScrollLeft}
			>
				<ChevronLeft size={24} />
			</button>
		{/if}
		{#if canLoadMore}
			<button
				type="button"
				class="carousel-chevron carousel-chevron-right"
				aria-label="Load more movies"
				onclick={handleLoadMore}
				disabled={loadingMore}
			>
				<ChevronRight size={24} />
			</button>
		{/if}
		<ul
			class="movie-row-list"
			bind:this={listEl}
			onscroll={() => {
				scrollLeft = listEl?.scrollLeft ?? 0;
			}}
		>
			{#each movies as movie (movie.id)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<li
				class="movie-row-item"
				role={onItemClick ? 'button' : undefined}
				tabindex={onItemClick ? 0 : undefined}
				onclick={onItemClick}
				onkeydown={(e) => onItemClick && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onItemClick())}
			>
				<img
					src={movie.posterUrl ?? PLACEHOLDER_POSTER}
					alt={strings.posterFor + movie.title}
					width="100"
					height="150"
					class="movie-row-poster"
				/>
				<div class="movie-row-info">
					<span class="movie-row-title">{movie.title}</span>
					{#if getYear(movie.release_date)}
						<span class="movie-row-year">{getYear(movie.release_date)}</span>
					{/if}
				</div>
			</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.movie-poster-row {
		margin-bottom: var(--space-8);
	}
	.movie-row-bleed {
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
	.movie-row-list {
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
		overflow-y: visible;
		-webkit-overflow-scrolling: touch;
	}
	@media (max-width: 480px) {
		.movie-row-list {
			display: flex;
			flex-direction: column;
			overflow: visible;
		}
	}
	.movie-row-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg);
		/* Ensure row height fits poster + title + year so second row doesn’t paint over first card’s bottom */
		min-height: 12.5rem; /* 200px: 150px poster + ~34px text block + padding */
		/* Small margin so the bottom border isn't clipped by the grid row boundary */
		margin-bottom: 1px;
	}
	.movie-row-item[role='button'] {
		cursor: pointer;
	}
	.movie-row-poster {
		width: 100px;
		height: 150px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}
	.movie-row-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}
	.movie-row-title {
		font-weight: var(--font-weight-medium);
		font-size: var(--text-base);
		color: var(--color-text);
	}
	.movie-row-year {
		font-size: var(--text-body-muted);
		color: var(--color-text-muted);
	}
</style>
