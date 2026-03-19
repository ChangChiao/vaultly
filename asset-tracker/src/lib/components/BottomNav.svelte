<script lang="ts">
	import { page } from '$app/state';

	const tabs = [
		{ href: '/', label: '首頁', icon: '🏠' },
		{ href: '/reports', label: '報表', icon: '📊' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white">
	<div class="flex">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="flex flex-1 flex-col items-center py-2 text-xs transition-colors {isActive(tab.href)
					? 'text-purple-600'
					: 'text-gray-400 hover:text-gray-600'}"
			>
				<span class="text-lg">{tab.icon}</span>
				<span class="mt-0.5">{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>
