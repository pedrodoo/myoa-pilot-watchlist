<script lang="ts">
	import { getContext } from 'svelte';
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Popcorn } from '@lucide/svelte';
	import MoviePosterRow from '$lib/components/MoviePosterRow.svelte';
	import { strings } from '$lib/strings';
	import type { PageData } from './$types';

	let staticCanvas = $state<HTMLCanvasElement | null>(null);

	onMount(() => {
		const canvas = staticCanvas;
		if (!canvas) return;

		const NOISE_DENSITY = 0.1;
		const UPDATE_EVERY_FRAMES = 4;
		const SCANLINE_SPACING = 2;
		const SCANLINE_ALPHA = 0.12;
		const VIGNETTE_STRENGTH = 0.6;
		const FLICKER_MIN = 0.85;
		const FLICKER_MAX = 1;

		let frameCount = 0;
		let rafId: number;
		let imageData: ImageData | null = null;

		function resize() {
			const w = window.innerWidth;
			const h = window.innerHeight;
			canvas.width = w;
			canvas.height = h;
			imageData = null;
		}

		function draw() {
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const w = window.innerWidth;
			const h = window.innerHeight;

			if (!imageData || imageData.width !== w || imageData.height !== h) {
				imageData = ctx.createImageData(w, h);
			}

			const data = imageData.data;
			const len = data.length;

			const flicker = FLICKER_MIN + Math.random() * (FLICKER_MAX - FLICKER_MIN);

			for (let i = 0; i < len; i += 4) {
				if (Math.random() < NOISE_DENSITY) {
					data[i] = Math.floor(Math.random() * 256);
					data[i + 1] = Math.floor(Math.random() * 256);
					data[i + 2] = Math.floor(Math.random() * 256);
					data[i + 3] = Math.floor(255 * flicker * 0.25);
				} else {
					data[i] = 0;
					data[i + 1] = 0;
					data[i + 2] = 0;
					data[i + 3] = 0;
				}
			}

			ctx.putImageData(imageData, 0, 0);

			ctx.save();
			for (let y = 0; y < h; y += SCANLINE_SPACING) {
				ctx.fillStyle = `rgba(0,0,0,${SCANLINE_ALPHA})`;
				ctx.fillRect(0, y, w, 1);
			}
			const cx = w / 2;
			const cy = h / 2;
			const r = Math.max(w, h) * 0.7;
			const vig = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
			vig.addColorStop(0, 'transparent');
			vig.addColorStop(0.5, 'transparent');
			vig.addColorStop(1, `rgba(0,0,0,${VIGNETTE_STRENGTH})`);
			ctx.fillStyle = vig;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
		}

		function loop() {
			frameCount++;
			if (frameCount % UPDATE_EVERY_FRAMES === 0) {
				draw();
			}
			rafId = requestAnimationFrame(loop);
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!prefersReducedMotion) {
			resize();
			window.addEventListener('resize', resize);
			loop();
		}

		return () => {
			if (!prefersReducedMotion) {
				cancelAnimationFrame(rafId);
				window.removeEventListener('resize', resize);
			}
		};
	});

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

	let nowPlayingMovies = $state<Movie[]>([]);
	let nowPlayingCurrentPage = $state(1);
	let nowPlayingTotalPages = $state(1);
	let nowPlayingHasLoadedMore = $state(false);
	let nowPlayingLoadingMore = $state(false);
	let nowPlayingPosterRowRef = $state<MoviePosterRowRef | null>(null);

	$effect.pre(() => {
		if (hasLoadedMore) return;
		movies = data.topRatedMovies ?? [];
		currentPage = data.topRatedPage ?? 1;
		totalPages = data.topRatedTotalPages ?? 1;
	});
	$effect.pre(() => {
		if (nowPlayingHasLoadedMore) return;
		nowPlayingMovies = data.nowPlayingMovies ?? [];
		nowPlayingCurrentPage = data.nowPlayingPage ?? 1;
		nowPlayingTotalPages = data.nowPlayingTotalPages ?? 1;
	});

	const canLoadMore = $derived(totalPages > currentPage);
	const nowPlayingCanLoadMore = $derived(nowPlayingTotalPages > nowPlayingCurrentPage);

	/** Use data for initial paint so section shows before $effect.pre runs; use state after load-more. */
	const nowPlayingDisplay = $derived(
		nowPlayingHasLoadedMore ? nowPlayingMovies : (data.nowPlayingMovies ?? [])
	);

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

	async function handleLoadMoreNowPlaying(viewportWidth: number) {
		if (nowPlayingLoadingMore || nowPlayingCurrentPage >= nowPlayingTotalPages) return;
		nowPlayingHasLoadedMore = true;
		nowPlayingLoadingMore = true;
		try {
			const res = await fetch(`/login/now-playing?page=${nowPlayingCurrentPage + 1}`);
			if (!res.ok) throw new Error('Load failed');
			const json = await res.json();
			const next = (json.results ?? []) as Movie[];
			nowPlayingMovies = [...nowPlayingMovies, ...next];
			nowPlayingCurrentPage = json.page ?? nowPlayingCurrentPage + 1;
			nowPlayingTotalPages = json.total_pages ?? nowPlayingTotalPages;
			await tick();
			nowPlayingPosterRowRef?.scrollBy(viewportWidth);
		} finally {
			nowPlayingLoadingMore = false;
		}
	}
</script>

<canvas
	bind:this={staticCanvas}
	class="login-static-canvas"
	aria-hidden="true"
></canvas>
<div class="login-content">
<div class="login-hero-zone">
	<header class="login-hero">
		<h1 class="login-hero-title">
			<span class="login-hero-icon">
				<Popcorn size={48} />
			</span>
			{strings.appTitle}
		</h1>
		<p class="login-hero-tagline">{strings.appTagline}</p>
	</header>
</div>

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
{#if nowPlayingDisplay.length}
	<section class="section-full-bleed">
		<h2 class="section-heading">{strings.nowPlayingMovies}</h2>
		<MoviePosterRow
			bind:this={nowPlayingPosterRowRef}
			movies={nowPlayingDisplay}
			onItemClick={openLoginModal}
			canLoadMore={nowPlayingCanLoadMore}
			onLoadMore={handleLoadMoreNowPlaying}
			loadingMore={nowPlayingLoadingMore}
		/>
	</section>
{/if}
</div>

<style>
	.login-static-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 0;
		pointer-events: none;
	}
	.login-content {
		position: relative;
		z-index: 1;
	}
	.login-hero-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		text-align: center;
		position: relative;
	}
	.login-hero {
		position: relative;
		padding: var(--space-8) var(--space-6);
	}
	@keyframes hero-enter {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.login-hero-icon {
		display: inline-flex;
		animation: hero-enter 0.5s ease-out both;
	}
	.login-hero-title {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		margin: 0 0 var(--space-2);
		font-family: var(--font-logo);
		font-size: var(--text-hero-title);
		font-weight: 600;
		font-style: italic;
		letter-spacing: var(--letter-spacing-tight);
		color: var(--color-text);
		animation: hero-enter 0.5s ease-out 0.15s both;
	}
	.login-hero-tagline {
		margin: 0;
		font-size: var(--text-body-muted);
		color: var(--color-text-muted);
		font-weight: normal;
		line-height: var(--line-height-base);
		animation: hero-enter 0.5s ease-out 0.3s both;
	}
	@media (prefers-reduced-motion: reduce) {
		.login-hero-icon,
		.login-hero-title,
		.login-hero-tagline {
			animation: none;
			opacity: 1;
		}
	}

	.section-full-bleed {
		width: 100vw;
		position: relative;
		left: 50%;
		margin-left: -50vw;
		padding-left: var(--space-6);
		padding-right: var(--space-6);
		/* Allow both carousel sections to be visible; avoid full-viewport min-height pushing the second below the fold */
		min-height: 0;
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
