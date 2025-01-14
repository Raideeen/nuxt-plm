<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Production Lines</h2>
        <p class="text-muted-foreground">
          Manage your production schedules and batches
        </p>
      </div>
      <div class="flex space-x-2">
        <Button
          v-if="can('production', 'export')"
          variant="outline"
          @click="viewAllBOMs"
        >
          <ClipboardListIcon class="mr-2 h-4 w-4" />
          Generate All BOMs
        </Button>
        <Button v-if="can('production', 'create')" @click="addProductionLine">
          <PlusIcon class="mr-2 h-4 w-4" />
          Add Production Line
        </Button>
      </div>
    </div>

    <!-- Production Lines Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Recipe</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead class="text-right">Quantity</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Production</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stock Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="line in productionLines" :key="line.id">
            <TableCell class="font-medium">{{ line.name }}</TableCell>
            <TableCell>{{ line.recipe?.name }}</TableCell>
            <TableCell>{{ line.destination }}</TableCell>
            <TableCell class="text-right">
              {{ line.quantity }} × {{ line.unitsPerPack }} units
            </TableCell>
            <TableCell>{{ formatFrequency(line.frequency) }}</TableCell>
            <TableCell>{{ formatDate(line.nextProductionDate) }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(line.status)">
                {{ formatStatus(line.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getStockStatusVariant(line)">
                {{ getStockStatus(line) }}
              </Badge>
            </TableCell>
            <TableCell class="text-right space-x-2">
              <!-- Edit button -->
              <Button
                v-if="can('production', 'edit')"
                variant="ghost"
                size="icon"
                @click="viewProductionLine(line)"
              >
                <PencilIcon class="h-4 w-4" />
                <span class="sr-only">Edit line</span>
              </Button>
              <!-- BOM Button -->
              <Button
                v-if="can('production', 'viewBOM')"
                variant="ghost"
                size="icon"
                @click="viewBOM(line)"
                type="button"
              >
                <ClipboardIcon class="h-4 w-4" />
                <span class="sr-only">View BOM</span>
              </Button>
            </TableCell>
          </TableRow>

          <!-- Empty state -->
          <TableRow v-if="!productionLines?.length">
            <TableCell colspan="9" class="h-24 text-center">
              No production lines found. Click 'Add Production Line' to create
              one.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Production Line Dialog (Notion-like) -->
    <Dialog :open="showLineDialog" @update:open="handleDialogClose">
      <DialogContent class="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? "Edit Production Line" : "Create Production Line" }}
          </DialogTitle>
          <DialogDescription>
            {{
              isEditing
                ? "Update production line details."
                : "Set up a new production line."
            }}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea class="flex-1 px-1">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Name</Label>
                <Input v-model="form.name" required />
              </div>
              <div class="space-y-2">
                <Label>Recipe</Label>
                <Select v-model="form.recipeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Recipes</SelectLabel>
                      <SelectItem
                        v-for="recipe in recipes"
                        :key="recipe.id"
                        :value="recipe.id"
                      >
                        {{ recipe.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Quantity and Pack Size -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Number of Packs</Label>
                <Input type="number" v-model="form.quantity" min="1" required />
              </div>
              <div class="space-y-2">
                <Label>Units per Pack</Label>
                <Input
                  type="number"
                  v-model="form.unitsPerPack"
                  min="1"
                  required
                />
              </div>
            </div>

            <!-- Destination -->
            <div class="space-y-2">
              <Label>Destination</Label>
              <Input v-model="form.destination" required />
            </div>

            <!-- Schedule -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Frequency</Label>
                <Select v-model="form.frequency" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-off">One-off</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  v-model="form.startDate"
                  :min="tomorrow"
                  required
                />
              </div>
            </div>

            <!-- Stock Requirements -->
            <div class="space-y-2">
              <h4 class="text-sm font-medium">Required Ingredients</h4>
              <div class="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead class="text-right">Required</TableHead>
                      <TableHead class="text-right">Total Stock</TableHead>
                      <TableHead>Stock Distribution</TableHead>
                      <TableHead class="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="item in warehouseStockDetails"
                      :key="item.id"
                    >
                      <TableCell>{{ item.name }}</TableCell>
                      <TableCell class="text-right">
                        {{ item.required }} {{ item.unit }}
                      </TableCell>
                      <TableCell class="text-right">
                        {{ item.totalStock }} {{ item.unit }}
                      </TableCell>
                      <TableCell>
                        <div class="space-y-2 pl-4">
                          <div
                            v-for="warehouse in item.warehouseStocks"
                            :key="warehouse.warehouseId"
                            class="flex items-center gap-4"
                          >
                            <div class="flex-1">
                              <Label>{{ warehouse.warehouseName }}</Label>
                              <p class="text-sm text-muted-foreground">
                                Available: {{ warehouse.stock }} {{ item.unit }}
                              </p>
                            </div>
                            <div class="w-32">
                              <Input
                                type="number"
                                :value="
                                  allocations[
                                    `${item.id}-${warehouse.warehouseId}`
                                  ] || 0
                                "
                                @input="
                                  (e) => {
                                    allocations[
                                      `${item.id}-${warehouse.warehouseId}`
                                    ] = Number(e.target.value);
                                    validateAllocations();
                                  }
                                "
                                :max="warehouse.stock"
                                :min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell class="text-right">
                        <Badge
                          :variant="
                            item.status === 'sufficient'
                              ? 'success'
                              : 'destructive'
                          "
                        >
                          {{
                            item.status === "sufficient"
                              ? "Available"
                              : "Insufficient"
                          }}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <!-- Warehouse Allocation -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium">Warehouse Allocation</h4>

              <div
                v-for="item in warehouseStockDetails"
                :key="item.id"
                class="space-y-2"
              >
                <div class="flex justify-between items-center">
                  <Label
                    >{{ item.name }} (Need: {{ item.required }}
                    {{ item.unit }})</Label
                  >
                  <Badge :variant="getItemAllocationStatus(item)">
                    {{ getAllocatedQuantity(item) }}/{{ item.required }}
                    {{ item.unit }}
                  </Badge>
                </div>

                <!-- Warehouse selection for each ingredient -->
                <div class="space-y-2 pl-4">
                  <div
                    v-for="warehouse in item.warehouseStocks"
                    :key="warehouse.warehouseId"
                    class="flex items-center gap-4"
                  >
                    <div class="flex-1">
                      <Label>{{ warehouse.warehouseName }}</Label>
                      <p class="text-sm text-muted-foreground">
                        Available: {{ warehouse.stock }} {{ item.unit }}
                      </p>
                    </div>
                    <div class="w-32">
                      <Input
                        type="number"
                        v-model="
                          allocations[`${item.id}-${warehouse.warehouseId}`]
                        "
                        :max="warehouse.stock"
                        :min="0"
                        step="0.01"
                        @input="validateAllocations"
                      />
                    </div>
                  </div>
                </div>

                <!-- Transfer suggestions if needed -->
                <div
                  v-if="getTransferSuggestions(item).length > 0"
                  class="mt-2 p-2 bg-muted rounded-md"
                >
                  <p class="text-sm font-medium">Suggested Transfers:</p>
                  <ul class="text-sm space-y-1">
                    <li
                      v-for="(suggestion, idx) in getTransferSuggestions(item)"
                      :key="idx"
                      class="text-muted-foreground"
                    >
                      Transfer {{ suggestion.quantity }} {{ item.unit }} from
                      {{ suggestion.fromWarehouse }} to
                      {{ suggestion.toWarehouse }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter class="mt-4">
          <Button type="button" variant="ghost" @click="handleDialogClose">
            Cancel
          </Button>
          <Button
            type="submit"
            @click="handleSubmit"
            :disabled="!hasRequiredStock || !isAllocationValid"
          >
            {{ isEditing ? "Update" : "Create" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Add BOM Dialog -->
    <Dialog :open="showBOMDialog" @update:open="showBOMDialog = false">
      <DialogContent class="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bill of Materials</DialogTitle>
          <DialogDescription>
            Production details and material requirements for
            {{ selectedLine?.name }}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea class="flex-1 px-1">
          <div v-if="bomDetails" class="space-y-6">
            <!-- Production Summary -->
            <Card>
              <CardHeader>
                <CardTitle>Production Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl class="grid grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-muted-foreground">
                      Recipe
                    </dt>
                    <dd class="text-sm">
                      {{ bomDetails.productionLine.recipe }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-muted-foreground">
                      Quantity
                    </dt>
                    <dd class="text-sm">
                      {{ bomDetails.productionLine.quantity }} packs of
                      {{ bomDetails.productionLine.unitsPerPack }} units
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-muted-foreground">
                      Total Units
                    </dt>
                    <dd class="text-sm">
                      {{ bomDetails.productionLine.totalUnits }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-muted-foreground">
                      Next Production
                    </dt>
                    <dd class="text-sm">
                      {{
                        formatDate(bomDetails.productionLine.nextProductionDate)
                      }}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <!-- Cost Summary -->
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm font-medium">Material Cost:</span>
                    <span class="text-sm"
                      >€{{ bomDetails.totals.materialCost.toFixed(2) }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm font-medium">Cost per Unit:</span>
                    <span class="text-sm">
                      €{{
                        (
                          bomDetails.totals.materialCost /
                          bomDetails.productionLine.totalUnits
                        ).toFixed(2)
                      }}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Ingredients Table -->
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead class="text-right">Per Unit</TableHead>
                    <TableHead class="text-right">Total Required</TableHead>
                    <TableHead class="text-right">Unit Cost</TableHead>
                    <TableHead class="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="item in bomDetails.ingredients"
                    :key="item.ingredient.id"
                  >
                    <TableCell>{{ item.ingredient.name }}</TableCell>
                    <TableCell class="text-right">
                      {{ item.recipeQuantity }} {{ item.ingredient.unit }}
                    </TableCell>
                    <TableCell class="text-right">
                      {{ item.totalRequired }} {{ item.ingredient.unit }}
                    </TableCell>
                    <TableCell class="text-right"
                      >€{{ item.unitCost }}</TableCell
                    >
                    <TableCell class="text-right"
                      >€{{ item.totalCost.toFixed(2) }}</TableCell
                    >
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan="4">Total Material Cost</TableCell>
                    <TableCell class="text-right">
                      €{{ bomDetails.totals.materialCost.toFixed(2) }}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <!-- Warehouse Allocations -->
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Allocations</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div
                    v-for="item in bomDetails.ingredients"
                    :key="item.ingredient.id"
                  >
                    <h4 class="text-sm font-medium mb-2">
                      {{ item.ingredient.name }}
                    </h4>
                    <div class="pl-4 space-y-2">
                      <div
                        v-for="allocation in item.allocations"
                        :key="allocation.warehouse"
                        class="flex justify-between text-sm"
                      >
                        <span>{{ allocation.warehouse }}</span>
                        <span
                          >{{ allocation.quantity }}
                          {{ item.ingredient.unit }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter class="mt-4">
          <Button variant="outline" @click="exportBOM">
            <DownloadIcon class="mr-2 h-4 w-4" />
            Export BOM
          </Button>
          <Button @click="showBOMDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- All BOM Dialog -->
    <Dialog :open="showAllBOMsDialog" @update:open="showAllBOMsDialog = false">
      <DialogContent class="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Production Lines - All BOMs</DialogTitle>
          <DialogDescription>
            Consolidated view of all production line BOMs
          </DialogDescription>
        </DialogHeader>

        <ScrollArea class="flex-1 px-1">
          <div v-if="allBomDetails" class="space-y-6">
            <!-- Summary Card -->
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl class="grid grid-cols-3 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-muted-foreground">
                      Total Production Lines
                    </dt>
                    <dd class="text-2xl font-bold">
                      {{ allBomDetails.summary.totalLines }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-muted-foreground">
                      Total Units
                    </dt>
                    <dd class="text-2xl font-bold">
                      {{ allBomDetails.summary.totalUnits }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-muted-foreground">
                      Total Cost
                    </dt>
                    <dd class="text-2xl font-bold">
                      €{{ allBomDetails.summary.totalCost.toFixed(2) }}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <!-- Individual BOMs -->
            <div
              v-for="bom in allBomDetails.boms"
              :key="bom.productionLine.id"
              class="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{{ bom.productionLine.name }}</CardTitle>
                  <CardDescription>
                    {{ bom.productionLine.recipe }} -
                    {{ bom.productionLine.quantity }} packs of
                    {{ bom.productionLine.unitsPerPack }} units
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead class="text-right">Per Unit</TableHead>
                        <TableHead class="text-right">Total Required</TableHead>
                        <TableHead class="text-right">Unit Cost</TableHead>
                        <TableHead class="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow
                        v-for="item in bom.ingredients"
                        :key="item.ingredient.id"
                      >
                        <TableCell>{{ item.ingredient.name }}</TableCell>
                        <TableCell class="text-right">
                          {{ item.recipeQuantity }} {{ item.ingredient.unit }}
                        </TableCell>
                        <TableCell class="text-right">
                          {{ item.totalRequired }} {{ item.ingredient.unit }}
                        </TableCell>
                        <TableCell class="text-right"
                          >€{{ item.unitCost }}</TableCell
                        >
                        <TableCell class="text-right"
                          >€{{ item.totalCost.toFixed(2) }}</TableCell
                        >
                      </TableRow>
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan="4">Line Total</TableCell>
                        <TableCell class="text-right">
                          €{{
                            bom.ingredients
                              .reduce((sum, i) => sum + i.totalCost, 0)
                              .toFixed(2)
                          }}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>

                  <!-- Warehouse Allocations -->
                  <div class="mt-4">
                    <h4 class="text-sm font-medium mb-2">
                      Warehouse Allocations
                    </h4>
                    <div class="space-y-2">
                      <div
                        v-for="item in bom.ingredients"
                        :key="item.ingredient.id"
                        class="text-sm"
                      >
                        <div class="flex justify-between">
                          <span class="font-medium">{{
                            item.ingredient.name
                          }}</span>
                          <div class="space-x-4">
                            <span
                              v-for="alloc in item.allocations"
                              :key="alloc.warehouse"
                            >
                              {{ alloc.warehouse }}: {{ alloc.quantity }}
                              {{ item.ingredient.unit }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter class="mt-4">
          <Button variant="outline" @click="exportAllBOMs">
            <DownloadIcon class="mr-2 h-4 w-4" />
            Export All BOMs
          </Button>
          <Button @click="showAllBOMsDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { addDays, format } from "date-fns";
import {
  ClipboardIcon,
  ClipboardListIcon,
  DownloadIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

// State
const showLineDialog = ref(false);
const isEditing = ref(false);
const selectedLine = ref<any>(null);
const allocations = reactive<Record<string, number>>({});
const showBOMDialog = ref(false);
const bomDetails = ref<any>(null);
const showAllBOMsDialog = ref(false);
const allBomDetails = ref<any>(null);
const { can } = usePermissions();

// Form state
const form = reactive({
  name: "",
  recipeId: "",
  destination: "",
  quantity: 1,
  unitsPerPack: 6,
  frequency: "one-off",
  startDate: "",
});

// Data fetching
const { data: recipes } = await useFetch("/api/products/recipes");
const { data: ingredients } = await useFetch("/api/inventory/ingredients");
const { data: warehouses } = await useFetch("/api/inventory/warehouses");
const { data: productionLines, refresh } = await useFetch("/api/production", {
  transform: (data) => {
    console.log("Raw production lines:", data);
    return data?.map((line: any) => ({
      ...line,
      recipe: line.recipe || { name: "Unknown Recipe" },
    }));
  },
});

// Computed
const tomorrow = computed(() => {
  return format(addDays(new Date(), 1), "yyyy-MM-dd");
});

const selectedRecipe = computed(() => {
  if (!form.recipeId) return null;
  return recipes.value?.find((r) => r.id === form.recipeId);
});

const requiredIngredients = computed(() => {
  if (!selectedRecipe.value) return [];

  return selectedRecipe.value.ingredients.map((item) => {
    const ingredient = item.ingredient;
    const totalRequired = item.quantity * form.quantity * form.unitsPerPack;
    const inStock = getTotalStock(ingredient.id);

    return {
      id: ingredient.id,
      name: ingredient.name,
      required: totalRequired,
      unit: ingredient.unit,
      inStock,
      status: inStock >= totalRequired ? "sufficient" : "insufficient",
    };
  });
});

const hasRequiredStock = computed(() => {
  return requiredIngredients.value.every(
    (item) => item.status === "sufficient"
  );
});

const warehouseStockDetails = computed(() => {
  if (!selectedRecipe.value) return [];

  return selectedRecipe.value.ingredients.map((item) => {
    const ingredient = item.ingredient;
    const totalRequired = item.quantity * form.quantity * form.unitsPerPack;

    // Get stock by warehouse
    const warehouseStocks =
      ingredients.value
        ?.find((i) => i.id === ingredient.id)
        ?.warehouses?.map((w) => ({
          warehouseName:
            warehouses.value?.find((wh) => wh.id === w.warehouseId)?.name ||
            "Unknown",
          stock: w.currentStock,
        })) || [];

    const totalStock = warehouseStocks.reduce((sum, w) => sum + w.stock, 0);

    return {
      id: ingredient.id,
      name: ingredient.name,
      required: totalRequired,
      unit: ingredient.unit,
      totalStock,
      warehouseStocks,
      status: totalStock >= totalRequired ? "sufficient" : "insufficient",
    };
  });
});

const isAllocationValid = computed(() => {
  return warehouseStockDetails.value.every((item) => {
    const totalAllocated = getAllocatedQuantity(item);
    return totalAllocated === item.required;
  });
});

// Utility functions
function getTotalStock(ingredientId: string) {
  const ingredient = ingredients.value?.find((i) => i.id === ingredientId);
  return (
    ingredient?.warehouses?.reduce((sum, w) => sum + w.currentStock, 0) || 0
  );
}

function formatFrequency(frequency: string) {
  const map: Record<string, string> = {
    "one-off": "One-off",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };
  return map[frequency] || frequency;
}

function formatDate(date: string | Date | null) {
  if (!date) return "-";
  return format(new Date(date), "MMM d, yyyy");
}

function formatStatus(status: string) {
  const map: Record<string, string> = {
    planned: "Planned",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "success" | "destructive" {
  const map: Record<string, any> = {
    planned: "secondary",
    "in-progress": "default",
    completed: "success",
    cancelled: "destructive",
  };
  return map[status] || "default";
}

function getStockStatus(line: any) {
  const recipe = line.recipe;
  const hasAllIngredients = recipe.ingredients.every((item) => {
    const totalRequired = item.quantity * line.quantity * line.unitsPerPack;
    const inStock = getTotalStock(item.ingredient.id);
    return inStock >= totalRequired;
  });

  return hasAllIngredients ? "Ready" : "Missing Ingredients";
}

function getStockStatusVariant(line: any): "success" | "destructive" {
  return getStockStatus(line) === "Ready" ? "success" : "destructive";
}

// Dialog handlers
function addProductionLine() {
  isEditing.value = false;
  resetForm();
  showLineDialog.value = true;
}

function viewProductionLine(line: any) {
  isEditing.value = true;
  selectedLine.value = line;
  Object.assign(form, {
    name: line.name,
    recipeId: line.recipeId,
    destination: line.destination,
    quantity: line.quantity,
    unitsPerPack: line.unitsPerPack,
    frequency: line.frequency,
    startDate: format(new Date(line.startDate), "yyyy-MM-dd"),
  });
  showLineDialog.value = true;
}

function handleDialogClose() {
  showLineDialog.value = false;
  resetForm();
}

function resetForm() {
  form.name = "";
  form.recipeId = "";
  form.destination = "";
  form.quantity = 1;
  form.unitsPerPack = 6;
  form.frequency = "one-off";
  form.startDate = "";
  selectedLine.value = null;
}

function validateAllocations() {
  // Ensure allocations don't exceed available stock
  Object.entries(allocations).forEach(([key, value]) => {
    const [ingredientId, warehouseId] = key.split("-");
    const item = warehouseStockDetails.value.find((i) => i.id === ingredientId);
    const warehouse = item?.warehouseStocks.find(
      (w) => w.warehouseId === warehouseId
    );

    if (warehouse && value > warehouse.stock) {
      allocations[key] = warehouse.stock;
    }
  });
}

function getAllocatedQuantity(item: any) {
  return Object.entries(allocations)
    .filter(([key]) => key.startsWith(item.id))
    .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
}

function getItemAllocationStatus(item: any) {
  const allocated = getAllocatedQuantity(item);
  if (allocated === 0) return "destructive";
  if (allocated < item.required) return "warning";
  return "success";
}

function getTransferSuggestions(item: any) {
  const suggestions = [];
  const required = item.required;
  const currentAllocations = item.warehouseStocks.reduce(
    (acc: any, warehouse: any) => {
      acc[warehouse.warehouseId] =
        Number(allocations[`${item.id}-${warehouse.warehouseId}`]) || 0;
      return acc;
    },
    {}
  );

  // Calculate total allocated
  const totalAllocated = Object.values(currentAllocations).reduce(
    (sum: any, val: any) => sum + val,
    0
  );

  if (totalAllocated < required) {
    const remaining = required - totalAllocated;

    // Sort warehouses by available stock
    const sortedWarehouses = [...item.warehouseStocks].sort(
      (a, b) =>
        b.stock -
        currentAllocations[b.warehouseId] -
        (a.stock - currentAllocations[a.warehouseId])
    );

    // Find best source warehouse (most available stock)
    const sourceWarehouse = sortedWarehouses.find(
      (w) => w.stock - currentAllocations[w.warehouseId] > 0
    );

    if (sourceWarehouse) {
      // Find warehouses that need stock
      const targetWarehouses = item.warehouseStocks.filter(
        (w) =>
          w.warehouseId !== sourceWarehouse.warehouseId &&
          currentAllocations[w.warehouseId] <
            required / item.warehouseStocks.length
      );

      targetWarehouses.forEach((target) => {
        const targetNeeds =
          required / item.warehouseStocks.length -
          currentAllocations[target.warehouseId];
        const sourceAvailable =
          sourceWarehouse.stock -
          currentAllocations[sourceWarehouse.warehouseId];
        const transferAmount = Math.min(targetNeeds, sourceAvailable);

        if (transferAmount > 0) {
          suggestions.push({
            fromWarehouse: sourceWarehouse.warehouseName,
            toWarehouse: target.warehouseName,
            quantity: Number(transferAmount.toFixed(2)),
          });
        }
      });
    }
  }

  return suggestions;
}

async function viewBOM(line: any) {
  try {
    console.log("Line passed to viewBOM:", line);
    if (!line?.id) {
      console.error("No production line ID provided");
      return;
    }

    console.log("Fetching BOM for line ID:", line.id);
    bomDetails.value = await $fetch(`/api/production/${line.id}/bom`);
    showBOMDialog.value = true;
  } catch (error) {
    console.error("Error fetching BOM:", error);
  }
}

async function viewAllBOMs() {
  try {
    const response = await $fetch("/api/production/boms");
    allBomDetails.value = response;
    showAllBOMsDialog.value = true;
  } catch (error) {
    console.error("Error fetching all BOMs:", error);
  }
}

function exportBOM() {
  if (!bomDetails.value) return;

  const data = {
    headers: [
      "Ingredient",
      "Per Unit",
      "Total Required",
      "Unit Cost",
      "Total Cost",
      "Warehouse Allocations",
    ],
    rows: bomDetails.value.ingredients.map((item: any) => [
      item.ingredient.name,
      `${item.recipeQuantity} ${item.ingredient.unit}`,
      `${item.totalRequired} ${item.ingredient.unit}`,
      `€${item.unitCost}`,
      `€${item.totalCost.toFixed(2)}`,
      item.allocations
        .map(
          (a: any) => `${a.warehouse}: ${a.quantity} ${item.ingredient.unit}`
        )
        .join("; "),
    ]),
    summary: [
      "Total",
      "",
      "",
      "",
      `€${bomDetails.value.totals.materialCost.toFixed(2)}`,
      "",
    ],
  };

  const filename = `bom-${bomDetails.value.productionLine.name
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
  exportToCSV(data, filename);
}

function exportAllBOMs() {
  if (!allBomDetails.value) return;

  const data = {
    headers: [
      "Production Line",
      "Recipe",
      "Quantity",
      "Ingredient",
      "Required Amount",
      "Unit Cost",
      "Total Cost",
      "Warehouse Allocations",
    ],
    rows: allBomDetails.value.boms.flatMap((bom) =>
      bom.ingredients.map((item) => [
        bom.productionLine.name,
        bom.productionLine.recipe,
        `${bom.productionLine.quantity} × ${bom.productionLine.unitsPerPack}`,
        item.ingredient.name,
        `${item.totalRequired} ${item.ingredient.unit}`,
        `€${item.unitCost}`,
        `€${item.totalCost.toFixed(2)}`,
        item.allocations
          .map((a) => `${a.warehouse}: ${a.quantity} ${item.ingredient.unit}`)
          .join("; "),
      ])
    ),
    summary: [
      "Total",
      "",
      `${allBomDetails.value.summary.totalUnits} units`,
      "",
      "",
      "",
      `€${allBomDetails.value.summary.totalCost.toFixed(2)}`,
      "",
    ],
  };

  const date = new Date().toISOString().split("T")[0];
  exportToCSV(data, `all-boms-${date}`);
}

// Form submission
async function handleSubmit() {
  try {
    if (!isAllocationValid.value) {
      // Show error about invalid allocations
      return;
    }

    const response = isEditing.value
      ? await $fetch(`/api/production/${selectedLine.value.id}`, {
          method: "PUT",
          body: {
            ...form,
            allocations: Object.entries(allocations).map(([key, value]) => {
              const [ingredientId, warehouseId] = key.split("-");
              return {
                ingredientId,
                warehouseId,
                quantity: value,
              };
            }),
          },
        })
      : await $fetch("/api/production", {
          method: "POST",
          body: {
            ...form,
            allocations: Object.entries(allocations).map(([key, value]) => {
              const [ingredientId, warehouseId] = key.split("-");
              return {
                ingredientId,
                warehouseId,
                quantity: value,
              };
            }),
          },
        });

    handleDialogClose();
    await refresh();
  } catch (error) {
    console.error("Error saving production line:", error);
  }
}
</script>
