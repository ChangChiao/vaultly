<script lang="ts">
  import "../app.css";
  import { getAuth } from "$lib/auth.svelte";
  import { getBackendState, warmupSupabase } from "$lib/backend.svelte";
  import { getTheme } from "$lib/theme.svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const favicon = "/favicon.ico";
  let { children } = $props();
  const auth = getAuth();
  const backend = getBackendState();
  const theme = getTheme();

  let showNav = $derived(
    auth.user &&
      !page.url.pathname.startsWith("/login") &&
      !page.url.pathname.startsWith("/snapshot/"),
  );

  $effect(() => {
    if (!auth.loading && !auth.user && page.url.pathname !== "/login") {
      goto("/login");
    }
  });

  $effect(() => {
    if (browser) {
      warmupSupabase({ allowFailure: true });
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if auth.loading}
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <p class="text-gray-400 dark:text-gray-500">載入中...</p>
  </div>
{:else if auth.user || page.url.pathname === "/login"}
  {#if backend.status === "checking" || backend.status === "retrying" || backend.status === "failed"}
    <div class="sticky top-0 z-40 border-b border-amber-200 bg-amber-50/95 px-4 py-3 backdrop-blur dark:border-amber-900 dark:bg-amber-950/90">
      <div class="mx-auto flex max-w-md items-start justify-between gap-3">
        <p class="text-sm text-amber-900 dark:text-amber-200">
          {backend.message || "資料服務正在喚醒中。"}
        </p>
        {#if backend.status === "failed"}
          <button
            onclick={() => warmupSupabase({ force: true, allowFailure: true })}
            class="shrink-0 rounded-md border border-amber-300 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/60"
          >
            重試
          </button>
        {/if}
      </div>
    </div>
  {/if}
  {@render children()}
  {#if showNav}
    <BottomNav {theme} />
  {/if}
{/if}
