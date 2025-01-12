<template>
  <!-- The container where ECharts will render -->
  <div ref="chartRef" class="h-72 w-full" />
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface ChartDataItem {
  date: string;
  revenue: number;
  costs: number;
  units: number;
  profit: number;
}

const props = defineProps<{
  data: ChartDataItem[];
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  // Build your ECharts option object
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Revenue", "Costs", "Profit"],
    },
    xAxis: {
      type: "category",
      data: props.data.map((item) => item.date),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        data: props.data.map((item) => item.revenue),
      },
      {
        name: "Costs",
        type: "line",
        data: props.data.map((item) => item.costs),
      },
      {
        name: "Profit",
        type: "line",
        data: props.data.map((item) => item.profit),
      },
    ],
  };

  chartInstance.setOption(option);
}

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  // Dispose of chart instance to avoid memory leaks
  chartInstance?.dispose();
});

watch(
  () => props.data,
  () => {
    // If data changes, re-initialize chart
    if (chartInstance) {
      chartInstance.dispose();
    }
    initChart();
  },
  { deep: true }
);
</script>

<style scoped>
/* Just an example height; adjust as you wish */
.h-72 {
  height: 18rem;
}
</style>
