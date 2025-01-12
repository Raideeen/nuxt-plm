<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Ingredients</h2>
        <p class="text-muted-foreground">
          Manage your ingredients and stock levels
        </p>
      </div>

      <div class="flex space-x-2">
        <Button variant="outline" @click="handleExport">
          <DownloadIcon class="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button @click="addIngredient">
          <PlusIcon class="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </div>
    </div>

    <!-- Ingredients Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="handleSort('name')" class="cursor-pointer">
              Name
              <ChevronUpIcon
                v-if="
                  sortConfig.column === 'name' && sortConfig.direction === 'asc'
                "
                class="inline h-4 w-4"
              />
              <ChevronDownIcon
                v-if="
                  sortConfig.column === 'name' &&
                  sortConfig.direction === 'desc'
                "
                class="inline h-4 w-4"
              />
            </TableHead>
            <TableHead @click="handleSort('sku')" class="cursor-pointer">
              SKU
              <ChevronUpIcon
                v-if="
                  sortConfig.column === 'sku' && sortConfig.direction === 'asc'
                "
                class="inline h-4 w-4"
              />
              <ChevronDownIcon
                v-if="
                  sortConfig.column === 'sku' && sortConfig.direction === 'desc'
                "
                class="inline h-4 w-4"
              />
            </TableHead>
            <TableHead @click="handleSort('unit')" class="cursor-pointer">
              Unit
              <ChevronUpIcon
                v-if="
                  sortConfig.column === 'unit' && sortConfig.direction === 'asc'
                "
                class="inline h-4 w-4"
              />
              <ChevronDownIcon
                v-if="
                  sortConfig.column === 'unit' &&
                  sortConfig.direction === 'desc'
                "
                class="inline h-4 w-4"
              />
            </TableHead>
            <TableHead
              @click="handleSort('minimumStock')"
              class="cursor-pointer text-right"
            >
              Min Stock
              <ChevronUpIcon
                v-if="
                  sortConfig.column === 'minimumStock' &&
                  sortConfig.direction === 'asc'
                "
                class="inline h-4 w-4"
              />
              <ChevronDownIcon
                v-if="
                  sortConfig.column === 'minimumStock' &&
                  sortConfig.direction === 'desc'
                "
                class="inline h-4 w-4"
              />
            </TableHead>
            <TableHead
              @click="handleSort('currentStock')"
              class="cursor-pointer text-right"
            >
              Current Stock
              <ChevronUpIcon
                v-if="
                  sortConfig.column === 'currentStock' &&
                  sortConfig.direction === 'asc'
                "
                class="inline h-4 w-4"
              />
              <ChevronDownIcon
                v-if="
                  sortConfig.column === 'currentStock' &&
                  sortConfig.direction === 'desc'
                "
                class="inline h-4 w-4"
              />
            </TableHead>
            <TableHead
              @click="handleSort('supplierPrice')"
              class="cursor-pointer text-right"
            >
              Price
              <ChevronUpIcon
                v-if="
                  sortConfig.column === 'supplierPrice' &&
                  sortConfig.direction === 'asc'
                "
                class="inline h-4 w-4"
              />
              <ChevronDownIcon
                v-if="
                  sortConfig.column === 'supplierPrice' &&
                  sortConfig.direction === 'desc'
                "
                class="inline h-4 w-4"
              />
            </TableHead>
            <TableHead
              @click="handleSort('currentVersion')"
              class="cursor-pointer"
            >
              Version
              <ChevronUpIcon
                v-if="
                  sortConfig.column === 'currentVersion' &&
                  sortConfig.direction === 'asc'
                "
                class="inline h-4 w-4"
              />
              <ChevronDownIcon
                v-if="
                  sortConfig.column === 'currentVersion' &&
                  sortConfig.direction === 'desc'
                "
                class="inline h-4 w-4"
              />
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="ingredient in sortedIngredients"
            :key="ingredient.id"
          >
            <TableCell>{{ ingredient.name }}</TableCell>
            <TableCell>{{ ingredient.sku }}</TableCell>
            <TableCell>{{ ingredient.unit }}</TableCell>
            <TableCell class="text-right">{{
              ingredient.minimumStock
            }}</TableCell>
            <TableCell class="text-right">
              <span
                :class="[
                  getTotalStock(ingredient) < ingredient.minimumStock
                    ? 'text-red-500'
                    : 'text-green-500',
                ]"
              >
                {{ getTotalStock(ingredient) }}
              </span>
            </TableCell>
            <TableCell class="text-right"
              >€{{ ingredient.supplierPrice }}</TableCell
            >
            <TableCell>v{{ ingredient.currentVersion }}</TableCell>
            <TableCell class="text-right space-x-2">
              <Button
                variant="ghost"
                size="icon"
                @click="editIngredient(ingredient)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="viewHistory(ingredient)"
              >
                <ClockIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="assignToWarehouse(ingredient)"
              >
                <WarehouseIcon class="h-4 w-4" />
                <span class="sr-only">Assign to warehouse</span>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog :open="showAddDialog" @update:open="handleDialogClose">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{
            isEditing ? "Edit Ingredient" : "Add Ingredient"
          }}</DialogTitle>
          <DialogDescription>
            {{
              isEditing
                ? "Update the ingredient details below."
                : "Add a new ingredient to your inventory."
            }}
          </DialogDescription>
        </DialogHeader>
        <p v-if="errorMessage" class="text-red-500 text-sm mt-2">
          {{ errorMessage }}
        </p>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input id="name" v-model="form.name" required />
            </div>
            <div class="space-y-2">
              <Label for="sku">SKU</Label>
              <Input id="sku" v-model="form.sku" required />
            </div>
            <div class="space-y-2">
              <Label for="unit">Unit</Label>
              <Select v-model="form.unit">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Units</SelectLabel>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="l">Liter (l)</SelectItem>
                    <SelectItem value="unit">Unit</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="minimumStock">Minimum Stock</Label>
              <Input
                id="minimumStock"
                type="number"
                v-model="form.minimumStock"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="supplierPrice">Supplier Price (€)</Label>
              <Input
                id="supplierPrice"
                type="number"
                step="0.01"
                v-model="form.supplierPrice"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="supplierLeadTime">Lead Time (days)</Label>
              <Input
                id="supplierLeadTime"
                type="number"
                v-model="form.supplierLeadTime"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              @click="showAddDialog = false"
            >
              Cancel
            </Button>
            <Button type="submit">
              {{ isEditing ? "Update" : "Create" }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Show Version Dialog -->
    <Dialog :open="showVersionDialog" @update:open="showVersionDialog = false">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            History of changes for {{ selectedIngredient?.name }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div v-if="selectedIngredient?.versions?.length" class="space-y-4">
            <!-- Sort versions in chronological order, newest first -->
            <div
              v-for="(version, index) in sortedVersions"
              :key="version.id"
              class="relative pb-4"
            >
              <!-- Version timeline dot and line -->
              <div
                class="absolute left-0 -ml-2 h-full w-0.5 bg-gray-200"
                v-if="index !== 0"
              />
              <div
                class="absolute left-0 -ml-3 mt-1 h-4 w-4 rounded-full border-2 border-primary bg-background"
              />

              <!-- Version content -->
              <div class="ml-6">
                <div class="flex items-baseline space-x-2">
                  <span class="font-medium">Version {{ version.version }}</span>
                  <span class="text-sm text-muted-foreground">
                    {{
                      formatDistanceToNow(new Date(version.updatedAt), {
                        addSuffix: true,
                      })
                    }}
                  </span>
                </div>

                <p class="text-sm text-muted-foreground">
                  Updated by {{ version.updatedBy?.name }}
                </p>

                <!-- Show changes if not the newest version -->
                <div v-if="index > 0" class="mt-2 space-y-1">
                  <p
                    v-for="change in formatChanges(
                      sortedVersions[index - 1],
                      version
                    )"
                    :key="change"
                    class="text-sm"
                  >
                    {{ change }}
                  </p>
                </div>

                <!-- Show complete state for newest version -->
                <div v-else class="mt-2 space-y-1 text-sm">
                  <p>Current version</p>
                  <p>Minimum stock: {{ version.minimumStock }}</p>
                  <p>Unit: {{ version.unit }}</p>
                  <p>Supplier price: €{{ version.supplierPrice }}</p>
                  <p>Lead time: {{ version.supplierLeadTime }} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog :open="showAssignDialog" @update:open="showAssignDialog = false">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign to Warehouse</DialogTitle>
          <DialogDescription>
            Assign {{ selectedIngredient?.name }} to warehouses and set
            quantities
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div
            v-for="warehouse in warehouses"
            :key="warehouse.id"
            class="space-y-2"
          >
            <div class="flex items-center justify-between">
              <Label>{{ warehouse.name }}</Label>
              <div class="flex items-center space-x-2">
                <Input
                  type="number"
                  class="w-24"
                  v-model="warehouseAssignments[warehouse.id]"
                  placeholder="Quantity"
                />
                <span class="text-sm text-muted-foreground">{{
                  selectedIngredient?.unit
                }}</span>
              </div>
            </div>
            <!-- Show current stock if any -->
            <p class="text-sm text-muted-foreground">
              Current stock: {{ getCurrentStock(warehouse.id) }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            @click="showAssignDialog = false"
          >
            Cancel
          </Button>
          <Button type="submit" @click="handleAssignSubmit">
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Add Order from Supplier dialog -->
    <Dialog :open="showOrderDialog" @update:open="showOrderDialog = false">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order from Supplier</DialogTitle>
          <DialogDescription>
            Create a purchase order for {{ selectedIngredient?.name }}
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleOrderSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label>Quantity</Label>
            <div class="flex items-center space-x-2">
              <Input type="number" v-model="orderForm.quantity" required />
              <span class="text-sm text-muted-foreground">{{
                selectedIngredient?.unit
              }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Expected Delivery Date</Label>
            <Input
              type="date"
              v-model="orderForm.deliveryDate"
              :min="minDeliveryDate"
              required
            />
          </div>

          <div class="space-y-2">
            <Label>Notes</Label>
            <Textarea
              v-model="orderForm.notes"
              placeholder="Any special instructions..."
            />
          </div>

          <p class="text-sm text-muted-foreground">
            Estimated cost: €{{ calculateOrderCost }}
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              @click="showOrderDialog = false"
            >
              Cancel
            </Button>
            <Button type="submit"> Place Order </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Select } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  WarehouseIcon,
} from "lucide-vue-next";
import { reactive, ref } from "vue";
import { exportToCSV } from "~/utils/export";

import SelectLabel from "~/components/ui/select/SelectLabel.vue";
import SelectTrigger from "~/components/ui/select/SelectTrigger.vue";
import type { IngredientForm } from "~/types";

definePageMeta({
  layout: "dashboard",
});

// Add this fetch
const { data: users } = await useFetch("/api/users");
console.log("Available users:", users.value);

// Add state for version history dialog
const showVersionDialog = ref(false);
const selectedIngredient = ref<any>(null);
const showAssignDialog = ref(false);
const showOrderDialog = ref(false);
const warehouseAssignments = reactive<Record<string, number>>({});
const orderForm = reactive({
  quantity: 0,
  deliveryDate: "",
  notes: "",
});

// Compute sorted versions, newest first
const sortedVersions = computed(() => {
  if (!selectedIngredient.value?.versions) return [];
  return [...selectedIngredient.value.versions].sort(
    (a, b) => parseInt(b.version) - parseInt(a.version)
  );
});

// Add sorting state
const sortConfig = ref({
  column: "name",
  direction: "asc" as "asc" | "desc",
});

// Form state
const showAddDialog = ref(false);
const isEditing = ref(false);
const form = reactive<IngredientForm>({
  name: "",
  sku: "",
  unit: "kg",
  minimumStock: 0,
  supplierPrice: 0,
  supplierLeadTime: 1,
});
// Computed sorted ingredients
const sortedIngredients = computed(() => {
  return sortIngredients(ingredients.value || []);
});
const calculateOrderCost = computed(() => {
  if (!selectedIngredient.value || !orderForm.quantity) return 0;
  return (selectedIngredient.value.supplierPrice * orderForm.quantity).toFixed(
    2
  );
});

const minDeliveryDate = computed(() => {
  const date = new Date();
  date.setDate(
    date.getDate() + (selectedIngredient.value?.supplierLeadTime || 0)
  );
  return date.toISOString().split("T")[0];
});

// Add error handling for duplicate SKU
const errorMessage = ref("");

// Data fetching
const { data: ingredients, refresh } = await useFetch(
  "/api/inventory/ingredients"
);

const { data: warehouses } = await useFetch("/api/inventory/warehouses");

// Utility functions
function getCurrentStock(warehouseId: string) {
  const inventory = selectedIngredient.value?.warehouses?.find(
    (w: any) => w.warehouseId === warehouseId
  );
  return inventory?.currentStock || 0;
}

function getTotalStock(ingredient: any) {
  return (
    ingredient.warehouses?.reduce(
      (total: number, w: any) => total + w.currentStock,
      0
    ) || 0
  );
}

function assignToWarehouse(ingredient: any) {
  selectedIngredient.value = ingredient;
  // Initialize current assignments
  warehouses.value?.forEach((warehouse: any) => {
    const currentAssignment = ingredient.warehouses?.find(
      (w: any) => w.warehouseId === warehouse.id
    );
    warehouseAssignments[warehouse.id] = currentAssignment?.currentStock || 0;
  });
  showAssignDialog.value = true;
}

function resetForm() {
  isEditing.value = false;
  form.name = "";
  form.sku = "";
  form.unit = "kg";
  form.minimumStock = 0;
  form.supplierPrice = 0;
  form.supplierLeadTime = 1;
}

async function handleAssignSubmit() {
  try {
    await $fetch(
      `/api/inventory/ingredients/${selectedIngredient.value.id}/assign`,
      {
        method: "POST",
        body: warehouseAssignments,
      }
    );
    showAssignDialog.value = false;
    refresh();
  } catch (error) {
    console.error("Error assigning to warehouses:", error);
  }
}

// Update dialog close handlers
function handleDialogClose() {
  showAddDialog.value = false;
  resetForm();
}

// Add ingredient handler
function addIngredient() {
  resetForm();
  showAddDialog.value = true;
}

function editIngredient(ingredient: any) {
  isEditing.value = true;
  Object.assign(form, ingredient);
  showAddDialog.value = true;
}

// Sort function
function sortIngredients(ingredients: any[]) {
  return [...ingredients].sort((a, b) => {
    const modifier = sortConfig.value.direction === "asc" ? 1 : -1;

    if (sortConfig.value.column === "currentStock") {
      return (getTotalStock(a) - getTotalStock(b)) * modifier;
    }

    const aValue = a[sortConfig.value.column];
    const bValue = b[sortConfig.value.column];

    if (typeof aValue === "number") {
      return (aValue - bValue) * modifier;
    }

    // Handle version sorting
    if (sortConfig.value.column === "currentVersion") {
      return (parseInt(aValue) - parseInt(bValue)) * modifier;
    }

    return String(aValue).localeCompare(String(bValue)) * modifier;
  });
}

// Handle sort click
function handleSort(column: string) {
  if (sortConfig.value.column === column) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.column = column;
    sortConfig.value.direction = "asc";
  }
}

function viewHistory(ingredient: any) {
  selectedIngredient.value = ingredient;
  showVersionDialog.value = true;
}

// Update formatChanges to show changes more intuitively
function formatChanges(previousVersion: any, currentVersion: any) {
  const changes = [];

  if (previousVersion.minimumStock !== currentVersion.minimumStock) {
    changes.push(
      `Minimum stock changed was ${currentVersion.minimumStock} compared to ${previousVersion.minimumStock} now`
    );
  }
  if (previousVersion.unit !== currentVersion.unit) {
    changes.push(
      `Unit changed was ${currentVersion.unit} compared to ${previousVersion.unit} now`
    );
  }
  if (previousVersion.supplierPrice !== currentVersion.supplierPrice) {
    changes.push(
      `Supplier price was €${currentVersion.supplierPrice} compared to €${previousVersion.supplierPrice} now`
    );
  }
  if (previousVersion.supplierLeadTime !== currentVersion.supplierLeadTime) {
    changes.push(
      `Lead time changed was ${currentVersion.supplierLeadTime} compared to ${previousVersion.supplierLeadTime} days now`
    );
  }
  if (previousVersion.sku !== currentVersion.sku) {
    changes.push(
      `SKU was ${currentVersion.sku} compared to ${previousVersion.sku} now`
    );
  }

  return changes;
}

// Add export handler
function handleExport() {
  if (!ingredients.value) return;

  const date = new Date().toISOString().split("T")[0];
  const data = {
    headers: [
      "Name",
      "SKU",
      "Unit",
      "Minimum Stock",
      "Current Stock",
      "Price (€)",
      "Version",
    ],
    rows: ingredients.value.map((item) => [
      item.name,
      item.sku,
      item.unit,
      item.minimumStock,
      getTotalStock(item),
      item.supplierPrice,
      `v${item.currentVersion}`,
    ]),
  };

  exportToCSV(data, `ingredients-${date}`);
}

async function handleOrderSubmit() {
  try {
    await $fetch(
      `/api/inventory/ingredients/${selectedIngredient.value.id}/order`,
      {
        method: "POST",
        body: orderForm,
      }
    );
    showOrderDialog.value = false;
    refresh();
  } catch (error) {
    console.error("Error placing order:", error);
  }
}

async function handleSubmit() {
  try {
    errorMessage.value = "";
    const formData = {
      ...form,
      minimumStock: Number(form.minimumStock),
      supplierPrice: Number(form.supplierPrice),
      supplierLeadTime: Number(form.supplierLeadTime),
    };

    if (isEditing.value) {
      await $fetch(`/api/inventory/ingredients/${form.id}`, {
        method: "PUT",
        body: formData,
      });
    } else {
      await $fetch("/api/inventory/ingredients", {
        method: "POST",
        body: formData,
      });
    }

    handleDialogClose();
    await refresh();
  } catch (error: any) {
    if (error.statusCode === 409) {
      errorMessage.value =
        "This SKU is already in use. Please choose another one.";
    } else {
      errorMessage.value = "An error occurred while saving the ingredient.";
    }
  }
}
</script>
