<script lang="ts">
	import { Chart, PieController, ArcElement, Tooltip, Legend, type ChartData } from 'chart.js';
	import { onMount } from 'svelte';

	Chart.register(PieController, ArcElement, Tooltip, Legend);

	interface Props {
		title: string;
		labels: string[];
		data: number[];
		colors: string[];
	}

	let { title, labels, data, colors }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'pie'> | null = null;
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		return () => {
			chart?.destroy();
			chart = null;
		};
	});

	$effect(() => {
		// Read props unconditionally so they are always tracked
		const currentLabels = labels;
		const currentData = data;
		const currentColors = colors;

		if (!mounted || !canvas) return;

		if (chart) {
			chart.data.labels = currentLabels;
			chart.data.datasets[0].data = currentData;
			chart.data.datasets[0].backgroundColor = currentColors;
			chart.update();
		} else {
			chart = new Chart(canvas, {
				type: 'pie',
				data: {
					labels: currentLabels,
					datasets: [
						{
							data: currentData,
							backgroundColor: currentColors,
							borderWidth: 2,
							borderColor: '#fff'
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								padding: 16,
								usePointStyle: true,
								generateLabels(chart) {
									const dataset = chart.data.datasets[0];
									const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
									return (chart.data.labels as string[]).map((label, i) => {
										const value = (dataset.data as number[])[i];
										const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
										return {
											text: `${label} ${pct}%`,
											fillStyle: (dataset.backgroundColor as string[])[i],
											strokeStyle: '#fff',
											lineWidth: 2,
											pointStyle: 'circle',
											hidden: false,
											index: i
										};
									});
								}
							}
						},
						tooltip: {
							callbacks: {
								label(ctx) {
									const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
									const pct = ((ctx.parsed / total) * 100).toFixed(1);
									const value = new Intl.NumberFormat('zh-TW').format(Math.round(ctx.parsed));
									return `${ctx.label}: NT$ ${value} (${pct}%)`;
								}
							}
						}
					}
				}
			});
		}
	});
</script>

<div>
	<h3 class="mb-2 text-sm font-semibold text-gray-700">{title}</h3>
	<canvas bind:this={canvas}></canvas>
</div>
