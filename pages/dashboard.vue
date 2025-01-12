<!-- pages/dashboard.vue -->
<template>
  <div class="hidden flex-col md:flex">
    <!-- Main Content -->
    <div class="flex-1 space-y-4 p-8 pt-6">
      <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div class="flex items-center space-x-2">
          <Button @click="downloadSomething"> Download </Button>
        </div>
      </div>

      <Tabs default-value="overview" class="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-4">
          <!-- Stats Cards -->
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card v-for="stat in stats" :key="stat.title">
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0 pb-2"
              >
                <CardTitle class="text-sm font-medium">
                  {{ stat.title }}
                </CardTitle>
                <span class="text-xs text-muted-foreground">{{
                  stat.suffix || ""
                }}</span>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ stat.value }}</div>
                <p class="text-xs text-muted-foreground">{{ stat.change }}</p>
              </CardContent>
            </Card>
          </div>

          <!-- Charts Grid -->
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card class="col-span-4">
              <CardHeader>
                <CardTitle>Overview Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <!-- We'll add the graph here (e.g., ECharts, Recharts, etc.) -->
                <div>
                  <DashboardChart v-if="chartData.length" :data="chartData" />
                  <!-- Fallback or loading message -->
                  <p v-else>Loading chart data...</p>
                </div>
              </CardContent>
            </Card>

            <Card class="col-span-3">
              <CardHeader>
                <CardTitle>Current Production</CardTitle>
              </CardHeader>
              <CardContent>
                <!-- We'll show active or upcoming production lines as tasks -->
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Production Line</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="line in productionTasks" :key="line.id">
                      <TableCell>{{ line.name }}</TableCell>
                      <TableCell
                        >{{ line.quantity }} x
                        {{ line.unitsPerPack }}</TableCell
                      >
                      <TableCell>{{ line.status }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFetch } from "#imports";
import { computed } from "vue";

// UI components
import DashboardChart from "~/components/charts/DashboardChart.vue";
import Button from "~/components/ui/button/Button.vue";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

definePageMeta({
  layout: "dashboard",
});

// 1) Fetch Inventory Data
const { data: inventoryData, pending: inventoryPending } = await useFetch(
  "/api/inventory/ingredients"
);

// 2) Fetch Production Data
const { data: productionData, pending: productionPending } = await useFetch(
  "/api/production"
);

// 3) Fetch Reporting Data (overview)
const { data: reportingData, pending: reportingPending } = await useFetch(
  "/api/reporting/overview"
);

// 4) Compute Some Stats for the Dashboard Cards
const totalGlobalStock = computed(() => {
  if (!inventoryData.value) return 0;
  // Sum across all ingredients/warehouses
  let sum = 0;
  inventoryData.value.forEach((ingredient: any) => {
    if (ingredient.warehouses) {
      ingredient.warehouses.forEach((wh: any) => {
        sum += wh.stock; // or whatever field your DB uses
      });
    }
  });
  return sum;
});

const totalCosts = computed(() => {
  return reportingData.value?.summary.totalCosts || 0;
});

const totalRevenue = computed(() => {
  return reportingData.value?.summary.totalRevenue || 0;
});

const approximateMargin = computed(() => {
  if (!totalRevenue.value) return 0;
  const profit = totalRevenue.value - totalCosts.value;
  return (profit / totalRevenue.value) * 100;
});

// 5) Build a reactive array for the Stats Cards
const stats = computed(() => {
  return [
    {
      title: "Total Costs",
      value: `${totalCosts.value.toFixed(2)}€`,
      change: "+180.1% from last month", // Example
      suffix: "€",
    },
    {
      title: "Approximate Margin",
      value: `${approximateMargin.value.toFixed(1)}%`,
      change: "+19% from last month",
    },
    {
      title: "Total Revenue (30j)",
      value: `${totalRevenue.value.toFixed(2)}€`,
      change: "+201 since last hour",
      suffix: "€",
    },
  ];
});

// 6) Prepare Data for the "Super Graph"
const chartData = computed(() => {
  if (!reportingData.value) return [];
  return reportingData.value.dailyData.map((item: any) => ({
    // maybe format the date as 'MMM dd' or keep the ISO
    date: item.date,
    revenue: item.revenue,
    costs: item.costs,
    units: item.units,
  }));
});

// 7) Prepare Data for the "Super Tableau Interactif" (Production Tasks)
const productionTasks = computed(() => {
  if (!productionData.value) return [];
  // Example: we assume each line is “ongoing” if line.completed != true, etc.
  // Let’s transform them slightly to display “status”
  return productionData.value.map((line: any) => {
    // If your DB schema has “status” or “completed” fields, adjust as needed
    // We can do a basic example:
    const status = line.completed ? "Completed" : "Ongoing";
    return {
      id: line.id,
      name: line.name || line.recipeName || "Unnamed Production",
      quantity: line.quantity,
      unitsPerPack: line.unitsPerPack,
      status,
    };
  });
});

// 8) Download Handler (example)
function downloadSomething() {
  alert("Here we could export a CSV or PDF!");
}
</script>

<style scoped>
/* Any custom styling for your Dashboard page here. */
</style>
