<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus } from '@lucide/svelte';
	import { strings } from '$lib/strings';

	interface Props {
		action: string;
		label?: string;
		buttonLabel?: string;
		fieldName?: string;
	}

	let {
		action,
		label = strings.title,
		buttonLabel = strings.addItem,
		fieldName = 'title'
	}: Props = $props();

	let value = $state('');
</script>

<form
	method="post"
	action={action}
	use:enhance={() => {
		return async ({ result, update }) => {
			await update();
			if (result.type === 'success' || result.type === 'redirect') {
				value = '';
			}
		};
	}}
	class="add-item-form"
>
	<label>
		{label}
		<div class="add-item-row">
			<input type="text" name={fieldName} bind:value required />
			<button>
				<Plus size={18} style="vertical-align: -0.2em; margin-right: 0.25rem;" />
				{buttonLabel}
			</button>
		</div>
	</label>
</form>
