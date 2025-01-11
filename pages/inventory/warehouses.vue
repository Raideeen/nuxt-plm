<!-- pages/inventory/warehouses.vue -->
<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Warehouses</h2>
        <p class="text-muted-foreground">
          Manage your warehouses and view stock distribution
        </p>
      </div>

      <Button @click="showAddDialog = true">
        <PlusIcon class="mr-2 h-4 w-4" />
        Add Warehouse
      </Button>
    </div>

    <!-- Warehouses Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead class="text-right">Total Items</TableHead>
            <TableHead class="text-right">Low Stock Items</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="warehouse in warehouses" :key="warehouse.id">
            <TableCell class="font-medium">{{ warehouse.name }}</TableCell>
            <TableCell>{{ warehouse.location }}</TableCell>
            <TableCell class="text-right">
              {{ warehouse.inventory?.length || 0 }}
            </TableCell>
            <TableCell class="text-right">
              {{ getLowStockCount(warehouse) }}
            </TableCell>
            <TableCell class="text-right space-x-2">
              <Button variant="ghost" size="icon" @click="viewStock(warehouse)">
                <PackageIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="editWarehouse(warehouse)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Add/Edit Warehouse Dialog -->
    <Dialog :open="showAddDialog" @update:open="handleDialogClose">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? "Edit Warehouse" : "Add Warehouse" }}
          </DialogTitle>
          <DialogDescription>
            {{
              isEditing
                ? "Update warehouse details."
                : "Add a new warehouse location."
            }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid gap-4">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input id="name" v-model="form.name" required />
            </div>
            <div class="space-y-2">
              <Label for="location">Location</Label>
              <Input id="location" v-model="form.location" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" @click="handleDialogClose">
              Cancel
            </Button>
            <Button type="submit">
              {{ isEditing ? "Update" : "Create" }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Stock Dialog -->
    <Dialog :open="showStockDialog" @update:open="showStockDialog = false">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle
            >Stock Details - {{ selectedWarehouse?.name }}</DialogTitle
          >
          <DialogDescription>
            Current stock levels and distribution
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead class="text-right">Current Stock</TableHead>
                <TableHead class="text-right">Min Stock</TableHead>
                <TableHead class="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in selectedWarehouse?.inventory"
                :key="item.id"
              >
                <TableCell>
                  {{ getIngredientName(item.ingredientId) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ item.currentStock }}
                </TableCell>
                <TableCell class="text-right">
                  {{ getIngredientMinStock(item.ingredientId) }}
                </TableCell>
                <TableCell class="text-right">
                  <Badge :variant="getStockStatus(item)">
                    {{ getStockStatus(item) }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, PencilIcon, PackageIcon } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

// Form state
const showAddDialog = ref(false);
const showStockDialog = ref(false);
const isEditing = ref(false);
const selectedWarehouse = ref<any>(null);
const form = reactive({
  name: "",
  location: "",
});

// Fetch warehouses and ingredients
const { data: warehouses, refresh } = await useFetch(
  "/api/inventory/warehouses"
);
const { data: ingredients } = await useFetch("/api/inventory/ingredients");

// Utility functions
function getLowStockCount(warehouse: any) {
  return (
    warehouse.inventory?.filter((item: any) => {
      const ingredient = ingredients.value?.find(
        (i) => i.id === item.ingredientId
      );
      return item.currentStock < (ingredient?.minimumStock || 0);
    }).length || 0
  );
}

function getIngredientName(id: string) {
  return ingredients.value?.find((i) => i.id === id)?.name || "Unknown";
}

function getIngredientMinStock(id: string) {
  return ingredients.value?.find((i) => i.id === id)?.minimumStock || 0;
}

function getStockStatus(item: any) {
  const ingredient = ingredients.value?.find((i) => i.id === item.ingredientId);
  if (!ingredient) return "unknown";

  if (item.currentStock <= 0) return "outOfStock";
  if (item.currentStock < ingredient.minimumStock) return "lowStock";
  return "inStock";
}

// Dialog handlers
function handleDialogClose() {
  showAddDialog.value = false;
  isEditing.value = false;
  form.name = "";
  form.location = "";
}

function editWarehouse(warehouse: any) {
  isEditing.value = true;
  form.name = warehouse.name;
  form.location = warehouse.location;
  showAddDialog.value = true;
}

function viewStock(warehouse: any) {
  selectedWarehouse.value = warehouse;
  showStockDialog.value = true;
}

async function handleSubmit() {
  try {
    if (isEditing.value) {
      await $fetch(`/api/inventory/warehouses/${selectedWarehouse.value.id}`, {
        method: "PUT",
        body: form,
      });
    } else {
      await $fetch("/api/inventory/warehouses", {
        method: "POST",
        body: form,
      });
    }

    handleDialogClose();
    await refresh();
  } catch (error) {
    console.error("Error saving warehouse:", error);
  }
}
</script>
