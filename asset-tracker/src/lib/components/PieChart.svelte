<script lang="ts">
	import { Chart, ArcElement, Tooltip, Legend, type ChartData } from 'chart.js';
	import { onMount } from 'svelte';

	Chart.register(ArcElement, Tooltip, Legend);

	interface Props {
		title: string;
		labels: string[];
		data: number[];
		colors: string[];
	}

	let { title, labels, data, colors }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'pie'> | null = null;

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'pie',
			data: {
				labels,
				datasets: [
					{
						data,
						backgroundColor: colors,
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

		return () => chart?.destroy();
	});

	$effect(() => {
		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].backgroundColor = colors;
			chart.update();
		}
	});
</script>

<div>
	<h3 class="mb-2 text-sm font-semibold text-gray-700">{title}</h3>
	<canvas bind:this={canvas}></canvas>
</div>
