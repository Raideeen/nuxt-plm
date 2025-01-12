<template>
  <div ref="chartRef" class="h-72 w-full" />
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface CostItem {
  name: string;
  value: number;
  color?: string;
}

const props = defineProps<{
  data: CostItem[];
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Cost Breakdown",
        type: "pie",
        radius: "70%",
        data: props.data.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  chartInstance.setOption(option);
}

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  chartInstance?.dispose();
});

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      chartInstance.dispose();
    }
    initChart();
  },
  { deep: true }
);
</script>

<style scoped>
.h-72 {
  height: 18rem;
}
</style>
