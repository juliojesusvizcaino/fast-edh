<script lang="ts">
	import { type Player } from '$lib/player.svelte';
	import { tick } from 'svelte';
	import Counter from './Counter.svelte';

	let {
		player,
		rotation,
		onDecrement,
		onIncrement,
    onTimerClick,
	}: {
		player: Player;
		rotation: 0 | 90 | 180 | 270;
		onDecrement: () => void;
		onIncrement: () => void;
		onTimerClick: () => void;
	} = $props();

	let isEditing = $state(false);
	let inputValue = $state(player.life);
	let inputElement: HTMLInputElement | null = $state(null);

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

		player.life = inputValue;
		inputValue = inputValue; // Keep inputValue in sync
		isEditing = false;
	}
</script>

<div class="flex h-full w-full items-center justify-center">
	<div
		class="relative flex h-full w-full flex-col items-center justify-around p-4 text-white transition-transform duration-300"
		class:rotate-90={rotation === 90}
		class:rotate-180={rotation === 180}
		class:rotate-270={rotation === 270}
	>
		<div class="pointer-events-none z-10 text-2xl font-bold uppercase p-4">
			{player.name}
		</div>

		<span class="sr-only" aria-live="polite" aria-atomic="true">
			{player.name} life is {player.life}
		</span>

		<button
			class="absolute top-1/2 left-1/2 -translate-1/2 z-10 flex items-center font-mono text-[clamp(1rem,8vh,6rem)] font-black"
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
					class="absolute h-[1em] w-full appearance-none border-none bg-transparent p-0 text-center text-[clamp(1rem,8vh,6rem)] font-semibold text-white [-moz-appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					aria-label="Edit life total"
				/>
			{:else}
        <Counter value={player.life.toString()} />
			{/if}
		</button>

		<button
			onclick={onTimerClick}
			class="z-10 mt-auto cursor-pointer rounded-lg bg-neutral-800 p-4">{player.timer.formatted}</button
		>

		<div class="absolute inset-0 z-0 flex">
			<button
				onclick={onDecrement}
				class="flex h-full w-1/2 items-center justify-center text-4xl font-black text-white/10 transition-colors duration-200 active:bg-red-500/5 rounded-l-3xl"
				aria-label="Decrease life for {player.name}"
			>
				-
			</button>
			<button
				onclick={onIncrement}
				class="flex h-full w-1/2 items-center justify-center text-4xl font-black text-white/10 transition-colors duration-200 active:bg-green-500/5 rounded-r-3xl"
				aria-label="Increase life for {player.name}"
			>
				+
			</button>
		</div>
	</div>
</div>
