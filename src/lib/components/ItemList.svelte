<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { Eye, Trash2, Tv } from '@lucide/svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import TiltCard from '$lib/components/TiltCard.svelte';
	import { formatRelativeTime } from '$lib/relative-time';
	import { strings } from '$lib/strings';
	import type { ViewItem } from '$lib/types';

	const PLACEHOLDER_POSTER = '/placeholder-poster.svg';

	interface Props {
		items: ViewItem[];
		viewMode?: 'list' | 'grid';
		deleteAction: string;
		toggleStatusAction?: string;
		ratingAction?: string;
		itemIdParam?: string;
		onPosterClick?: (item: ViewItem) => void;
	}

	let { items, viewMode = 'list', deleteAction, toggleStatusAction, ratingAction, itemIdParam = 'id', onPosterClick }: Props = $props();

	// #region agent log
	$effect(() => {
		const first = items[0];
		fetch('http://127.0.0.1:7484/ingest/74056abd-fecd-436c-9573-3f0ff2acc70e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7d08e'},body:JSON.stringify({sessionId:'e7d08e',location:'ItemList.svelte:effect',message:'ItemList render',data:{itemsLength:items.length,ratingAction:ratingAction!=null,firstId:first?.id,firstRating:first?.rating},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
	});
	// #endregion
</script>

{#if viewMode === 'grid'}
	<div class="list-grid-bleed">
		<ul class="list-grid">
			{#each items as item (item.id)}
				<li class="list-grid-card" class:item-watched={item.status === 'watched'}>
					<TiltCard class="list-grid-card-inner">
						<div class="item-poster list-grid-poster">
							{#if onPosterClick}
								<button type="button" class="poster-button" onclick={() => onPosterClick(item)} aria-label={strings.posterFor + item.label}>
									{#if item.posterUrl}
										<img
											src={item.posterUrl}
											alt=""
											width="100"
											height="150"
											class="poster-img"
											onerror={(e) => {
												const el = e.currentTarget as HTMLImageElement | null;
												if (el) el.src = PLACEHOLDER_POSTER;
											}}
										/>
									{:else}
										<img src={PLACEHOLDER_POSTER} alt="" width="100" height="150" class="poster-img" />
									{/if}
								</button>
							{:else}
								{#if item.posterUrl}
									<img
										src={item.posterUrl}
										alt={strings.posterFor + item.label}
										width="100"
										height="150"
										class="poster-img"
										onerror={(e) => {
											const el = e.currentTarget as HTMLImageElement | null;
											if (el) {
												el.src = PLACEHOLDER_POSTER;
												el.alt = strings.noPoster;
											}
										}}
									/>
								{:else}
									<img src={PLACEHOLDER_POSTER} alt={strings.noPoster} width="100" height="150" class="poster-img" />
								{/if}
							{/if}
						</div>
						<div class="item-content">
							<span class="item-title-row">
								<span class="item-title-text">{item.label}</span>
								{#if toggleStatusAction}
									<form
										id={"status-form-grid-" + String(item.id)}
										method="post"
										action={toggleStatusAction}
										use:enhance={() => async ({ update }) => { await update(); }}
										class="inline"
									>
										<input type="hidden" name={itemIdParam} value={item.id} />
										<button
											type="submit"
											class="icon icon-only btn-ghost"
											aria-label={item.status === 'watched' ? strings.markAsWantToWatch : strings.markAsWatched}
										>
											{#if item.status === 'watched'}
												<Tv size={16} />
											{:else}
												<Eye size={16} />
											{/if}
										</button>
									</form>
								{/if}
							</span>
							{#if ratingAction}
								<form
									id={"rating-form-grid-" + String(item.id)}
									method="post"
									action={ratingAction}
									use:enhance={() => {
									return async ({ result, update }) => {
										await update();
										if (result?.type === 'success') await invalidate(() => true);
									};
								}}
									class="item-rating-form"
								>
									<input type="hidden" name={itemIdParam} value={item.id} />
									<StarRating value={item.rating ?? 0} inputName="rating" size={18} />
								</form>
							{/if}
							{#if item.addedAt}
								<span class="item-added">{formatRelativeTime(item.addedAt)}</span>
							{/if}
							<form method="post" action={deleteAction} use:enhance class="inline item-delete-form">
								<input type="hidden" name={itemIdParam} value={item.id} />
								<button type="submit" class="icon icon-only btn-ghost" aria-label={strings.deleteItemAriaPrefix + item.label}>
									<Trash2 size={16} />
								</button>
							</form>
						</div>
					</TiltCard>
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<ul>
		{#each items as item (item.id)}
			<li class:item-watched={item.status === 'watched'}>
				<div class="item-main">
					<div class="item-poster">
						{#if onPosterClick}
							<button type="button" class="poster-button" onclick={() => onPosterClick(item)} aria-label={strings.posterFor + item.label}>
								{#if item.posterUrl}
									<img
										src={item.posterUrl}
										alt=""
										width="100"
										height="150"
										class="poster-img"
										onerror={(e) => {
											const el = e.currentTarget as HTMLImageElement | null;
											if (el) {
												el.src = PLACEHOLDER_POSTER;
											}
										}}
									/>
								{:else}
									<img
										src={PLACEHOLDER_POSTER}
										alt=""
										width="100"
										height="150"
										class="poster-img"
									/>
								{/if}
							</button>
						{:else}
							{#if item.posterUrl}
								<img
									src={item.posterUrl}
									alt={strings.posterFor + item.label}
									width="100"
									height="150"
									class="poster-img"
									onerror={(e) => {
										const el = e.currentTarget as HTMLImageElement | null;
										if (el) {
											el.src = PLACEHOLDER_POSTER;
											el.alt = strings.noPoster;
										}
									}}
								/>
							{:else}
								<img
									src={PLACEHOLDER_POSTER}
									alt={strings.noPoster}
									width="100"
									height="150"
									class="poster-img"
								/>
							{/if}
						{/if}
					</div>
					<div class="item-content">
						<span class="item-title-row">
							<span>{item.label}</span>
							{#if toggleStatusAction}
								<form
									id={"status-form-" + String(item.id)}
									method="post"
									action={toggleStatusAction}
									use:enhance={() => {
										return async ({ update }) => {
											await update();
										};
									}}
									class="inline"
								>
									<input type="hidden" name={itemIdParam} value={item.id} />
									<button
										type="submit"
										class="icon icon-only btn-ghost"
										aria-label={item.status === 'watched' ? strings.markAsWantToWatch : strings.markAsWatched}
									>
										{#if item.status === 'watched'}
											<Tv size={16} />
										{:else}
											<Eye size={16} />
										{/if}
									</button>
								</form>
							{/if}
						</span>
						{#if ratingAction}
							<form
								id={"rating-form-" + String(item.id)}
								method="post"
								action={ratingAction}
								use:enhance={() => {
									// #region agent log
									fetch('http://127.0.0.1:7484/ingest/74056abd-fecd-436c-9573-3f0ff2acc70e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7d08e'},body:JSON.stringify({sessionId:'e7d08e',location:'ItemList.svelte:enhance-submit',message:'rating form submit start',timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
									// #endregion
									return async ({ result, update }) => {
										// #region agent log
										fetch('http://127.0.0.1:7484/ingest/74056abd-fecd-436c-9573-3f0ff2acc70e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7d08e'},body:JSON.stringify({sessionId:'e7d08e',location:'ItemList.svelte:enhance-result',message:'rating form result',data:{resultType:result?.type,calledUpdate:true},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
										// #endregion
										await update();
										if (result?.type === 'success') {
											await invalidate(() => true);
										}
									};
								}}
								class="item-rating-form"
							>
								<input type="hidden" name={itemIdParam} value={item.id} />
								<StarRating value={item.rating ?? 0} inputName="rating" size={18} />
							</form>
						{/if}
						{#if item.addedAt}
							<span class="item-added">{formatRelativeTime(item.addedAt)}</span>
						{/if}
					</div>
				</div>
				<form method="post" action={deleteAction} use:enhance class="inline">
					<input type="hidden" name={itemIdParam} value={item.id} />
					<button type="submit" class="icon icon-only btn-ghost" aria-label={strings.deleteItemAriaPrefix + item.label}>
						<Trash2 size={16} />
					</button>
				</form>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.item-watched {
		opacity: 0.6;
	}
	.item-title-row {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
	.item-rating-form {
		display: block;
		margin-top: var(--space-1);
	}
	.item-poster {
		flex-shrink: 0;
	}
	.poster-button {
		display: block;
		padding: 0;
		margin: 0;
		border: none;
		background: none;
		cursor: pointer;
		line-height: 0;
	}
	.poster-img {
		width: 100px;
		height: 150px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		display: block;
	}

	/* Grid view — full viewport */
	.list-grid-bleed {
		width: 100vw;
		position: relative;
		left: 50%;
		margin-left: -50vw;
		margin-bottom: var(--space-4);
		padding-left: var(--space-6);
		padding-right: var(--space-6);
	}
	.list-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-4);
	}
	.list-grid-card {
		border-bottom: none;
		padding: 0;
		display: block;
	}
	.list-grid-card :global(.list-grid-card-inner) {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg);
		height: 100%;
	}
	.list-grid-poster {
		width: 100%;
		aspect-ratio: 2/3;
	}
	.list-grid-poster .poster-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.list-grid-card .item-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
		min-width: 0;
	}
	.list-grid-card .item-title-text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.list-grid-card .item-title-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.list-grid-card .item-title-row span {
		min-width: 0;
	}
	.list-grid-card .item-delete-form {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		z-index: 1;
	}
</style>
