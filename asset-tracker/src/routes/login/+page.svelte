<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getBackendState, runWithBackendRecovery, warmupSupabase } from '$lib/backend.svelte';
	import { goto } from '$app/navigation';

	const backend = getBackendState();
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);

	$effect(() => {
		warmupSupabase({ allowFailure: true });
	});

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			const { error: authError } = await runWithBackendRecovery(
				() =>
					supabase.auth.signInWithPassword({
						email,
						password
					}),
				{ skipWarmup: true }
			);

			if (authError) {
				error = authError.message;
				return;
			}

			goto('/');
		} catch (e) {
			error = e instanceof Error ? e.message : '登入失敗';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
	<div class="w-full max-w-sm">
		<h1 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">Asset Tracker</h1>

		{#if backend.isPending}
			<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
				免費方案資料庫正在喚醒，第一次登入可能需要 10 到 60 秒。
			</div>
		{/if}

		<form onsubmit={handleLogin} class="space-y-4">
			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-800"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">密碼</label>
				<div class="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						required
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-800"
						placeholder="••••••••"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
					>
						{#if showPassword}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
								<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
								<line x1="1" y1="1" x2="23" y2="23" />
							</svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			{#if error}
				<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
			>
				{loading ? (backend.isPending ? '正在喚醒服務並登入...' : '登入中...') : '登入'}
			</button>
		</form>
	</div>
</div>
