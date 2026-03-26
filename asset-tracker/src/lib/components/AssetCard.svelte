<script lang="ts">
	import { CATEGORY_CONFIG, type Category, type SnapshotEntry } from '$lib/types';

	interface Props {
		name: string;
		color: string;
		subtitle: string;
		totalTwd: number;
		lastDate: string;
		entries: SnapshotEntry[];
	}

	let { name, color, subtitle, totalTwd, lastDate, entries }: Props = $props();
	let expanded = $state(false);

	function formatTwd(value: number): string {
		return new Intl.NumberFormat('zh-TW').format(Math.round(value));
	}

	function formatOriginal(entry: SnapshotEntry): string {
		if (entry.original_currency === 'TWD') return '';
		const symbol = entry.original_currency === 'USD' ? '$' : '¥';
		return `${entry.original_currency} ${symbol}${new Intl.NumberFormat('en-US').format(entry.original_amount)} →`;
	}
</script>

<button
	onclick={() => (expanded = !expanded)}
	class="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex items-start gap-3">
		<div class="mt-1 h-10 w-1 rounded-full {color}"></div>
		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between">
				<div>
					<p class="font-semibold text-gray-900 dark:text-white">{name}</p>
					<p class="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
				</div>
				<div class="text-right">
					<p class="font-semibold text-gray-900 dark:text-white">NT$ {formatTwd(totalTwd)}</p>
					<p class="text-xs text-gray-400 dark:text-gray-500">{lastDate} 更新</p>
				</div>
			</div>
		</div>
	</div>

	{#if expanded && entries.length > 0}
		<div class="mt-3 ml-4 space-y-1 border-t border-gray-200 pt-3 dark:border-gray-700">
			{#each entries as entry}
				{@const config = CATEGORY_CONFIG[entry.category as Category]}
				<div class="flex justify-between text-sm">
					<span class="text-gray-500 dark:text-gray-400">{config.label}</span>
					<span class="text-gray-700 dark:text-gray-300">
						{#if entry.original_currency !== 'TWD'}
							<span class="text-xs text-gray-400 dark:text-gray-500">{formatOriginal(entry)}</span>
						{/if}
						NT$ {formatTwd(entry.twd_amount)}
					</span>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-2 ml-4 text-center">
		<span class="text-xs text-gray-300 dark:text-gray-600">{expanded ? '▲' : '▼'}</span>
	</div>
</button>
