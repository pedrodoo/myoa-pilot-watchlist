<script lang="ts">
	import { enhance } from '$app/forms';
	import { Eye, Trash2, Tv } from '@lucide/svelte';
	import { formatRelativeTime } from '$lib/relative-time';
	import { strings } from '$lib/strings';
	import type { ViewItem } from '$lib/types';

	const PLACEHOLDER_POSTER = '/placeholder-poster.svg';

	interface Props {
		items: ViewItem[];
		deleteAction: string;
		toggleStatusAction?: string;
		itemIdParam?: string;
	}

	let { items, deleteAction, toggleStatusAction, itemIdParam = 'id' }: Props = $props();
</script>

<ul>
	{#each items as item (item.id)}
		<li class:item-watched={item.status === 'watched'}>
			<div class="item-main">
				<div class="item-poster">
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
				</div>
				<div class="item-content">
					<span class="item-title-row">
						<span>{item.label}</span>
						{#if toggleStatusAction}
							<form method="post" action={toggleStatusAction} use:enhance class="inline">
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

<style>
	.item-watched {
		opacity: 0.85;
	}
	.item-title-row {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
	.item-poster {
		flex-shrink: 0;
	}
	.poster-img {
		width: 100px;
		height: 150px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		display: block;
	}
</style>
