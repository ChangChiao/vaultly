<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { getBackendState, runWithBackendRecovery } from "$lib/backend.svelte";
  import { getAuth, signOut } from "$lib/auth.svelte";
  import { goto } from "$app/navigation";
  import AssetCard from "$lib/components/AssetCard.svelte";
  import type { SnapshotEntry, SnapshotWithEntries } from "$lib/types";

  const auth = getAuth();
  const backend = getBackendState();

  let snapshot = $state<SnapshotWithEntries | null>(null);
  let loading = $state(true);
  let loadError = $state("");

  $effect(() => {
    if (auth.user) loadLatestSnapshot();
  });

  async function loadLatestSnapshot() {
    loading = true;
    loadError = "";

    try {
      const { data } = await runWithBackendRecovery(() =>
        supabase
          .from("snapshots")
          .select("*, snapshot_entries(*)")
          .eq("user_id", auth.user!.id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      );

      snapshot = data
        ? { ...data, entries: data.snapshot_entries as SnapshotEntry[] }
        : null;
    } catch (error) {
      loadError = error instanceof Error ? error.message : "載入失敗";
    } finally {
      loading = false;
    }
  }

  function formatTwd(value: number): string {
    return new Intl.NumberFormat("zh-TW").format(Math.round(value));
  }

  function formatDate(date: string): string {
    return date.replace(/-/g, "/");
  }

  let totalTwd = $derived(
    snapshot?.entries.reduce((sum, e) => sum + e.twd_amount, 0) ?? 0,
  );

  interface CardGroup {
    name: string;
    color: string;
    subtitle: string;
    categories: string[];
  }

  const cardGroups: CardGroup[] = [
    {
      name: "股票",
      color: "bg-purple-500",
      subtitle: "台股、美股、英股",
      categories: ["stock_tw", "stock_us", "stock_uk"],
    },
    {
      name: "現金",
      color: "bg-blue-500",
      subtitle: "台幣",
      categories: ["cash"],
    },
    {
      name: "定存",
      color: "bg-green-500",
      subtitle: "台幣",
      categories: ["deposit"],
    },
    {
      name: "基金",
      color: "bg-teal-500",
      subtitle: "台幣",
      categories: ["fund"],
    },
    {
      name: "外幣現金",
      color: "bg-amber-500",
      subtitle: "USD、JPY",
      categories: ["forex_usd", "forex_jpy"],
    },
  ];

  function getGroupEntries(categories: string[]): SnapshotEntry[] {
    return (
      snapshot?.entries.filter((e) => categories.includes(e.category)) ?? []
    );
  }

  function getGroupTotal(categories: string[]): number {
    return getGroupEntries(categories).reduce(
      (sum, e) => sum + e.twd_amount,
      0,
    );
  }

  async function handleSignOut() {
    await signOut();
    goto("/login");
  }
</script>

<div class="mx-auto min-h-screen max-w-md bg-gray-50 dark:bg-gray-900">
  {#if loading}
    <div class="px-4 pt-6 pb-24">
      <div class="mb-6 animate-pulse">
        <div class="mb-3 h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
        <div class="h-10 w-48 rounded bg-gray-200 dark:bg-gray-800"></div>
      </div>
      <div class="space-y-3">
        {#each Array.from({ length: 4 }) as _, index}
          <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800" aria-hidden={index >= 0}>
            <div class="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-6 w-36 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        {/each}
      </div>
      <p class="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
        {backend.isPending ? "資料服務正在喚醒，第一次載入可能需要幾十秒。" : "載入中..."}
      </p>
    </div>
  {:else if loadError}
    <div class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p class="mb-2 text-lg text-gray-700 dark:text-gray-200">暫時無法載入首頁資料</p>
      <p class="mb-6 text-sm text-gray-400 dark:text-gray-500">{loadError}</p>
      <button
        onclick={loadLatestSnapshot}
        class="rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700"
      >
        重新載入
      </button>
    </div>
  {:else if !snapshot}
    <div class="flex min-h-screen flex-col items-center justify-center px-4">
      <p class="mb-2 text-lg text-gray-500 dark:text-gray-400">尚無資產紀錄</p>
      <p class="mb-6 text-sm text-gray-400 dark:text-gray-500">建立第一筆快照，開始追蹤你的資產</p>
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
            <p class="text-sm text-gray-500 dark:text-gray-400">我的淨資產 (TWD)</p>
            <button
              onclick={handleSignOut}
              class="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">登出</button
            >
          </div>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">
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
          class="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
        >
          編輯此快照
        </a>
      </div>
    </div>
  {/if}
</div>
