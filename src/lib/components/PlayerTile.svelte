<script lang="ts">
	import { type Player } from '$lib/player.svelte';
	import { tick } from 'svelte';
	import Counter from './Counter.svelte';
	import { press } from '$lib/click.svelte';
	import { fly } from 'svelte/transition';

	let {
		player,
		rotation,
		onLifeChange,
		onTimerClick
	}: {
		player: Player;
		rotation: 0 | 90 | 180 | 270;
		onLifeChange: (quantity: number) => void;
		onTimerClick: () => void;
	} = $props();

	let currentLife = $derived(player.life);

	let timeFraction = $derived(
		Math.min((1 - player.timer.timeSeconds / player.timer.initialTimeSeconds) * 100, 100)
	);

	let lifeChange = $state<number | null>(null);

	class ValueEditor<T> {
		input: T;
		isEditing = $state(false);
		inputElement: HTMLInputElement | null = $state(null);
		setter: (value: T) => void;

		constructor(initialValue: T, setter: (value: T) => void) {
			this.input = $state(initialValue);
			this.setter = setter;
		}

		startEditing = async (value: T) => {
			this.isEditing = true;
			this.input = value;
			// Wait for the DOM to update, then focus the input
			await tick();
			this.inputElement?.select();
		};

		applyEdit = () => {
			if (!this.isEditing) {
				return;
			}

			this.setter(this.input);
			this.isEditing = false;
		};
	}

	let lifeEditor = new ValueEditor(player.life, (value) => {
		player.life = value;
	});

	let nameEditor = new ValueEditor(player.name, (value) => {
		player.name = value;
	});

	let timeout: ReturnType<typeof setTimeout> | undefined = $state();

	function handleLifeChange(quantity: number) {
		clearTimeout(timeout);

		currentLife += quantity;

		lifeChange = currentLife - player.life;

		timeout = setTimeout(() => {
			onLifeChange(currentLife);
			lifeChange = null;
		}, 2000);
	}
</script>

<div
	class="relative flex h-full w-full items-center justify-around p-4 text-white transition-transform duration-300"
	class:flex-col={rotation === 0 || rotation === 180}
	class:flex-row-reverse={rotation === 90}
	class:rotate-180={rotation === 180}
>
	<div
		class="flex size-full items-center justify-around gap-2"
		class:flex-col={rotation === 0 || rotation === 180}
		class:flex-row-reverse={rotation === 90}
	>
		<button
			class="relative z-10 flex p-4 text-2xl font-bold uppercase"
			class:rotate-90={rotation === 90}
			{@attach press({
				longpress: () => {
					if (!nameEditor.isEditing) {
						nameEditor.startEditing(player.name);
					}
				}
			})}
		>
			{#if nameEditor.isEditing}
				<div class="invisible" aria-hidden="true">
					{nameEditor.input}
				</div>
				<input
					bind:this={nameEditor.inputElement}
					type="text"
					bind:value={nameEditor.input}
					onblur={() => {
						nameEditor.applyEdit();
					}}
					onkeydown={(event) => {
						if (event.key === 'Enter') {
							nameEditor.applyEdit();
						}
					}}
					class="absolute top-1/2 left-1/2 h-[1em] w-full -translate-1/2 appearance-none border-none bg-transparent p-0 text-center text-2xl font-semibold text-white uppercase [-moz-appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					aria-label="Edit life total"
				/>
			{:else}
				<div>
					{player.name}
				</div>
			{/if}
		</button>

		<span class="sr-only" aria-live="polite" aria-atomic="true">
			{player.name} life is {player.life}
		</span>

		<button
			class="absolute top-1/2 left-1/2 z-10 flex -translate-1/2 items-center font-mono text-[clamp(1rem,8vh,6rem)] font-black"
			class:rotate-90={rotation === 90}
			{@attach press({
				longpress: () => {
					if (!lifeEditor.isEditing) {
						lifeEditor.startEditing(currentLife);
					}
				}
			})}
		>
			<span class="invisible" aria-hidden="true">
				{(lifeEditor.isEditing ? lifeEditor.input : currentLife) || 0}
			</span>
			{#if lifeChange !== null}
				<div
					class="absolute -top-2 left-1/2 -translate-x-1/2 text-sm opacity-50"
					transition:fly={{ y: 20 }}
				>
					{lifeChange.toLocaleString('en', { signDisplay: 'exceptZero' })}
				</div>
			{/if}
			{#if lifeEditor.isEditing}
				<input
					bind:this={lifeEditor.inputElement}
					type="number"
					bind:value={lifeEditor.input}
					onblur={() => {
						lifeEditor.applyEdit();
					}}
					onkeydown={(event) => {
						console.log('keydown', event.key);
						if (event.key === 'Enter') {
							lifeEditor.applyEdit();
						}
					}}
					class="absolute h-[1em] w-full appearance-none border-none bg-transparent p-0 text-center text-[clamp(1rem,8vh,6rem)] font-semibold text-white [-moz-appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					aria-label="Edit life total"
				/>
			{:else}
				<Counter value={currentLife.toString()} />
			{/if}
		</button>

		<button
			onclick={onTimerClick}
			class={[
				'z-10 cursor-pointer overflow-hidden rounded-lg p-4 font-mono',
				player.timer.isPaused ? 'bg-neutral-800' : 'bg-neutral-600'
			]}
			class:rotate-90={rotation === 90}
		>
			<div class="relative flex">
				<span class="invisible" aria-hidden="true">
					{player.timer.formatted}
				</span>
				<Counter value={player.timer.formatted} movement={10} />
			</div>
		</button>
	</div>

	<div
		class="pointer-events-none absolute bottom-0 left-0 w-full opacity-50 transition-all duration-500 ease-in-out"
		style:height={[0, 180].includes(rotation) ? `${timeFraction}%` : '100%'}
		style:width={[90, 270].includes(rotation) ? `${timeFraction}%` : '100%'}
		style:background-color={`color-mix(in oklch, var(--color-neutral-700) ${100 - timeFraction}%, var(--color-amber-700) ${timeFraction}%)`}
	></div>

	<div
		class="absolute inset-0 grid overflow-hidden rounded-3xl"
		class:grid-cols-2={rotation === 0 || rotation === 180}
		class:grid-rows-2={rotation === 90}
	>
		<button
			class="flex size-full items-center justify-center text-4xl font-black text-white/10 transition-colors duration-200 select-none active:bg-red-500/5"
			aria-label="Decrease life for {player.name}"
			{@attach press({
				click: () => handleLifeChange(-1),
				longpress: () => handleLifeChange(-10)
			})}
		>
			<div class:rotate-90={rotation === 90}>-</div>
		</button>
		<button
			class="flex size-full items-center justify-center text-4xl font-black text-white/10 transition-colors duration-200 select-none active:bg-green-500/5"
			aria-label="Increase life for {player.name}"
			class:rotate-90={rotation === 90}
			{@attach press({
				click: () => handleLifeChange(1),
				longpress: () => handleLifeChange(10)
			})}
		>
			<div class:rotate-90={rotation === 90}>
			+
      </div>
		</button>
	</div>
</div>
