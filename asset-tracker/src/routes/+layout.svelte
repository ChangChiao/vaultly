<script lang="ts">
  import "../app.css";
  import { getAuth } from "$lib/auth.svelte";
  import { getTheme } from "$lib/theme.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const favicon = "/favicon.ico";
  let { children } = $props();
  const auth = getAuth();
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
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if auth.loading}
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <p class="text-gray-400 dark:text-gray-500">載入中...</p>
  </div>
{:else if auth.user || page.url.pathname === "/login"}
  {@render children()}
  {#if showNav}
    <BottomNav {theme} />
  {/if}
{/if}
