<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData, ActionData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<h1>Watchlist</h1>

<form method="post" action="?/addMovie" use:enhance>
	<label>
		Title
		<input type="text" name="title" required />
	</label>
	<button>Add movie</button>
</form>
{#if form?.message}
	<p style="color: red">{form.message}</p>
{/if}

<ul>
	{#each data.movies as m (m.id)}
		<li>{m.title}</li>
	{/each}
</ul>

<form method="post" action="?/signOut" use:enhance>
	<button>Sign out</button>
</form>
