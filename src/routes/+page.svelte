<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	let { data } = $props();

	async function createNewMatch() {
		const { data, error } = await supabase.from('match').insert([{}]).select();

		if (error) {
			throw new Error(error.message);
		}
		invalidate('app:matches');
	}
</script>

<div class="flex min-h-dvh flex-col items-center justify-around gap-4 p-8">
	<button onclick={createNewMatch} class="cursor-pointer rounded-2xl bg-neutral-300 p-4">New</button
	>

	<ul class="flex flex-col gap-2">
		{#each data.matches as match (match.id)}
			<li class="flex">
				<a href={`/match/${match.id}`} class="rounded-2xl bg-neutral-300 p-4">{match.id}</a>
			</li>
		{/each}
	</ul>
</div>
