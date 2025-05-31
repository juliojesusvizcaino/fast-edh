<script lang="ts">
	import type { Player } from '$lib/player.svelte';
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';

	let {
		player,
		rotation,
		onDecrement,
		onIncrement
	}: {
		player: Player;
		rotation: 0 | 90 | 180 | 270;
		onDecrement: () => void;
		onIncrement: () => void;
	} = $props();

	let previousLife = player.life;
	let isEditing = $state(false);
	let inputValue = $state(player.life);
	let inputElement: HTMLInputElement | null = $state(null);
	let animationDirection = $state(0);
	let decrementing = $state(false);
	let incrementing = $state(false);

	$effect(() => {
		animationDirection = previousLife > player.life ? -1 : previousLife < player.life ? 1 : 0;
		previousLife = player.life;
	});

	async function startEditing() {
		isEditing = true;
		inputValue = player.life;
		// Wait for the DOM to update, then focus the input
		await tick();
		inputElement?.select();
	}

	function applyEdit() {
		if (!isEditing) {
			return;
		}

		if (inputValue > player.life) {
			animationDirection = 1;
		} else if (inputValue < player.life) {
			animationDirection = -1;
		}

		player.life = inputValue;
		inputValue = inputValue; // Keep inputValue in sync
		isEditing = false;
	}
</script>

<div class="flex h-full w-full items-center justify-center">
	<div
		class="relative flex h-full w-full flex-col items-center justify-center border-4 border-neutral-800 bg-neutral-900 p-4 text-white transition-transform duration-300"
		class:rotate-90={rotation === 90}
		class:rotate-180={rotation === 180}
		class:rotate-270={rotation === 270}
	>
		<div class="relative z-10 text-2xl font-bold uppercase md:text-3xl">{player.name}</div>

		<span class="sr-only" aria-live="polite" aria-atomic="true">
			{player.name} life is {player.life}
		</span>

		<button
			class="relative z-10 flex overflow-hidden font-mono text-8xl font-black tracking-tighter md:text-9xl"
			onclick={() => (!isEditing ? startEditing() : undefined)}
			onfocus={!isEditing ? startEditing : undefined}
		>
			<span class="invisible" aria-hidden="true">
				{(isEditing ? inputValue : player.life) || 0}
			</span>
			{#if isEditing}
				<input
					bind:this={inputElement}
					type="number"
					bind:value={inputValue}
					onblur={(e) => {
						e.stopPropagation();
						e.preventDefault();
						applyEdit();
					}}
					onkeydown={(event) => {
						if (event.key === 'Enter') {
							applyEdit();
						}
					}}
					class="absolute h-[1em] w-full appearance-none border-none bg-transparent p-0 text-center text-8xl font-semibold text-white [-moz-appearance:textfield] focus:outline-none md:text-9xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					aria-label="Edit life total"
				/>
			{:else}
				{#each player.life.toString() as digit, i (i * 10 + digit)}
					<div
						class="absolute"
						style={`left: ${i * 0.9167}ch;`}
						in:fly={{ duration: 200, y: animationDirection * 20 }}
						out:fly={{ duration: 200, y: animationDirection * 20 }}
						aria-hidden="true"
					>
						{digit}
					</div>
				{/each}
			{/if}
		</button>

		<div class="absolute inset-0 z-0 flex">
			<button
				onmousedown={() => {
					decrementing = true;
					onDecrement();
				}}
				onmouseup={() => {
					decrementing = false;
				}}
				class={[
					'flex h-full w-1/2 items-center justify-center text-8xl font-black text-white/10 transition-colors duration-200',
					decrementing && 'bg-red-500/5'
				]}
				aria-label="Decrease life for {player.name}"
			>
				-
			</button>
			<button
				onmousedown={() => {
					incrementing = true;
					onIncrement();
				}}
				onmouseup={() => {
					incrementing = false;
				}}
				class={[
					'flex h-full w-1/2 items-center justify-center text-8xl font-black text-white/10 transition-colors duration-200',
					incrementing && 'bg-green-500/5'
				]}
				aria-label="Increase life for {player.name}"
			>
				+
			</button>
		</div>
	</div>
</div>
