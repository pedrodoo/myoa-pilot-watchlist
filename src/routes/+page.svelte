<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData, ActionData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let title = $state('');
</script>

<h1>Watchlist</h1>

<form method="post" action="?/addMovie" use:enhance={() => {
	return async ({ result, update }) => {
		await update();
		if (result.type === 'success' || result.type === 'redirect') {
			title = '';
		}
	};
}}>
	<label>
		Title
		<input type="text" name="title" bind:value={title} required />
	</label>
	<button>Add movie</button>
</form>
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

<ul>
	{#each data.movies as m (m.id)}
		<li>{m.title}</li>
	{/each}
</ul>

<form method="post" action="?/signOut" use:enhance>
	<button>Sign out</button>
</form>
