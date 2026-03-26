<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getAuth, signOut } from '$lib/auth.svelte';
	import { goto } from '$app/navigation';
	import AssetCard from '$lib/components/AssetCard.svelte';
	import type { SnapshotEntry, SnapshotWithEntries } from '$lib/types';

	const auth = getAuth();

	let snapshot = $state<SnapshotWithEntries | null>(null);
	let loading = $state(true);

	$effect(() => {
		if (auth.user) loadLatestSnapshot();
	});

	async function loadLatestSnapshot() {
		const { data } = await supabase
			.from('snapshots')
			.select('*, snapshot_entries(*)')
			.eq('user_id', auth.user!.id)
			.order('date', { ascending: false })
			.limit(1)
			.maybeSingle();

		snapshot = data
			? { ...data, entries: data.snapshot_entries as SnapshotEntry[] }
			: null;
		loading = false;
	}

	function formatTwd(value: number): string {
		return new Intl.NumberFormat('zh-TW').format(Math.round(value));
	}

	function formatDate(date: string): string {
		return date.replace(/-/g, '/');
	}

	let totalTwd = $derived(
		snapshot?.entries.reduce((sum, e) => sum + e.twd_amount, 0) ?? 0
	);

	interface CardGroup {
		name: string;
		color: string;
		subtitle: string;
		categories: string[];
	}

	const cardGroups: CardGroup[] = [
		{ name: '股票', color: 'bg-purple-500', subtitle: '台股、美股、英股', categories: ['stock_tw', 'stock_us', 'stock_uk'] },
		{ name: '現金', color: 'bg-blue-500', subtitle: '台幣', categories: ['cash'] },
		{ name: '定存', color: 'bg-green-500', subtitle: '台幣', categories: ['deposit'] },
		{ name: '基金', color: 'bg-teal-500', subtitle: '台幣', categories: ['fund'] },
		{ name: '外幣現金', color: 'bg-amber-500', subtitle: 'USD、JPY', categories: ['forex_usd', 'forex_jpy'] }
	];

	function getGroupEntries(categories: string[]): SnapshotEntry[] {
		return snapshot?.entries.filter((e) => categories.includes(e.category)) ?? [];
	}

	function getGroupTotal(categories: string[]): number {
		return getGroupEntries(categories).reduce((sum, e) => sum + e.twd_amount, 0);
	}

	async function handleSignOut() {
		await signOut();
		goto('/login');
	}
</script>

<div class="mx-auto min-h-screen max-w-md bg-gray-50">
	{#if loading}
		<div class="flex min-h-screen items-center justify-center">
			<p class="text-gray-400">載入中...</p>
		</div>
	{:else if !snapshot}
		<div class="flex min-h-screen flex-col items-center justify-center px-4">
			<p class="mb-2 text-lg text-gray-500">尚無資產紀錄</p>
			<p class="mb-6 text-sm text-gray-400">建立第一筆快照，開始追蹤你的資產</p>
			<a
				href="/snapshot/new"
				class="rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700"
			>
				+ 新增快照
			</a>
		</div>
	{:else}
		<div class="px-4 pt-6 pb-24">
			<div class="mb-6 flex items-start justify-between">
				<div>
					<div class="flex items-center gap-2">
						<p class="text-sm text-gray-500">我的淨資產 (TWD)</p>
						<button onclick={handleSignOut} class="text-xs text-gray-400 hover:text-gray-600">登出</button>
					</div>
					<p class="text-3xl font-bold text-gray-900">
						{formatTwd(totalTwd)}
					</p>
				</div>
				<a
					href="/snapshot/new"
					class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-xl text-white shadow-lg hover:bg-purple-700"
				>
					+
				</a>
			</div>

			<div class="space-y-3">
				{#each cardGroups as group}
					<AssetCard
						name={group.name}
						color={group.color}
						subtitle={group.subtitle}
						totalTwd={getGroupTotal(group.categories)}
						lastDate={formatDate(snapshot.date)}
						entries={getGroupEntries(group.categories)}
					/>
				{/each}
			</div>

			<div class="mt-4 text-center">
				<a
					href="/snapshot/edit/{snapshot.id}"
					class="text-sm text-purple-600 hover:text-purple-800"
				>
					編輯此快照
				</a>
			</div>
		</div>
	{/if}
</div>
