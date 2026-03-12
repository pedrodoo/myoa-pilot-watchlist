<script lang="ts">
	import { X } from '@lucide/svelte';
	import { strings } from '$lib/strings';
	import type { ViewItem } from '$lib/types';

	const PLACEHOLDER_POSTER = '/placeholder-poster.svg';

	interface TmdbMovieDetailsResponse {
		id: number;
		title: string;
		overview: string | null;
		posterUrl: string | null;
		release_date: string | null;
		runtime: number | null;
		tagline: string | null;
		vote_average: number;
		vote_count: number;
		genres: { id: number; name: string }[];
	}

	let { open = $bindable(false), item = null }: { open: boolean; item: ViewItem | null } = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let details = $state<TmdbMovieDetailsResponse | null>(null);
	let loading = $state(false);
	let error = $state(false);
	let forceClosed = $state(false);

	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			forceClosed = false;
			dialogEl.showModal();
		} else {
			dialogEl.close();
		}
	});

	$effect(() => {
		if (!open || !item) {
			details = null;
			loading = false;
			error = false;
			return;
		}
		const tmdbId = item.tmdbId;
		if (tmdbId) {
			loading = true;
			error = false;
			details = null;
			fetch(`/api/tmdb/movie/${tmdbId}`)
				.then((res) => {
					if (!res.ok) throw new Error('Fetch failed');
					return res.json();
				})
				.then((data: TmdbMovieDetailsResponse) => {
					if (data.id === tmdbId) details = data;
					loading = false;
				})
				.catch(() => {
					error = true;
					loading = false;
				});
		} else {
			loading = false;
			details = null;
		}
	});

	function handleDialogClose() {
		open = false;
	}

	function formatRuntime(minutes: number | null): string {
		if (minutes == null || minutes < 1) return '—';
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return h > 0 ? `${h}h ${m}m` : `${m}m`;
	}

	function formatReleaseDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		const d = new Date(dateStr);
		return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
	}

	const displayTitle = $derived(details?.title ?? item?.label ?? '');
	const displayPosterUrl = $derived(details?.posterUrl ?? item?.posterUrl ?? null);
</script>

<dialog
	bind:this={dialogEl}
	class="movie-detail-modal"
	class:movie-detail-modal-open={open}
	class:movie-detail-modal-force-closed={forceClosed}
	aria-modal="true"
	aria-labelledby="movie-detail-title"
	aria-describedby="movie-detail-content"
	onclose={handleDialogClose}
>
	<div class="movie-detail-panel" role="document">
		<div class="movie-detail-header">
			<h2 id="movie-detail-title" class="movie-detail-title">{displayTitle}</h2>
			<button
				type="button"
				class="movie-detail-close"
				aria-label={strings.closeMovieDetail}
				onclick={() => {
					forceClosed = true;
					open = false;
					dialogEl?.close();
				}}
			>
				<X size={20} />
			</button>
		</div>
		<div id="movie-detail-content" class="movie-detail-body">
			{#if loading}
				<p class="movie-detail-loading">{strings.loadingMovieDetails}</p>
			{:else if error}
				<p class="movie-detail-error">{strings.movieDetailError}</p>
				{#if displayPosterUrl}
					<div class="movie-detail-poster-wrap">
						<img
							src={displayPosterUrl}
							alt=""
							width="300"
							height="450"
							class="movie-detail-poster"
							onerror={(e) => {
								const el = e.currentTarget as HTMLImageElement;
								el.src = PLACEHOLDER_POSTER;
							}}
						/>
					</div>
				{/if}
			{:else if !item?.tmdbId}
				<p class="movie-detail-unavailable">{strings.movieDetailsNotAvailable}</p>
				{#if displayPosterUrl}
					<div class="movie-detail-poster-wrap">
						<img
							src={displayPosterUrl}
							alt=""
							width="300"
							height="450"
							class="movie-detail-poster"
							onerror={(e) => {
								const el = e.currentTarget as HTMLImageElement;
								el.src = PLACEHOLDER_POSTER;
							}}
						/>
					</div>
				{:else}
					<img
						src={PLACEHOLDER_POSTER}
						alt=""
						width="300"
						height="450"
						class="movie-detail-poster"
					/>
				{/if}
			{:else if details}
				<div class="movie-detail-grid">
					<div class="movie-detail-poster-wrap">
						<img
							src={details.posterUrl ?? PLACEHOLDER_POSTER}
							alt=""
							width="300"
							height="450"
							class="movie-detail-poster"
							onerror={(e) => {
								const el = e.currentTarget as HTMLImageElement;
								el.src = PLACEHOLDER_POSTER;
							}}
						/>
					</div>
					<div class="movie-detail-meta">
						{#if details.genres?.length}
							<p class="movie-detail-row">
								<span class="movie-detail-label">{strings.genre}</span>
								<span class="movie-detail-value">{details.genres.map((g) => g.name).join(', ')}</span>
							</p>
						{/if}
						<p class="movie-detail-row">
							<span class="movie-detail-label">{strings.runtime}</span>
							<span class="movie-detail-value">{formatRuntime(details.runtime)}</span>
						</p>
						<p class="movie-detail-row">
							<span class="movie-detail-label">{strings.releaseDate}</span>
							<span class="movie-detail-value">{formatReleaseDate(details.release_date)}</span>
						</p>
						{#if details.tagline}
							<p class="movie-detail-row movie-detail-tagline">
								<span class="movie-detail-label">{strings.tagline}</span>
								<span class="movie-detail-value">"{details.tagline}"</span>
							</p>
						{/if}
						<p class="movie-detail-row">
							<span class="movie-detail-label">{strings.tmdbRating}</span>
							<span class="movie-detail-value">{details.vote_average.toFixed(1)}/10</span>
						</p>
						{#if details.overview}
							<div class="movie-detail-overview">
								<p>{details.overview}</p>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<p class="movie-detail-unavailable">{strings.movieDetailsNotAvailable}</p>
			{/if}
		</div>
	</div>
</dialog>

<style>
	.movie-detail-modal {
		border: none;
		padding: var(--space-4);
		max-width: 100vw;
		max-height: 100vh;
		background: transparent;
		display: none;
		align-items: center;
		justify-content: center;
	}
	.movie-detail-modal-open {
		display: flex;
	}
	.movie-detail-modal::backdrop {
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
	}
	.movie-detail-modal-force-closed,
	.movie-detail-modal-force-closed::backdrop {
		display: none !important;
	}
	.movie-detail-panel {
		margin: auto;
		background: var(--color-bg);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: min(90vw, 720px);
		width: 100%;
		max-height: 90vh;
		overflow: auto;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		animation: movie-detail-enter 0.2s ease-out;
	}
	@keyframes movie-detail-enter {
		from {
			opacity: 0;
			transform: scale(0.98);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.movie-detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
		gap: var(--space-3);
	}
	.movie-detail-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		line-height: 1.2;
	}
	.movie-detail-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background: transparent;
		color: var(--color-text);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		flex-shrink: 0;
	}
	.movie-detail-close:hover {
		background: var(--color-border);
	}
	.movie-detail-body {
		color: var(--color-text);
	}
	.movie-detail-loading,
	.movie-detail-error,
	.movie-detail-unavailable {
		margin: 0;
		padding: var(--space-4) 0;
	}
	.movie-detail-error {
		color: var(--color-error);
	}
	.movie-detail-unavailable {
		color: var(--color-text-muted);
	}
	.movie-detail-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-6);
		align-items: start;
	}
	@media (max-width: 520px) {
		.movie-detail-grid {
			grid-template-columns: 1fr;
		}
	}
	.movie-detail-poster-wrap {
		position: relative;
	}
	.movie-detail-poster {
		width: 200px;
		height: 300px;
		object-fit: cover;
		border-radius: var(--radius-md);
		display: block;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
	}
	@media (min-width: 521px) {
		.movie-detail-poster {
			width: 240px;
			height: 360px;
		}
	}
	.movie-detail-poster-wrap:has(.movie-detail-poster:hover) .movie-detail-poster {
		transform: scale(1.02);
		box-shadow: 0 14px 28px -5px rgba(0, 0, 0, 0.2);
	}
	.movie-detail-poster {
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}
	.movie-detail-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}
	.movie-detail-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin: 0;
		font-size: var(--text-sm);
	}
	.movie-detail-label {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
	}
	.movie-detail-value {
		color: var(--color-text);
	}
	.movie-detail-tagline .movie-detail-value {
		font-style: italic;
	}
	.movie-detail-overview {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border);
		font-size: var(--text-sm);
		line-height: 1.6;
		color: var(--color-text);
	}
	.movie-detail-overview p {
		margin: 0;
	}
</style>
