<script lang="ts">
	import SnapshotForm from '$lib/components/SnapshotForm.svelte';
	import { supabase } from '$lib/supabase';
	import { getAuth } from '$lib/auth.svelte';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/types';

	const auth = getAuth();

	async function handleSave(data: { date: string; entries: { category: Category; amount: number; currency: string; rate: number; twd: number }[] }) {
		const userId = auth.user?.id;
		if (!userId) throw new Error('未登入');

		// Check duplicate date
		const { data: existing } = await supabase
			.from('snapshots')
			.select('id')
			.eq('user_id', userId)
			.eq('date', data.date)
			.maybeSingle();

		if (existing) {
			throw new Error(`${data.date} 已有快照紀錄`);
		}

		const { data: snapshot, error: snapError } = await supabase
			.from('snapshots')
			.insert({ user_id: userId, date: data.date })
			.select()
			.single();

		if (snapError) throw new Error(snapError.message);

		const entries = data.entries.map((e) => ({
			snapshot_id: snapshot.id,
			category: e.category,
			original_amount: e.amount,
			original_currency: e.currency,
			exchange_rate: e.rate,
			twd_amount: e.twd
		}));

		const { error: entryError } = await supabase.from('snapshot_entries').insert(entries);
		if (entryError) throw new Error(entryError.message);

		goto('/');
	}
</script>

<div class="mx-auto min-h-screen max-w-md bg-white px-4 py-6">
	<div class="mb-6 flex items-center">
		<a href="/" class="mr-3 text-gray-400 hover:text-gray-600">←</a>
		<h1 class="text-lg font-bold text-gray-900">新增快照</h1>
	</div>

	<SnapshotForm onSave={handleSave} />
</div>
