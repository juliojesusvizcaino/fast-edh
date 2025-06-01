<script lang="ts">
	import { fly } from 'svelte/transition';

	let { value }: { value: string } = $props();

	console.log('counter');

	let previousValue = $state(value);
	let animationDirection = $state(0);

	$effect.pre(() => {
		/**
		 * This effect function runs whenever `value` changes.
		 * 1. Calculate the direction by comparing the new `value`
		 * with the `previousValue` from the last run.
		 */
		animationDirection = previousValue > value ? -1 : previousValue < value ? 1 : 0;

		/**
		 * 2. After the calculation, update `previousValue` to the current
		 * value, so it's ready for the *next* change.
		 */
		previousValue = value;
	});

	// $effect(() => {
	// 	previousValue = value;
	// });
</script>

{#each value.toString() as digit, i (i * 10 + digit)}
	<div
		class="absolute"
		style={`left: ${i}ch;`}
		in:fly={{ duration: 200, y: -animationDirection * 40 }}
		out:fly={{ duration: 200, y: animationDirection * 40 }}
		aria-hidden="true"
	>
		{digit}
	</div>
{/each}
