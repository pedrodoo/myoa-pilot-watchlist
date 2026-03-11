<script lang="ts">
	import { Star } from '@lucide/svelte';
	import { strings } from '$lib/strings';

	interface Props {
		value?: number;
		readonly?: boolean;
		maxStars?: number;
		inputName?: string;
		size?: number;
	}

	let {
		value = 0,
		readonly = false,
		maxStars = 5,
		inputName = 'rating',
		size = 20
	}: Props = $props();

	let rootEl: HTMLDivElement;

	// #region agent log
	$effect(() => {
		fetch('http://127.0.0.1:7484/ingest/74056abd-fecd-436c-9573-3f0ff2acc70e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7d08e'},body:JSON.stringify({sessionId:'e7d08e',location:'StarRating.svelte:effect',message:'StarRating render',data:{value,readonly,maxStars},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
	});
	// #endregion

	function handleClick(starIndex: number) {
		if (readonly) return;
		const rating = starIndex + 1;
		const form = rootEl?.closest('form');
		if (!form) return;
		let input = form.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
		if (!input) {
			input = document.createElement('input');
			input.type = 'hidden';
			input.name = inputName;
			form.appendChild(input);
		}
		input.value = String(rating);
		form.requestSubmit();
	}
</script>

<div
	bind:this={rootEl}
	class="star-rating"
	role="img"
	aria-label={readonly ? strings.ratingAria.replace('{0}', String(value)) : strings.setRatingAria}
>
	{#if inputName && !readonly}
		<!-- Hidden input for form submission; value set on click -->
		<input type="hidden" name={inputName} value={value || ''} />
	{/if}
	{#each Array(maxStars) as _, i}
		{#if readonly}
			<span class="star star-readonly" class:filled={i < value}>
				<Star size={size} />
			</span>
		{:else}
			<button
				type="button"
				class="star star-button"
				class:filled={i < value}
				aria-label="Set rating to {i + 1} stars"
				onclick={() => handleClick(i)}
			>
				<Star size={size} />
			</button>
		{/if}
	{/each}
</div>

<style>
	.star-rating {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1, 0.25rem);
	}
	.star {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--color-border);
	}
	.star.filled {
		color: var(--color-accent);
	}
	.star-readonly {
		pointer-events: none;
	}
	.star-button {
		padding: var(--space-1, 0.25rem);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-border);
		border-radius: var(--radius-sm, 0.25rem);
	}
	.star-button:hover,
	.star-button:focus-visible {
		color: var(--color-accent-hover);
	}
	.star-button.filled {
		color: var(--color-accent);
	}
</style>
