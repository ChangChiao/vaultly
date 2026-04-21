<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getBackendState, runWithBackendRecovery } from '$lib/backend.svelte';
	import { getAuth } from '$lib/auth.svelte';
	import { readCache, removeCache, writeCache } from '$lib/cache';
	import type { SnapshotWithEntries, SnapshotEntry } from '$lib/types';

	const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
	const auth = getAuth();
	const backend = getBackendState();

	let snapshots = $state<SnapshotWithEntries[]>([]);
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state('');
	let showingCachedData = $state(false);
	let initializedUserId = $state<string | null>(null);

	$effect(() => {
		const userId = auth.user?.id;
		if (!userId || initializedUserId === userId) return;

		initializedUserId = userId;

		const cached = readCache<SnapshotWithEntries[]>(getSnapshotsCacheKey(userId), CACHE_TTL_MS);
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
					.order('date', { ascending: false })
			);

			snapshots = (data ?? []).map((s: any) => ({
				...s,
				entries: s.snapshot_entries as SnapshotEntry[]
			}));
			showingCachedData = false;

			if (snapshots.length > 0) {
				writeCache(getSnapshotsCacheKey(userId), snapshots);
			} else {
				removeCache(getSnapshotsCacheKey(userId));
			}
		} catch (error) {
			loadError = error instanceof Error ? error.message : '載入失敗';
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	function getSnapshotsCacheKey(userId: string) {
		return `snapshots:${userId}`;
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

<div class="mx-auto min-h-screen max-w-md bg-gray-50 dark:bg-gray-900">
	<div class="px-4 pt-6 pb-24">
		<h1 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">所有快照</h1>

		{#if showingCachedData || refreshing}
			<div class="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-200">
				{refreshing ? '顯示的是上次成功資料，正在同步最新內容。' : '目前顯示的是上次成功資料。'}
			</div>
		{/if}

		{#if loading}
			<div class="space-y-3">
				{#each Array.from({ length: 4 }) as _, index}
					<div
						class="animate-pulse rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
						aria-hidden={index >= 0}
					>
						<div class="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
						<div class="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
					</div>
				{/each}
			</div>
			<p class="mt-5 text-center text-sm text-gray-400 dark:text-gray-500">
				{backend.isPending ? '資料服務正在喚醒，正在為你重試。' : '載入中...'}
			</p>
		{:else if loadError}
			<div class="py-20 text-center">
				<p class="text-gray-700 dark:text-gray-200">暫時無法載入快照</p>
				<p class="mt-1 text-sm text-gray-400 dark:text-gray-500">{loadError}</p>
				<button
					onclick={loadSnapshots}
					class="mt-4 rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700"
				>
					重新載入
				</button>
			</div>
		{:else if snapshots.length === 0}
			<div class="flex flex-col items-center justify-center py-20">
				<p class="mb-2 text-gray-500 dark:text-gray-400">尚無快照紀錄</p>
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
						class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-800"
					>
						<div>
							<p class="font-medium text-gray-900 dark:text-white">{formatDate(snap.date)}</p>
							<p class="text-xs text-gray-400 dark:text-gray-500">{snap.entries.length} 筆資產項目</p>
						</div>
						<div class="text-right">
							<p class="font-semibold text-gray-900 dark:text-white">{formatTwd(getTotal(snap.entries))}</p>
							<p class="text-xs text-gray-400 dark:text-gray-500">TWD</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
