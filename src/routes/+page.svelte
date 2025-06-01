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
					id: i,
					name: `Player ${i + 1}`,
					life: 40,
					rotation: layouts[playerCount].players[i].rotation,
					gridArea: layouts[playerCount].players[i].gridArea,
					initialTime: 15 * 60
				})
		)
	);
</script>

<div class="fixed top-1/2 left-1/2 z-10 flex -translate-1/2 flex-col gap-2">
	<button
		class="cursor-pointer rounded-full bg-neutral-800 p-2 text-white"
		onclick={() => {
			for (const player of players) {
				player.life = 40;
				player.timer.reset();
			}
		}}
	>
		<!-- Restart -->
		<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="size-8" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"
			/>
			<path
				d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"
			/>
		</svg>
	</button>
	<button
		class="cursor-pointer rounded-full bg-neutral-800 p-2 text-white"
		onclick={() => {
			for (const player of players) {
				player.life = 40;
				player.timer.pause();
			}
		}}
	>
		<!-- Pause -->
		<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="size-8" viewBox="0 0 16 16">
			<path
				d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"
			/>
		</svg>
	</button>
	<!-- <label class="text-white" for="player-select">Players: </label> -->
	<!-- <select class="rounded bg-neutral-700 p-2 text-white" bind:value={playerCount}> -->
	<!-- 	<option value={2}>2</option> -->
	<!-- 	<option value={3}>3</option> -->
	<!-- 	<option value={4}>4</option> -->
	<!-- 	<option value={5}>5</option> -->
	<!-- </select> -->
</div>

<div class="grid h-svh w-screen grid-cols-6 grid-rows-6 bg-neutral-900">
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
				onTimerClick={() => {
					for (const p of players) {
						if (p.id === player.id) {
							p.timer.start();
						} else {
							p.timer.pause();
						}
					}
				}}
			/>
		</div>
	{/each}
</div>
