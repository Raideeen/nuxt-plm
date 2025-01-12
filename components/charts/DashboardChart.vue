<template>
  <!-- The container where ECharts will render -->
  <div ref="chartRef" class="echart-container" />
</template>

<script setup lang="ts">
// Imports
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

// Define the shape of each data entry
interface DailyData {
  date: string; // e.g. "2025-01-09" or "Jan 09"
  revenue: number;
  costs: number;
  units: number;
}

// Accept an array of data objects as a prop
const props = defineProps<{
  data: DailyData[];
}>();

// A ref to the DOM node where we'll initialize ECharts
const chartRef = ref<HTMLDivElement | null>(null);
// We'll store the ECharts instance here
let chartInstance: echarts.ECharts | null = null;

// Initialize the chart when the component mounts
onMounted(() => {
  initChart();
});

// Dispose of the chart on unmount to avoid memory leaks
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});

// Watch for changes in `props.data` and re-initialize the chart
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

// The main function that creates the ECharts instance
function initChart() {
  if (!chartRef.value) return;

  // 1. Initialize
  chartInstance = echarts.init(chartRef.value);

  // 2. Build option
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
        smooth: true,
      },
      {
        name: "Costs",
        type: "line",
        data: props.data.map((item) => item.costs),
        smooth: true,
      },
      {
        name: "Profit",
        type: "line",
        data: props.data.map((item) => item.revenue - item.costs),
        smooth: true,
      },
    ],
  };

  // 3. Set option
  chartInstance.setOption(option);
}
</script>

<style scoped>
.echart-container {
  width: 100%;
  height: 400px; /* Adjust as needed */
}
</style>
