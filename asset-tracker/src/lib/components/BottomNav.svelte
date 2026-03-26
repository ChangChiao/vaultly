<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		theme: { dark: boolean; toggle: () => void };
	}

	let { theme }: Props = $props();

	const tabs = [
		{ href: '/', label: '首頁', icon: '🏠' },
		{ href: '/snapshots', label: '編輯', icon: '✏️' },
		{ href: '/reports', label: '報表', icon: '📊' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
	<div class="flex">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="flex flex-1 flex-col items-center py-2 text-xs transition-colors {isActive(tab.href)
					? 'text-purple-600 dark:text-purple-400'
					: 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}"
			>
				<span class="text-lg">{tab.icon}</span>
				<span class="mt-0.5">{tab.label}</span>
			</a>
		{/each}
		<button
			onclick={theme.toggle}
			class="flex flex-1 flex-col items-center py-2 text-xs text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
		>
			<span class="text-lg">{theme.dark ? '☀️' : '🌙'}</span>
			<span class="mt-0.5">{theme.dark ? '淺色' : '深色'}</span>
		</button>
	</div>
</nav>
