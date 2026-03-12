<script lang="ts">
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { Sun, Moon, LogOut, LogIn, Popcorn } from '@lucide/svelte';
	import { strings } from '$lib/strings';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
	let showLoginModal = $state(false);

	setContext('openLoginModal', () => {
		showLoginModal = true;
	});

	function toggleTheme() {
		const html = document.documentElement;
		const current = html.getAttribute('data-theme') || 'light';
		const next = current === 'light' ? 'dark' : 'light';
		html.setAttribute('data-theme', next);
		localStorage.setItem('theme', next);
	}

	function getTheme(): 'light' | 'dark' {
		if (typeof document === 'undefined') return 'light';
		return (document.documentElement.getAttribute('data-theme') || 'light') as 'light' | 'dark';
	}

	let theme = $state<'light' | 'dark'>(getTheme());

	$effect(() => {
		if (typeof document === 'undefined') return;
		const check = () => {
			theme = getTheme();
		};
		check();
		const observer = new MutationObserver(check);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="header" class:header-login={$page.url.pathname === '/login'}>
	{#if $page.url.pathname !== '/login'}
		<div class="header-brand">
			<h1 class="header-title">
				<a href="/">
					<Popcorn size={24} />
					{strings.appTitle}
				</a>
			</h1>
		</div>
	{/if}
	<div class="header-nav">
		<button
			type="button"
			class="theme-toggle"
			onclick={toggleTheme}
			aria-label={theme === 'light' ? strings.switchToDarkMode : strings.switchToLightMode}
		>
			{#if theme === 'light'}
				<Moon size={18} />
			{:else}
				<Sun size={18} />
			{/if}
		</button>
		{#if !data.user}
			<button
				type="button"
				class="theme-toggle"
				aria-label={strings.loginOrSignUp}
				onclick={() => (showLoginModal = true)}
			>
				<LogIn size={18} />
			</button>
		{:else}
			<span class="header-user">{data.user.name || data.user.email}</span>
			<form method="post" action="?/signOut" use:enhance class="inline">
				<button type="submit" class="icon" aria-label={strings.signOut}>
					<LogOut size={18} />
					{strings.signOut}
				</button>
			</form>
		{/if}
	</div>
</header>

{#if !data.user}
	<LoginModal bind:open={showLoginModal} />
{/if}

<main class="page" class:page-login={$page.url.pathname === '/login'}>
	{@render children()}
</main>
