<!-- pages/reporting/index.vue -->
<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Financial Reporting</h2>
        <p class="text-muted-foreground">
          Track costs, margins, and production trends
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Date Range -->
        <div class="flex items-center space-x-2">
          <Input type="date" v-model="dateRange.start" class="w-40" />
          <span class="text-muted-foreground">to</span>
          <Input type="date" v-model="dateRange.end" class="w-40" />
        </div>

        <Button variant="outline" @click="exportReport">
          <DownloadIcon class="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Revenue Card -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <EuroIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">€{{ totalRevenue.toFixed(2) }}</div>
          <p class="text-xs text-muted-foreground">+20% from previous period</p>
        </CardContent>
      </Card>

      <!-- Costs Card -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Total Costs</CardTitle>
          <CoinsIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">€{{ totalCosts.toFixed(2) }}</div>
          <p class="text-xs text-muted-foreground">+10% from previous period</p>
        </CardContent>
      </Card>

      <!-- Profit Margin Card -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Profit Margin</CardTitle>
          <PercentIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ profitMargin }}%</div>
          <p class="text-xs text-muted-foreground">+5% from previous period</p>
        </CardContent>
      </Card>

      <!-- Units Card -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Units Produced</CardTitle>
          <PackageIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalUnits }}</div>
          <p class="text-xs text-muted-foreground">+15% from previous period</p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <!-- Revenue & Costs Trend -->
      <Card class="col-span-4">
        <CardHeader>
          <CardTitle>Revenue & Costs Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueCostChart :data="chartData" />
        </CardContent>
      </Card>

      <!-- Cost Breakdown -->
      <Card class="col-span-3">
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <CostBreakdownChart :data="costBreakdown" />
        </CardContent>
      </Card>
    </div>

    <!-- Detailed Tables -->
    <Tabs default-value="production" class="space-y-4">
      <TabsList>
        <TabsTrigger value="production">Production Costs</TabsTrigger>
        <TabsTrigger value="ingredients">Ingredient Costs</TabsTrigger>
        <TabsTrigger value="additional">Additional Costs</TabsTrigger>
      </TabsList>

      <TabsContent value="production">
        <Card>
          <CardHeader>
            <CardTitle>Production Line Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Production Line</TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead class="text-right">Units</TableHead>
                  <TableHead class="text-right">Material Cost</TableHead>
                  <TableHead class="text-right">Revenue</TableHead>
                  <TableHead class="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="line in productionLines" :key="line.id">
                  <TableCell>{{ line.name }}</TableCell>
                  <TableCell>{{ line.recipe }}</TableCell>
                  <TableCell class="text-right">{{ line.units }}</TableCell>
                  <TableCell class="text-right">
                    €{{ line.materialCost.toFixed(2) }}
                  </TableCell>
                  <TableCell class="text-right">
                    €{{ line.revenue.toFixed(2) }}
                  </TableCell>
                  <TableCell class="text-right">{{ line.margin }}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ingredients">
        <Card>
          <CardHeader>
            <CardTitle>Ingredient Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead class="text-right">Unit Cost</TableHead>
                  <TableHead class="text-right">Total Used</TableHead>
                  <TableHead class="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="ingredient in ingredientCosts"
                  :key="ingredient.id"
                >
                  <TableCell>{{ ingredient.name }}</TableCell>
                  <TableCell>{{ ingredient.unit }}</TableCell>
                  <TableCell class="text-right">
                    €{{ ingredient.unitCost.toFixed(2) }}
                  </TableCell>
                  <TableCell class="text-right">
                    {{ ingredient.totalUsed }}
                  </TableCell>
                  <TableCell class="text-right">
                    €{{ ingredient.totalCost.toFixed(2) }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="additional">
        <Card>
          <CardHeader>
            <CardTitle>Additional Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <form class="space-y-4">
              <div class="grid gap-4">
                <div class="space-y-2">
                  <Label>Marketing Costs</Label>
                  <Input
                    type="number"
                    v-model="additionalCosts.marketing"
                    placeholder="Enter marketing costs"
                  />
                </div>
                <div class="space-y-2">
                  <Label>Logistics Costs</Label>
                  <Input
                    type="number"
                    v-model="additionalCosts.logistics"
                    placeholder="Enter logistics costs"
                  />
                </div>
                <div class="space-y-2">
                  <Label>Other Operational Costs</Label>
                  <Input
                    type="number"
                    v-model="additionalCosts.operational"
                    placeholder="Enter operational costs"
                  />
                </div>
              </div>
              <Button type="submit">Update Costs</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { format, subDays } from "date-fns";
import { computed, ref } from "vue";

// Import your ECharts components
import CostBreakdownChart from "~/components/charts/CostBreakdownChart.vue";
import RevenueCostChart from "~/components/charts/RevenueCostChart.vue";

// Icons from lucide-vue-next or wherever you keep them
import {
  CoinsIcon,
  DownloadIcon,
  EuroIcon,
  PackageIcon,
  PercentIcon,
} from "lucide-vue-next";

// ShadCN UI components
import Button from "~/components/ui/button/Button.vue";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Input from "~/components/ui/input/Input.vue";
import Label from "~/components/ui/label/Label.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Additional composables, helper functions
import { exportToCSV } from "~/utils/export";

definePageMeta({
  layout: "dashboard",
});

// Date range state
const dateRange = ref({
  start: subDays(new Date(), 30),
  end: new Date(),
});

// Fetch reporting data
const { data: reportData } = await useFetch("/api/reporting/overview", {
  query: computed(() => ({
    startDate: dateRange.value.start.toISOString(),
    endDate: dateRange.value.end.toISOString(),
  })),
});

// Computed values for summary cards
const totalRevenue = computed(
  () => reportData.value?.summary.totalRevenue || 0
);
const totalCosts = computed(() => reportData.value?.summary.totalCosts || 0);
const totalUnits = computed(() => reportData.value?.summary.totalUnits || 0);

const profitMargin = computed(() => {
  if (!totalRevenue.value || !totalCosts.value) return 0;
  return (
    ((totalRevenue.value - totalCosts.value) / totalRevenue.value) *
    100
  ).toFixed(1);
});

// Chart data for ECharts
const chartData = computed(
  () =>
    reportData.value?.dailyData.map((d) => ({
      ...d,
      date: format(new Date(d.date), "MMM dd"),
      profit: d.revenue - d.costs,
    })) || []
);

// Cost breakdown data (pie chart)
const costBreakdown = computed(
  () =>
    reportData.value?.costBreakdown.map((item, index) => ({
      ...item,
      // Example color assignment
      color: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4],
    })) || []
);

// Tables data (example placeholders)
const productionLines = computed(() => {
  // Suppose you want to list each line with name, recipe, margin, etc.
  // This can come from the same dailyData or from a separate endpoint.
  // For now, we’ll just mock it or transform from dailyData:
  return (
    reportData.value?.dailyData.flatMap((day: any) => {
      // This is just an example transformation
      // In reality, you'd want to combine or structure the data differently
      return {
        id: day.date,
        name: `Production on ${format(new Date(day.date), "yyyy-MM-dd")}`,
        recipe: "Recipe X",
        units: day.units,
        materialCost: day.costs,
        revenue: day.revenue,
        margin: ((day.revenue - day.costs) / day.revenue) * 100 || 0,
      };
    }) || []
  );
});

const ingredientCosts = computed(() => {
  // Similarly, mock or transform data for ingredient costs
  // In practice, you'd probably have a separate aggregator
  return [
    {
      id: 1,
      name: "Flour",
      unit: "kg",
      unitCost: 0.5,
      totalUsed: 100,
      totalCost: 50,
    },
    {
      id: 2,
      name: "Sugar",
      unit: "kg",
      unitCost: 0.7,
      totalUsed: 80,
      totalCost: 56,
    },
  ];
});

// Additional costs
const additionalCosts = ref({
  marketing: 0,
  logistics: 0,
  operational: 0,
});

// Export functionality
async function exportReport() {
  const data = {
    headers: ["Date", "Revenue", "Costs", "Units", "Profit Margin"],
    rows:
      reportData.value?.dailyData.map((d) => [
        format(new Date(d.date), "yyyy-MM-dd"),
        `€${d.revenue.toFixed(2)}`,
        `€${d.costs.toFixed(2)}`,
        d.units,
        `${(((d.revenue - d.costs) / d.revenue) * 100).toFixed(1)}%`,
      ]) || [],
    summary: [
      "Total",
      `€${totalRevenue.value.toFixed(2)}`,
      `€${totalCosts.value.toFixed(2)}`,
      totalUnits.value,
      `${profitMargin.value}%`,
    ],
  };

  const filename = `financial-report-${format(new Date(), "yyyy-MM-dd")}`;
  exportToCSV(data, filename);
}
</script>
