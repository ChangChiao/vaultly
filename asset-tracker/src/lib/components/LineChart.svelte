<script lang="ts">
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend,
		Filler
	} from 'chart.js';
	import { onMount } from 'svelte';
	import { getTheme } from '$lib/theme.svelte';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

	interface DatasetInput {
		label: string;
		data: number[];
		color: string;
		bold?: boolean;
	}

	interface Props {
		title: string;
		labels: string[];
		datasets: DatasetInput[];
	}

	let { title, labels, datasets }: Props = $props();
	const theme = getTheme();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'line'> | null = null;
	let mounted = $state(false);

	function getTextColor() {
		return theme.dark ? '#d1d5db' : '#374151';
	}

	function getGridColor() {
		return theme.dark ? '#374151' : '#e5e7eb';
	}

	function buildDatasets(inputs: DatasetInput[]) {
		return inputs.map((ds) => ({
			label: ds.label,
			data: ds.data,
			borderColor: ds.color,
			backgroundColor: ds.bold ? ds.color + '20' : 'transparent',
			borderWidth: ds.bold ? 3 : 1.5,
			pointRadius: 3,
			tension: 0.3,
			fill: ds.bold ?? false
		}));
	}

	onMount(() => {
		mounted = true;
		return () => {
			chart?.destroy();
			chart = null;
		};
	});

	$effect(() => {
		const currentLabels = labels;
		const currentDatasets = datasets;
		const isDark = theme.dark;

		if (!mounted || !canvas) return;

		if (chart) {
			chart.data.labels = currentLabels;
			chart.data.datasets = buildDatasets(currentDatasets) as any;
			if (chart.options.plugins?.legend?.labels) {
				(chart.options.plugins.legend.labels as any).color = getTextColor();
			}
			if (chart.options.scales?.x) {
				(chart.options.scales.x as any).ticks.color = getTextColor();
				(chart.options.scales.x as any).grid.color = getGridColor();
			}
			if (chart.options.scales?.y) {
				(chart.options.scales.y as any).ticks.color = getTextColor();
				(chart.options.scales.y as any).grid.color = getGridColor();
			}
			chart.update();
		} else {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels: currentLabels,
					datasets: buildDatasets(currentDatasets)
				},
				options: {
					responsive: true,
					interaction: { mode: 'index', intersect: false },
					plugins: {
						legend: {
							position: 'bottom',
							labels: { padding: 16, usePointStyle: true, color: getTextColor() }
						},
						tooltip: {
							callbacks: {
								label(ctx) {
									const value = new Intl.NumberFormat('zh-TW').format(Math.round(ctx.parsed.y ?? 0));
									return `${ctx.dataset.label}: NT$ ${value}`;
								}
							}
						}
					},
					scales: {
						x: {
							ticks: { color: getTextColor() },
							grid: { color: getGridColor() }
						},
						y: {
							ticks: {
								color: getTextColor(),
								callback(this: unknown, value: string | number) {
									return 'NT$ ' + new Intl.NumberFormat('zh-TW', { notation: 'compact' }).format(Number(value));
								}
							},
							grid: { color: getGridColor() }
						}
					}
				}
			});
		}
	});
</script>

<div>
	<h3 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
	<canvas bind:this={canvas}></canvas>
</div>
