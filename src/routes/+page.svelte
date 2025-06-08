<script lang="ts">
	import { press } from '$lib/click.svelte';
	import Counter from '$lib/components/Counter.svelte';
	import PlayerTile from '$lib/components/PlayerTile.svelte';
	import { Player, Timer } from '$lib/player.svelte';
	import { Dialog } from 'bits-ui';
	import { ArrowsCounterClockwise, Pause, Play } from 'phosphor-svelte';

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
	let globalTimer = new Timer({ id: 'global', initialTime: 0, step: 1 });

	function resetGame(completely = false) {
		for (const player of players) {
			player.life = 40;
			player.timer.reset();
			if (completely) {
				player.name = `Player ${player.id + 1}`;
			}
		}
		globalTimer.reset();
	}
  import { browser } from '$app/environment';

  let wakeLock: WakeLockSentinel | null = null;
  let isLocked = $state(false);

  async function requestWakeLock() {
    if (browser && 'wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        isLocked = !wakeLock.released;

        wakeLock.addEventListener('release', () => {
          isLocked = false;
        });
      } catch (err) {
        console.error(`${(err as Error).name}, ${(err as Error).message}`);
      }
    }
  }

  async function handleVisibilityChange() {
    if (browser && document.visibilityState === 'visible' && isLocked) {
      await requestWakeLock();
    }
  }
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} onfullscreenchange={handleVisibilityChange} />

<div class="fixed top-1/2 left-1/2 z-10 flex -translate-1/2 flex-col gap-2">
	<button
		class="cursor-pointer rounded-full bg-neutral-800 p-2 text-white"
		{@attach press({
			click: () => resetGame(),
			longpress: () => {
				resetGame(true);
			}
		})}
	>
		<ArrowsCounterClockwise size="32" />
	</button>

	<Dialog.Root
		onOpenChange={(open) => {
			if (open) {
				for (const player of players) {
					player.timer.pause();
				}
				globalTimer.start();
			} else {
				globalTimer.pause();
			}
		}}
	>
		<Dialog.Trigger
			class="cursor-pointer items-center justify-center rounded-full bg-neutral-800 p-2 text-white"
		>
			<Pause size={32} />
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay
				class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
			/>
			<Dialog.Content
				class="shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex translate-x-[-50%] translate-y-[-50%] flex-col gap-2 rounded-2xl bg-neutral-700 px-16 py-8 text-white outline-hidden"
			>
				<div class="relative flex flex-col items-center justify-center font-mono">
					<span class="invisible" aria-hidden="true">
						{globalTimer.formatted}
					</span>
					<Counter value={globalTimer.formatted} movement={10} />
				</div>
				<div class="flex items-center justify-center rounded-full bg-neutral-800 p-2">
					{#if globalTimer.isPaused}
						<Play size={32} onclick={globalTimer.start} />
					{:else}
						<Pause size={32} onclick={globalTimer.pause} />
					{/if}
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
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
				onLifeChange={(newLife) => {
					console.log('change');
					player.life = newLife;
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
