<script lang="ts">
	import SnapshotForm from '$lib/components/SnapshotForm.svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CATEGORIES, type Category } from '$lib/types';

	const snapshotId = page.params.id;

	let initialDate = $state<string>();
	let initialAmounts = $state<Record<Category, number>>();
	let loading = $state(true);
	let showDeleteConfirm = $state(false);

	$effect(() => {
		loadSnapshot();
	});

	async function loadSnapshot() {
		const { data } = await supabase
			.from('snapshots')
			.select('*, snapshot_entries(*)')
			.eq('id', snapshotId)
			.single();

		if (data) {
			initialDate = data.date;
			const amounts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
			for (const entry of data.snapshot_entries) {
				amounts[entry.category as Category] = entry.original_amount;
			}
			initialAmounts = amounts;
		}
		loading = false;
	}

	async function handleSave(data: { date: string; entries: { category: Category; amount: number; currency: string; rate: number; twd: number }[] }) {
		const { error: snapError } = await supabase
			.from('snapshots')
			.update({ date: data.date })
			.eq('id', snapshotId);

		if (snapError) throw new Error(snapError.message);

		// Delete old entries and insert new ones
		await supabase.from('snapshot_entries').delete().eq('snapshot_id', snapshotId);

		const entries = data.entries.map((e) => ({
			snapshot_id: snapshotId,
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

	async function handleDelete() {
		await supabase.from('snapshots').delete().eq('id', snapshotId);
		goto('/');
	}
</script>

<div class="mx-auto min-h-screen max-w-md bg-white px-4 py-6 dark:bg-gray-900">
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center">
			<a href="/" class="mr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">←</a>
			<h1 class="text-lg font-bold text-gray-900 dark:text-white">編輯快照</h1>
		</div>
		<button
			onclick={() => (showDeleteConfirm = true)}
			class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
		>
			刪除
		</button>
	</div>

	{#if loading}
		<p class="text-center text-gray-400 dark:text-gray-500">載入中...</p>
	{:else if initialDate && initialAmounts}
		<SnapshotForm
			{initialDate}
			{initialAmounts}
			onSave={handleSave}
			submitLabel="更新快照"
		/>
	{/if}

	{#if showDeleteConfirm}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="mx-4 w-full max-w-xs rounded-xl bg-white p-6 dark:bg-gray-800">
				<p class="mb-4 text-center text-gray-900 dark:text-white">確定要刪除這筆快照嗎？</p>
				<div class="flex gap-3">
					<button
						onclick={() => (showDeleteConfirm = false)}
						class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-600 dark:text-gray-300"
					>
						取消
					</button>
					<button
						onclick={handleDelete}
						class="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white"
					>
						刪除
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
