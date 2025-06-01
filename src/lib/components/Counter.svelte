<script lang="ts">
	import { fly } from 'svelte/transition';

	let { value, movement = 40 }: { value: string; movement?: number } = $props();

	let previousValue = $state(value);
	let animationDirection = $state(0);

	$effect.pre(() => {
		animationDirection = previousValue > value ? -1 : previousValue < value ? 1 : 0;

		previousValue = value;
	});
</script>

{#each value.toString() as digit, i (i * 10 + digit)}
	<div
		class="absolute"
		style={`left: ${i}ch;`}
		in:fly={{ duration: 200, y: -animationDirection * movement }}
		out:fly={{ duration: 200, y: animationDirection * movement }}
		aria-hidden="true"
	>
		{digit}
	</div>
{/each}
