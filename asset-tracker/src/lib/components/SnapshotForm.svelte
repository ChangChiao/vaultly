<script lang="ts">
	import { CATEGORIES, CATEGORY_CONFIG, type Category } from '$lib/types';
	import { fetchExchangeRates, convertToTwd, type ExchangeRates } from '$lib/exchange-rate';

	interface Props {
		initialDate?: string;
		initialAmounts?: Record<Category, number>;
		onSave: (data: {
			date: string;
			entries: { category: Category; amount: number; currency: string; rate: number; twd: number }[];
		}) => Promise<void>;
		submitLabel?: string;
	}

	let props: Props = $props();
	let onSave = $derived(props.onSave);
	let submitLabel = $derived(props.submitLabel ?? '儲存快照');

	let date = $state(new Date().toISOString().split('T')[0]);
	let amounts: Record<string, number> = $state(
		Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
	);
	let initialized = $state(false);

	$effect(() => {
		if (!initialized && (props.initialDate || props.initialAmounts)) {
			if (props.initialDate) date = props.initialDate;
			if (props.initialAmounts) {
				for (const c of CATEGORIES) {
					amounts[c] = props.initialAmounts[c] ?? 0;
				}
			}
			initialized = true;
		}
	});
	let rates = $state<ExchangeRates | null>(null);
	let ratesError = $state(false);
	let manualUsd = $state('');
	let manualJpy = $state('');
	let saving = $state(false);
	let error = $state('');

	$effect(() => {
		fetchExchangeRates()
			.then((r) => {
				rates = r;
			})
			.catch(() => {
				ratesError = true;
			});
	});

	function getRate(currency: string): number {
		if (currency === 'TWD') return 1;
		if (ratesError) {
			if (currency === 'USD') return parseFloat(manualUsd) || 0;
			if (currency === 'JPY') return parseFloat(manualJpy) || 0;
		}
		if (!rates) return 0;
		if (currency === 'USD') return rates.USD;
		if (currency === 'JPY') return rates.JPY;
		return 1;
	}

	let totalTwd = $derived(
		CATEGORIES.reduce((sum, cat) => {
			const config = CATEGORY_CONFIG[cat];
			const rate = getRate(config.currency);
			return sum + (amounts[cat] || 0) * rate;
		}, 0)
	);

	async function handleSubmit() {
		saving = true;
		error = '';

		const entries = CATEGORIES.map((cat) => {
			const config = CATEGORY_CONFIG[cat];
			const rate = getRate(config.currency);
			return {
				category: cat,
				amount: amounts[cat] || 0,
				currency: config.currency,
				rate,
				twd: (amounts[cat] || 0) * rate
			};
		});

		try {
			await onSave({ date, entries });
		} catch (e) {
			error = e instanceof Error ? e.message : '儲存失敗';
		} finally {
			saving = false;
		}
	}

	const groups = [
		{
			name: '股票',
			color: 'border-purple-500',
			categories: ['stock_tw', 'stock_us', 'stock_uk'] as Category[]
		},
		{ name: '現金', color: 'border-blue-500', categories: ['cash'] as Category[] },
		{ name: '定存', color: 'border-green-500', categories: ['deposit'] as Category[] },
		{
			name: '外幣現金',
			color: 'border-amber-500',
			categories: ['forex_usd', 'forex_jpy'] as Category[]
		}
	];

	function formatTwd(value: number): string {
		return new Intl.NumberFormat('zh-TW').format(Math.round(value));
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<div>
		<label for="date" class="mb-1 block text-sm font-medium text-gray-700">日期</label>
		<input
			id="date"
			type="date"
			bind:value={date}
			required
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
		/>
	</div>

	{#if ratesError}
		<div class="rounded-lg border border-amber-300 bg-amber-50 p-3">
			<p class="mb-2 text-sm font-medium text-amber-800">無法取得匯率，請手動輸入：</p>
			<div class="flex gap-3">
				<div class="flex-1">
					<label for="manual-usd" class="text-xs text-amber-700">USD/TWD</label>
					<input
						id="manual-usd"
						type="number"
						step="0.01"
						bind:value={manualUsd}
						placeholder="32.5"
						class="mt-1 w-full rounded border border-amber-300 px-2 py-1 text-sm"
					/>
				</div>
				<div class="flex-1">
					<label for="manual-jpy" class="text-xs text-amber-700">JPY/TWD</label>
					<input
						id="manual-jpy"
						type="number"
						step="0.0001"
						bind:value={manualJpy}
						placeholder="0.215"
						class="mt-1 w-full rounded border border-amber-300 px-2 py-1 text-sm"
					/>
				</div>
			</div>
		</div>
	{:else if rates}
		<div class="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
			匯率：USD/TWD {rates.USD.toFixed(2)} ・ JPY/TWD {rates.JPY.toFixed(4)}
		</div>
	{:else}
		<p class="text-sm text-gray-400">取得匯率中...</p>
	{/if}

	{#each groups as group}
		<div>
			<h3 class="mb-2 border-l-4 {group.color} pl-2 text-sm font-semibold text-gray-700">
				{group.name}
			</h3>
			<div class="space-y-2">
				{#each group.categories as cat}
					{@const config = CATEGORY_CONFIG[cat]}
					{@const rate = getRate(config.currency)}
					{@const twdValue = (amounts[cat] || 0) * rate}
					<div class="flex items-center gap-2">
						<label for={cat} class="w-16 text-sm text-gray-600">{config.label}</label>
						<div class="relative flex-1">
							<span class="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-gray-400"
								>{config.currency}</span
							>
							<input
								id={cat}
								type="number"
								step="0.01"
								bind:value={amounts[cat]}
								placeholder="0"
								class="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
							/>
						</div>
						{#if config.currency !== 'TWD' && twdValue > 0}
							<span class="w-32 text-right text-xs text-gray-400">
								→ NT$ {formatTwd(twdValue)}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<div class="border-t pt-4">
		<p class="text-right text-lg font-bold text-gray-900">
			總計：NT$ {formatTwd(totalTwd)}
		</p>
	</div>

	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}

	<button
		type="submit"
		disabled={saving}
		class="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
	>
		{saving ? '儲存中...' : submitLabel}
	</button>
</form>
