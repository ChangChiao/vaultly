<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getAuth } from '$lib/auth.svelte';
	import type { SnapshotWithEntries, SnapshotEntry } from '$lib/types';

	const auth = getAuth();

	let snapshots = $state<SnapshotWithEntries[]>([]);
	let loading = $state(true);

	$effect(() => {
		if (auth.user) loadSnapshots();
	});

	async function loadSnapshots() {
		const { data } = await supabase
			.from('snapshots')
			.select('*, snapshot_entries(*)')
			.eq('user_id', auth.user!.id)
			.order('date', { ascending: false });

		snapshots = (data ?? []).map((s) => ({
			...s,
			entries: s.snapshot_entries as SnapshotEntry[]
		}));
		loading = false;
	}

	function formatTwd(value: number): string {
		return new Intl.NumberFormat('zh-TW').format(Math.round(value));
	}

	function formatDate(date: string): string {
		return date.replace(/-/g, '/');
	}

	function getTotal(entries: SnapshotEntry[]): number {
		return entries.reduce((sum, e) => sum + e.twd_amount, 0);
	}
</script>

<div class="mx-auto min-h-screen max-w-md bg-gray-50">
	<div class="px-4 pt-6 pb-24">
		<h1 class="mb-4 text-lg font-bold text-gray-900">所有快照</h1>

		{#if loading}
			<p class="text-center text-gray-400">載入中...</p>
		{:else if snapshots.length === 0}
			<div class="flex flex-col items-center justify-center py-20">
				<p class="mb-2 text-gray-500">尚無快照紀錄</p>
				<a
					href="/snapshot/new"
					class="mt-4 rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700"
				>
					+ 新增快照
				</a>
			</div>
		{:else}
			<div class="space-y-3">
				{#each snapshots as snap}
					<a
						href="/snapshot/edit/{snap.id}"
						class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
					>
						<div>
							<p class="font-medium text-gray-900">{formatDate(snap.date)}</p>
							<p class="text-xs text-gray-400">{snap.entries.length} 筆資產項目</p>
						</div>
						<div class="text-right">
							<p class="font-semibold text-gray-900">{formatTwd(getTotal(snap.entries))}</p>
							<p class="text-xs text-gray-400">TWD</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
