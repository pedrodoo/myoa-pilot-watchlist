<script lang="ts">
	import { enhance } from '$app/forms';
	import { Mail, Key, User, LogIn, UserPlus } from '@lucide/svelte';
	import { strings } from '$lib/strings';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>{strings.login}</h1>
<form method="post" action="?/signInEmail" use:enhance>
	<label>
		<span><Mail size={16} style="vertical-align: -0.2em; margin-right: 0.25rem;" /> {strings.email}</span>
		<input type="email" name="email" required />
	</label>
	<label>
		<span><Key size={16} style="vertical-align: -0.2em; margin-right: 0.25rem;" /> {strings.password}</span>
		<input type="password" name="password" required />
	</label>
	<label>
		<span><User size={16} style="vertical-align: -0.2em; margin-right: 0.25rem;" /> {strings.nameForRegistration}</span>
		<input name="name" />
	</label>
	<button>
		<LogIn size={18} style="vertical-align: -0.2em; margin-right: 0.25rem;" />
		{strings.login}
	</button>
	<button formaction="?/signUpEmail">
		<UserPlus size={18} style="vertical-align: -0.2em; margin-right: 0.25rem;" />
		{strings.register}
	</button>
</form>
<p class="error">{form?.message ?? ''}</p>
