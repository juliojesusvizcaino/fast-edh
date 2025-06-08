import { supabase } from '$lib/supabaseClient';

export async function load({ depends }) {
	const { data: matches, error } = await supabase.from('match').select('*');

	depends('app:matches');

	if (error) {
		throw new Error(error.message);
	}

	if (!matches) {
		throw new Error('No matches');
	}

	return {
		matches
	};
}
