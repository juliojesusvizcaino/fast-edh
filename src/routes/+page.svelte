<script lang="ts">
	import PlayerTile from '$lib/components/PlayerTile.svelte';
	import { Player } from '$lib/player.svelte';

	const layouts = {
		2: {
			gridClass: 'grid grid-rows-2',
			players: [
				{ rotation: 0, gridArea: '2 / 1' }, // Bottom
				{ rotation: 180, gridArea: '1 / 1' } // Top
			]
		},
		3: {
			gridClass: 'grid grid-cols-2 grid-rows-2',
			players: [
				{ rotation: 90, gridArea: '1 / 1 / 8 / 8' }, // Bottom-Left
				{ rotation: 270, gridArea: '2 / 2' }, // Bottom-Right
				{ rotation: 270, gridArea: '1 / 1 / span 1 / span 2' } // Top-Center
			]
		},
		4: {
			gridClass: 'grid grid-cols-2 grid-rows-2',
			players: [
				{ rotation: 180, gridArea: '1 / 1 / 4 / 4' },
				{ rotation: 180, gridArea: '1 / 4 / 4 / 8' },
				{ rotation: 0, gridArea: '4 / 4 / 8 / 8' },
				{ rotation: 0, gridArea: '4 / 1/ 8/ 4' }
			]
		},
		5: {
			gridClass: 'grid grid-rows-2', // Two main rows
			// We will handle the nested grid for this case directly in the template
			players: [
				// Bottom two players (no rotation)
				{ rotation: 0, gridArea: '' },
				{ rotation: 0, gridArea: '' },
				// Top three players (rotated)
				{ rotation: 180, gridArea: '' },
				{ rotation: 180, gridArea: '' },
				{ rotation: 180, gridArea: '' }
			]
		}
	} as const;

	let playerCount: 2 | 3 | 4 | 5 = $state(4);
	let players = $derived(
		Array.from(
			{ length: playerCount },
			(_, i) =>
				new Player({
					id: i + 1,
					name: `Player ${i + 1}`,
					life: 40,
					rotation: layouts[playerCount].players[i].rotation,
					gridArea: layouts[playerCount].players[i].gridArea
				})
		)
	);
	let innerWidth = $state(0);
	let innerHeight = $state(0);

	let isWider = $derived(innerWidth > innerHeight);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="fixed top-1/2 left-1/2 z-10 -translate-1/2">
	<label class="text-white" for="player-select">Players: </label>
	<select class="rounded bg-neutral-700 p-2 text-white" bind:value={playerCount}>
		<option value={2}>2</option>
		<option value={3}>3</option>
		<option value={4}>4</option>
		<option value={5}>5</option>
	</select>
</div>

<div class={['grid h-svh w-screen grid-cols-6 grid-rows-6 bg-black', !isWider && 'rotate-90']}>
	{#each players as player (player.id)}
		<div style="grid-area: {player.gridArea};">
			<PlayerTile
				{player}
				rotation={player.rotation}
				onIncrement={() => {
					player.life += 1;
				}}
				onDecrement={() => {
					player.life -= 1;
				}}
			/>
		</div>
	{/each}
</div>
