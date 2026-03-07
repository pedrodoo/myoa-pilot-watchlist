<script lang="ts">
	import AddItemForm from '$lib/components/AddItemForm.svelte';
	import ItemList from '$lib/components/ItemList.svelte';
	import { strings } from '$lib/strings';
	import type { ViewItem } from '$lib/types';
	import type { PageServerData, ActionData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const items: ViewItem[] = $derived(
		(data.movies ?? []).map((m) => ({
			id: m.id,
			label: m.title,
			addedAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined
		}))
	);
</script>

<AddItemForm
	action="?/addMovie"
	label={strings.title}
	buttonLabel={strings.addMovie}
	fieldName="title"
/>
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

<ItemList {items} deleteAction="?/deleteMovie" itemIdParam="id" />
