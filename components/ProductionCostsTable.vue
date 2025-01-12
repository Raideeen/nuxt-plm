<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Production Line</TableHead>
        <TableHead class="text-right">Units</TableHead>
        <TableHead class="text-right">Cost</TableHead>
        <TableHead class="text-right">Cost per Unit</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="!data.length">
        <TableCell colspan="4" class="text-center py-4">
          No production data available
        </TableCell>
      </TableRow>
      <TableRow v-for="line in data" :key="line.id">
        <TableCell>{{ line.name }}</TableCell>
        <TableCell class="text-right">{{ line.units }}</TableCell>
        <TableCell class="text-right">€{{ line.cost.toFixed(2) }}</TableCell>
        <TableCell class="text-right">
          €{{ (line.cost / line.units || 0).toFixed(2) }}
        </TableCell>
      </TableRow>
    </TableBody>
    <TableFooter v-if="data.length">
      <TableRow>
        <TableCell>Total</TableCell>
        <TableCell class="text-right">{{ totalUnits }}</TableCell>
        <TableCell class="text-right">€{{ totalCost.toFixed(2) }}</TableCell>
        <TableCell class="text-right">
          €{{ (totalCost / totalUnits || 0).toFixed(2) }}
        </TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: Array<{
    id: string;
    name: string;
    units: number;
    cost: number;
  }>;
}>();

const totalUnits = computed(
  () => props.data?.reduce((sum, line) => sum + line.units, 0) || 0
);

const totalCost = computed(
  () => props.data?.reduce((sum, line) => sum + line.cost, 0) || 0
);
</script>
