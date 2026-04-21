<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getBackendState, runWithBackendRecovery } from '$lib/backend.svelte';
	import { getAuth } from '$lib/auth.svelte';
	import { readCache, removeCache, writeCache } from '$lib/cache';
	import PieChart from '$lib/components/PieChart.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import type { SnapshotEntry } from '$lib/types';

	const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
	const auth = getAuth();
	const backend = getBackendState();

	interface SnapshotData {
		id: string;
		date: string;
		entries: SnapshotEntry[];
	}

	let snapshots = $state<SnapshotData[]>([]);
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state('');
	let showingCachedData = $state(false);
	let initializedUserId = $state<string | null>(null);

	$effect(() => {
		const userId = auth.user?.id;
		if (!userId || initializedUserId === userId) return;

		initializedUserId = userId;

		const cached = readCache<SnapshotData[]>(getReportsCacheKey(userId), CACHE_TTL_MS);
		if (cached) {
			snapshots = cached;
			showingCachedData = true;
			loading = false;
		}

		loadSnapshots();
	});

	async function loadSnapshots() {
		const userId = auth.user?.id;
		if (!userId) return;

		const hasExistingData = snapshots.length > 0;
		loading = !hasExistingData;
		refreshing = hasExistingData;
		loadError = '';

		try {
			const { data } = await runWithBackendRecovery(() =>
				supabase
					.from('snapshots')
					.select('*, snapshot_entries(*)')
					.eq('user_id', userId)
					.order('date', { ascending: true })
			);

			snapshots = (data ?? []).map((s: any) => ({
				id: s.id,
				date: s.date,
				entries: s.snapshot_entries as SnapshotEntry[]
			}));
			showingCachedData = false;

			if (snapshots.length > 0) {
				writeCache(getReportsCacheKey(userId), snapshots);
			} else {
				removeCache(getReportsCacheKey(userId));
			}
		} catch (error) {
			loadError = error instanceof Error ? error.message : '載入失敗';
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	function getReportsCacheKey(userId: string) {
		return `reports:${userId}`;
	}

	let latest = $derived(snapshots.length > 0 ? snapshots[snapshots.length - 1] : null);
	let previous = $derived(snapshots.length > 1 ? snapshots[snapshots.length - 2] : null);

	function sumEntries(entries: SnapshotEntry[], categories: string[]): number {
		return entries.filter((e) => categories.includes(e.category)).reduce((s, e) => s + e.twd_amount, 0);
	}

	// Pie chart 1: asset allocation
	let allocationLabels = ['股票', '現金', '定存', '外幣現金'];
	let allocationColors = ['#a855f7', '#3b82f6', '#22c55e', '#f59e0b'];
	let allocationData = $derived(
		latest
			? [
					sumEntries(latest.entries, ['stock_tw', 'stock_us', 'stock_uk']),
					sumEntries(latest.entries, ['cash']),
					sumEntries(latest.entries, ['deposit']),
					sumEntries(latest.entries, ['forex_usd', 'forex_jpy'])
				]
			: []
	);

	// Pie chart 2: stock market allocation
	let stockLabels = ['台股', '美股', '英股'];
	let stockColors = ['#a855f7', '#3b82f6', '#f59e0b'];
	let stockData = $derived(
		latest
			? [
					sumEntries(latest.entries, ['stock_tw']),
					sumEntries(latest.entries, ['stock_us']),
					sumEntries(latest.entries, ['stock_uk'])
				]
			: []
	);
	let hasStockData = $derived(stockData.some((v) => v > 0));

	// Line chart: trend
	let trendLabels = $derived(snapshots.map((s) => s.date.slice(5).replace('-', '/')));
	let trendDatasets = $derived(
		snapshots.length > 0
			? [
					{
						label: '總資產',
						data: snapshots.map((s) => s.entries.reduce((sum, e) => sum + e.twd_amount, 0)),
						color: '#111827',
						bold: true
					},
					{
						label: '股票',
						data: snapshots.map((s) => sumEntries(s.entries, ['stock_tw', 'stock_us', 'stock_uk'])),
						color: '#a855f7'
					},
					{
						label: '現金',
						data: snapshots.map((s) => sumEntries(s.entries, ['cash'])),
						color: '#3b82f6'
					},
					{
						label: '定存',
						data: snapshots.map((s) => sumEntries(s.entries, ['deposit'])),
						color: '#22c55e'
					},
					{
						label: '外幣現金',
						data: snapshots.map((s) => sumEntries(s.entries, ['forex_usd', 'forex_jpy'])),
						color: '#f59e0b'
					}
				]
			: []
	);

	// Detail table
	interface DetailRow {
		label: string;
		twd: number;
		pct: number;
		diff: number | null;
	}

	let detailRows = $derived.by(() => {
		if (!latest) return [];

		const totalTwd = latest.entries.reduce((s, e) => s + e.twd_amount, 0);
		const groups = [
			{ label: '台股', categories: ['stock_tw'] },
			{ label: '美股', categories: ['stock_us'] },
			{ label: '英股', categories: ['stock_uk'] },
			{ label: '現金', categories: ['cash'] },
			{ label: '定存', categories: ['deposit'] },
			{ label: '外幣現金', categories: ['forex_usd', 'forex_jpy'] }
		];

		return groups.map((g): DetailRow => {
			const twd = sumEntries(latest!.entries, g.categories);
			const prevTwd = previous ? sumEntries(previous.entries, g.categories) : null;
			return {
				label: g.label,
				twd,
				pct: totalTwd > 0 ? (twd / totalTwd) * 100 : 0,
				diff: prevTwd !== null ? twd - prevTwd : null
			};
		});
	});

	function formatTwd(value: number): string {
		return new Intl.NumberFormat('zh-TW').format(Math.round(value));
	}

	function formatDiff(value: number | null): string {
		if (value === null) return '—';
		const prefix = value > 0 ? '+' : '';
		return prefix + formatTwd(value);
	}

	function diffColor(value: number | null): string {
		if (value === null) return 'text-gray-400 dark:text-gray-500';
		if (value > 0) return 'text-green-600 dark:text-green-400';
		if (value < 0) return 'text-red-600 dark:text-red-400';
		return 'text-gray-400 dark:text-gray-500';
	}
</script>

<div class="mx-auto min-h-screen max-w-md bg-gray-50 px-4 pt-6 pb-24 dark:bg-gray-900">
	<h1 class="mb-6 text-lg font-bold text-gray-900 dark:text-white">報表</h1>

	{#if showingCachedData || refreshing}
		<div class="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-200">
			{refreshing ? '顯示的是上次成功資料，正在同步最新內容。' : '目前顯示的是上次成功資料。'}
		</div>
	{/if}

	{#if loading}
		<div class="space-y-4">
			{#each Array.from({ length: 3 }) as _, index}
				<div
					class="animate-pulse rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
					aria-hidden={index >= 0}
				>
					<div class="mb-4 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
					<div class="h-48 rounded bg-gray-200 dark:bg-gray-700"></div>
				</div>
			{/each}
		</div>
		<p class="mt-5 text-center text-sm text-gray-400 dark:text-gray-500">
			{backend.isPending ? '資料服務正在喚醒，圖表會在連線後自動載入。' : '載入中...'}
		</p>
	{:else if loadError}
		<div class="py-20 text-center">
			<p class="text-gray-700 dark:text-gray-200">暫時無法載入報表</p>
			<p class="mt-1 text-sm text-gray-400 dark:text-gray-500">{loadError}</p>
			<button
				onclick={loadSnapshots}
				class="mt-4 rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700"
			>
				重新載入
			</button>
		</div>
	{:else if snapshots.length === 0}
		<div class="py-20 text-center">
			<p class="text-gray-500 dark:text-gray-400">尚無資料</p>
			<p class="mt-1 text-sm text-gray-400 dark:text-gray-500">新增快照後即可查看報表</p>
		</div>
	{:else}
		<div class="space-y-6">
			<div class="space-y-4">
				<div class="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
					<PieChart
						title="資產配置"
						labels={allocationLabels}
						data={allocationData}
						colors={allocationColors}
					/>
				</div>
				<div class="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
					{#if hasStockData}
						<PieChart
							title="股票比例"
							labels={stockLabels}
							data={stockData}
							colors={stockColors}
						/>
					{:else}
						<h3 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">股票比例</h3>
						<p class="py-8 text-center text-xs text-gray-400 dark:text-gray-500">無股票資產</p>
					{/if}
				</div>
			</div>

			<div class="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
				{#if snapshots.length >= 2}
					<LineChart
						title="資產趨勢"
						labels={trendLabels}
						datasets={trendDatasets}
					/>
				{:else}
					<h3 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">資產趨勢</h3>
					<p class="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
						新增更多快照以查看趨勢
					</p>
				{/if}
			</div>

			<div class="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400">
							<th class="px-4 py-2">類別</th>
							<th class="px-4 py-2 text-right">金額 (TWD)</th>
							<th class="px-4 py-2 text-right">比例</th>
							<th class="px-4 py-2 text-right">變動</th>
						</tr>
					</thead>
					<tbody>
						{#each detailRows as row}
							<tr class="border-b border-gray-200 last:border-0 dark:border-gray-700">
								<td class="px-4 py-2 text-gray-700 dark:text-gray-300">{row.label}</td>
								<td class="px-4 py-2 text-right text-gray-900 dark:text-white">{formatTwd(row.twd)}</td>
								<td class="px-4 py-2 text-right text-gray-500 dark:text-gray-400">{row.pct.toFixed(1)}%</td>
								<td class="px-4 py-2 text-right {diffColor(row.diff)}">{formatDiff(row.diff)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
