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
							labels: { padding: 16, usePointStyle: true }
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
