<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
		intensity?: number;
		perspective?: number;
		hoverScale?: number;
		leaveDuration?: number;
		leaveEasing?: string;
		hoverDuration?: number;
	}

	let {
		class: className = '',
		children,
		intensity = 6,
		perspective = 700,
		hoverScale = 1.03,
		leaveDuration = 0.5,
		leaveEasing = 'cubic-bezier(0.23, 1, 0.32, 1)',
		hoverDuration = 0.08
	}: Props = $props();

	let cardEl = $state<HTMLDivElement | null>(null);
	let hovered = $state(false);
	let rotateX = $state(0);
	let rotateY = $state(0);
	let glareX = $state(50);
	let glareY = $state(50);

	function handleMouseEnter() {
		hovered = true;
	}

	function handleMouseLeave() {
		hovered = false;
		rotateX = 0;
		rotateY = 0;
	}

	function handleMouseMove(e: MouseEvent) {
		const el = cardEl;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const normX = (e.clientX - centerX) / (rect.width / 2);
		const normY = (e.clientY - centerY) / (rect.height / 2);
		rotateY = Math.max(-1, Math.min(1, normX)) * intensity;
		rotateX = Math.max(-1, Math.min(1, normY)) * -intensity;
		const pctX = ((e.clientX - rect.left) / rect.width) * 100;
		const pctY = ((e.clientY - rect.top) / rect.height) * 100;
		glareX = pctX;
		glareY = pctY;
	}

	const transformStyle = $derived(
		`perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${hovered ? hoverScale : 1})`
	);
	const transitionStyle = $derived(
		hovered ? `transform ${hoverDuration}s ease-out` : `transform ${leaveDuration}s ${leaveEasing}`
	);
</script>

<div class="tilt-card-perspective" style="perspective: {perspective}px">
	<div
		bind:this={cardEl}
		class="tilt-card {className}"
		style="transform: {transformStyle}; transition: {transitionStyle}; --glare-x: {glareX}%; --glare-y: {glareY}%;"
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		onmousemove={handleMouseMove}
		role="presentation"
	>
		<div class="tilt-card-glare" class:visible={hovered} aria-hidden="true"></div>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.tilt-card-perspective {
		height: 100%;
	}
	.tilt-card {
		position: relative;
		transform-style: preserve-3d;
		height: 100%;
		overflow: hidden;
	}
	.tilt-card-glare {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		opacity: 0;
		transition: opacity 0.15s ease-out;
		background: radial-gradient(
			circle at var(--glare-x, 50%) var(--glare-y, 50%),
			rgba(255, 255, 255, 0.4) 0%,
			transparent 60%
		);
	}
	.tilt-card-glare.visible {
		opacity: 1;
	}
</style>
