<script lang="ts">
	import type { Player } from '$lib/player.svelte';

	let { player, rotation, onDecrement, onIncrement } = $props<{
		player: Player;
		rotation: 0 | 90 | 180 | 270;
		onDecrement: () => void;
		onIncrement: () => void;
	}>();
</script>

<div class="flex h-full w-full items-center justify-center">
	<div
		class="flex h-full w-full flex-col items-center justify-center border-4 border-neutral-800 bg-neutral-900 p-4 text-white transition-transform duration-300"
		class:rotate-90={rotation === 90}
		class:rotate-180={rotation === 180}
		class:rotate-270={rotation === 270}
	>
		<div class="text-2xl font-bold uppercase md:text-3xl">{player.name}</div>
		<div class="text-8xl font-black tracking-tighter md:text-9xl">{player.life}</div>
		<div class="mt-4 flex gap-4">
			<button
				onclick={onDecrement}
				class="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-4xl font-bold active:bg-red-700"
				aria-label="Decrease life for {player.name}">-</button
			>
			<button
				onclick={onIncrement}
				class="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-4xl font-bold active:bg-green-700"
				aria-label="Increase life for {player.name}">+</button
			>
		</div>
	</div>
</div>
