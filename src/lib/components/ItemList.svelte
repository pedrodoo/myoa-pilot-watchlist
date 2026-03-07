<script lang="ts">
	import { enhance } from '$app/forms';
	import { Trash2 } from '@lucide/svelte';
	import { formatRelativeTime } from '$lib/relative-time';
	import { strings } from '$lib/strings';
	import type { ViewItem } from '$lib/types';

	interface Props {
		items: ViewItem[];
		deleteAction: string;
		itemIdParam?: string;
	}

	let { items, deleteAction, itemIdParam = 'id' }: Props = $props();
</script>

<ul>
	{#each items as item (item.id)}
		<li>
			<div class="item-content">
				<span>{item.label}</span>
				{#if item.addedAt}
					<span class="item-added">{formatRelativeTime(item.addedAt)}</span>
				{/if}
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
