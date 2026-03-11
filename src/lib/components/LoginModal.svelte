<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Mail, Key, User, LogIn, UserPlus, X } from '@lucide/svelte';
	import { strings } from '$lib/strings';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let formMessage = $state('');
	let forceClosed = $state(false);

	$effect(() => {
		// #region agent log
		fetch('http://127.0.0.1:7484/ingest/74056abd-fecd-436c-9573-3f0ff2acc70e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'02b525'},body:JSON.stringify({sessionId:'02b525',location:'LoginModal.svelte:$effect',message:'effect',data:{hasDialogEl:!!dialogEl,open},hypothesisId:'effect',timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		if (!dialogEl) return;
		if (open) {
			forceClosed = false;
			dialogEl.showModal();
		} else {
			dialogEl.close();
		}
	});

	function handleDialogClose() {
		open = false;
	}

	function handleSubmit(): import('$app/forms').SubmitFunction {
		return async ({ result }) => {
			formMessage = '';
			if (result.type === 'redirect') {
				open = false;
				await goto(result.location);
				return;
			}
			if (result.type === 'failure' && result.data?.message) {
				formMessage = result.data.message as string;
			}
		};
	}
</script>

<dialog
	bind:this={dialogEl}
	class="login-modal"
	class:login-modal-open={open}
	class:login-modal-force-closed={forceClosed}
	aria-modal="true"
	aria-labelledby="login-modal-title"
	onclose={handleDialogClose}
>
	<div class="login-modal-panel" role="document">
			<div class="login-modal-header">
				<h2 id="login-modal-title" class="login-modal-title">{strings.login}</h2>
				<button
					type="button"
					class="login-modal-close"
					aria-label="Close"
					onclick={() => {
						// #region agent log
						fetch('http://127.0.0.1:7484/ingest/74056abd-fecd-436c-9573-3f0ff2acc70e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'02b525'},body:JSON.stringify({sessionId:'02b525',location:'LoginModal.svelte:close click',message:'close clicked',data:{openBefore:open},hypothesisId:'click',timestamp:Date.now()})}).catch(()=>{});
						// #endregion
						forceClosed = true;
						open = false;
						dialogEl?.close();
					}}
				>
					<X size={20} />
				</button>
			</div>
			<form
				method="post"
				action="/login?/signInEmail"
				use:enhance={handleSubmit}
				class="login-modal-form"
			>
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
				<div class="login-modal-actions">
					<button type="submit">
						<LogIn size={18} style="vertical-align: -0.2em; margin-right: 0.25rem;" />
						{strings.login}
					</button>
					<button type="submit" formaction="/login?/signUpEmail" class="btn-primary">
						<UserPlus size={18} style="vertical-align: -0.2em; margin-right: 0.25rem;" />
						{strings.register}
					</button>
				</div>
			</form>
			{#if formMessage}
				<p class="login-modal-error">{formMessage}</p>
			{/if}
	</div>
</dialog>

<style>
	.login-modal {
		border: none;
		padding: var(--space-4);
		max-width: 100vw;
		max-height: 100vh;
		background: transparent;
		display: none;
		align-items: center;
		justify-content: center;
	}
	.login-modal-open {
		display: flex;
	}
	.login-modal::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
	.login-modal-force-closed,
	.login-modal-force-closed::backdrop {
		display: none !important;
	}
	.login-modal-panel {
		margin: auto;
		background: var(--color-bg);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 400px;
		width: 100%;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}
	.login-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}
	.login-modal-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
	}
	.login-modal-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background: transparent;
		color: var(--color-text);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
	}
	.login-modal-close:hover {
		background: var(--color-border);
	}
	.login-modal-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.login-modal-form label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.login-modal-form label span {
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text);
	}
	.login-modal-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}
	.login-modal-actions button {
		display: inline-flex;
		align-items: center;
	}
	.login-modal-error {
		margin: var(--space-3) 0 0;
		font-size: var(--text-sm);
		color: var(--color-error);
	}
</style>
