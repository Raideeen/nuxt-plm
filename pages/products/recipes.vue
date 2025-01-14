<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Recipes</h2>
        <p class="text-muted-foreground">
          Create and manage your product recipes
        </p>
      </div>
      <div class="flex space-x-2">
        <Button
          v-if="can('recipes', 'export')"
          variant="outline"
          @click="handleAllBOMExport"
        >
          <DownloadIcon class="mr-2 h-4 w-4" />
          Export BOM
        </Button>

        <Button v-if="can('recipes', 'create')" @click="addRecipe">
          <PlusIcon class="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>
    </div>

    <!-- Recipes Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Ingredients</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Version</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="recipe in recipes" :key="recipe.id">
            <TableCell class="font-medium">{{ recipe.name }}</TableCell>
            <TableCell>{{ getIngredientsCount(recipe) }} ingredients</TableCell>
            <TableCell>{{
              formatDate(recipe.updatedAt, "MM/dd/yyyy")
            }}</TableCell>
            <TableCell>v{{ recipe.currentVersion }}</TableCell>
            <TableCell class="text-right space-x-2">
              <Button
                v-if="can('recipes', 'viewBOM')"
                variant="ghost"
                size="icon"
                @click="viewBOM(recipe)"
              >
                <ClipboardListIcon class="h-4 w-4" />
              </Button>
              <Button
                v-if="can('recipes', 'edit')"
                variant="ghost"
                size="icon"
                @click="editRecipe(recipe)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                v-if="can('recipes', 'viewHistory')"
                variant="ghost"
                size="icon"
                @click="viewHistory(recipe)"
              >
                <ClockIcon class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Add/Edit Recipe Dialog -->
    <Dialog :open="showRecipeDialog" @update:open="handleDialogClose">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{{
            isEditing ? "Edit Recipe" : "Create Recipe"
          }}</DialogTitle>
          <DialogDescription>
            {{
              isEditing
                ? "Update recipe details and ingredients."
                : "Create a new recipe with ingredients."
            }}
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-2">
              <Label>Recipe Name</Label>
              <Input v-model="form.name" required />
            </div>
            <div class="space-y-2">
              <Label>Description</Label>
              <Textarea v-model="form.description" />
            </div>
          </div>

          <!-- Ingredients -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <Label>Ingredients</Label>
              <Button type="button" variant="outline" @click="addIngredient">
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            <div
              v-for="(ingredient, index) in form.ingredients"
              :key="index"
              class="grid grid-cols-3 gap-4 items-end"
            >
              <div class="space-y-2">
                <Label>Ingredient</Label>
                <Select v-model="ingredient.ingredientId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="ing in availableIngredients"
                      :key="ing.id"
                      :value="ing.id"
                    >
                      {{ ing.name }} ({{ ing.unit }})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  v-model="ingredient.quantity"
                  min="0"
                  step="0.01"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                @click="removeIngredient(index)"
              >
                <TrashIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" @click="handleDialogClose">
              Cancel
            </Button>
            <Button type="submit">
              {{ isEditing ? "Update Recipe" : "Create Recipe" }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- BOM Dialog -->
    <Dialog :open="showBOMDialog" @update:open="showBOMDialog = false">
      <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle
            >Bill of Materials - {{ selectedRecipe?.name }}</DialogTitle
          >
          <DialogDescription>
            Detailed breakdown of required ingredients and costs
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-6">
          <!-- Summary Section -->
          <div class="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <EuroIcon class="h-4 w-4 text-primary" />
                  <span>Production Cost</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">€{{ calculateTotalCost }}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <ClipboardListIcon class="h-4 w-4 text-primary" />
                  <span>Recipe Ingredients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ selectedRecipe?.ingredients?.length || 0 }}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <BoxIcon class="h-4 w-4 text-primary" />
                  <span>Inventory Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge :variant="overallStockStatus.variant">
                  {{ overallStockStatus.label }}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <!-- Ingredients Table -->
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead class="text-right">Required</TableHead>
                  <TableHead class="text-right">In Stock</TableHead>
                  <TableHead class="text-right">Unit Cost</TableHead>
                  <TableHead class="text-right">Total Cost</TableHead>
                  <TableHead class="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="item in bomCalculations"
                  :key="item.ingredientId"
                  :class="{ 'bg-red-50': item.status === 'insufficient' }"
                >
                  <TableCell>{{ item.name }}</TableCell>
                  <TableCell class="text-right">
                    {{ item.required }} {{ item.unit }}
                  </TableCell>
                  <TableCell class="text-right">
                    {{ item.inStock }} {{ item.unit }}
                  </TableCell>
                  <TableCell class="text-right">
                    €{{ item.unitCost }}
                  </TableCell>
                  <TableCell class="text-right">
                    €{{ item.totalCost }}
                  </TableCell>
                  <TableCell class="text-right">
                    <Badge
                      :variant="
                        item.status === 'sufficient' ? 'success' : 'destructive'
                      "
                    >
                      {{
                        item.status === "sufficient"
                          ? "In Stock"
                          : "Insufficient"
                      }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="handleSingleBOMExport">
              <DownloadIcon class="mr-2 h-4 w-4" />
              Export BOM
            </Button>
            <Button @click="showBOMDialog = false">Close</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Version History Dialog -->
    <Dialog :open="showVersionDialog" @update:open="showVersionDialog = false">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle
            >Version History - {{ selectedRecipe?.name }}</DialogTitle
          >
          <DialogDescription> Track changes and updates </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div v-if="sortedVersions.length" class="space-y-4">
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

                <p class="mt-2 text-sm">
                  {{ version.changelog }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-muted-foreground py-4">
            No version history available
          </div>
        </div>

        <DialogFooter>
          <Button @click="showVersionDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatDistanceToNow } from "date-fns";
import {
  BoxIcon,
  ClipboardListIcon,
  ClockIcon,
  DownloadIcon,
  EuroIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-vue-next";
definePageMeta({
  layout: "dashboard",
});

// State
const showRecipeDialog = ref(false);
const showBOMDialog = ref(false);
const showVersionDialog = ref(false);
const isEditing = ref(false);
const selectedRecipe = ref<any>(null);
const { can } = usePermissions();

// Form state
const form = reactive({
  name: "",
  description: "",
  ingredients: [] as any[],
  changelog: "",
});

// Data fetching
const { data: recipes, refresh } = await useFetch("/api/products/recipes");
const { data: availableIngredients } = await useFetch(
  "/api/inventory/ingredients"
);

// Computed
const sortedVersions = computed(() => {
  if (!selectedRecipe.value?.versions) return [];
  return [...selectedRecipe.value.versions].sort(
    (a, b) => parseInt(b.version) - parseInt(a.version)
  );
});

const bomCalculations = computed(() => {
  if (!selectedRecipe.value) return [];

  return selectedRecipe.value.ingredients.map((item: any) => {
    const ingredient = availableIngredients.value?.find(
      (i) => i.id === item.ingredientId
    );
    const inStock = getTotalStock(item.ingredientId);
    const status = inStock >= item.quantity ? "sufficient" : "insufficient";

    return {
      ingredientId: item.ingredientId,
      name: ingredient?.name || "Unknown",
      required: item.quantity,
      unit: ingredient?.unit || "",
      inStock,
      unitCost: ingredient?.supplierPrice || 0,
      totalCost: (ingredient?.supplierPrice || 0) * item.quantity,
      status,
    };
  });
});

const calculateTotalCost = computed(() => {
  return bomCalculations.value
    .reduce((sum, item) => sum + item.totalCost, 0)
    .toFixed(2);
});

const overallStockStatus = computed(() => {
  const insufficient = bomCalculations.value.some(
    (item) => item.status === "insufficient"
  );

  return {
    label: insufficient ? "Insufficient Stock" : "Ready for Production",
    variant: insufficient ? "destructive" : ("success" as const),
  };
});

// Stock validation
function validateStock(ingredient: any) {
  const availableIngredient = availableIngredients.value?.find(
    (i) => i.id === ingredient.ingredientId
  );
  if (!availableIngredient) return false;

  const totalStock =
    availableIngredient.warehouses?.reduce(
      (sum: number, w: any) => sum + w.currentStock,
      0
    ) || 0;

  return totalStock >= ingredient.quantity;
}

// Utility functions
function getIngredientsCount(recipe: any) {
  return recipe.ingredients?.length || 0;
}

function getTotalStock(ingredientId: string) {
  const ingredient = availableIngredients.value?.find(
    (i) => i.id === ingredientId
  );
  return (
    ingredient?.warehouses?.reduce(
      (sum: number, w: any) => sum + w.currentStock,
      0
    ) || 0
  );
}

function getIngredientName(id: string) {
  return (
    availableIngredients.value?.find((i) => i.id === id)?.name || "Unknown"
  );
}

function getIngredientUnit(id: string) {
  return availableIngredients.value?.find((i) => i.id === id)?.unit || "";
}

function getStockStatus(item: any) {
  const stock = getTotalStock(item.ingredientId);
  if (stock <= 0) return "outOfStock";
  if (stock < item.quantity) return "lowStock";
  return "inStock";
}

function calculateTotalCostAllRecipes() {
  return (
    recipes.value
      ?.reduce((total, recipe) => {
        const recipeCost = recipe.ingredients.reduce((cost, item) => {
          const ingredient = availableIngredients.value?.find(
            (i) => i.id === item.ingredientId
          );
          return cost + (ingredient?.supplierPrice || 0) * item.quantity;
        }, 0);
        return total + recipeCost;
      }, 0)
      .toFixed(2) || "0.00"
  );
}

// Dialog handlers
function addRecipe() {
  isEditing.value = false;
  form.name = "";
  form.description = "";
  form.ingredients = [];
  form.changelog = "";
  showRecipeDialog.value = true;
}

function editRecipe(recipe: any) {
  isEditing.value = true;
  selectedRecipe.value = recipe;
  form.name = recipe.name;
  form.description = recipe.description;
  form.ingredients = [...recipe.ingredients];
  showRecipeDialog.value = true;
}

function handleDialogClose() {
  showRecipeDialog.value = false;
  isEditing.value = false;
  selectedRecipe.value = null;
}

function addIngredient() {
  form.ingredients.push({
    ingredientId: "",
    quantity: 0,
    unit: "",
  });
}

function removeIngredient(index: number) {
  form.ingredients.splice(index, 1);
}

function viewBOM(recipe: any) {
  selectedRecipe.value = recipe;
  showBOMDialog.value = true;
}

function viewHistory(recipe: any) {
  selectedRecipe.value = recipe;
  showVersionDialog.value = true;
}

function handleSingleBOMExport() {
  if (!selectedRecipe.value) return;

  const date = new Date().toISOString().split("T")[0];
  const filename = `bom-${selectedRecipe.value.name
    .toLowerCase()
    .replace(/\s+/g, "-")}-${date}`;

  const data = {
    headers: [
      "Ingredient",
      "Required",
      "Unit",
      "In Stock",
      "Unit Cost",
      "Total Cost",
      "Status",
    ],
    rows: bomCalculations.value.map((item) => [
      item.name,
      item.required,
      item.unit,
      item.inStock,
      `€${item.unitCost}`,
      `€${item.totalCost}`,
      item.status === "sufficient" ? "In Stock" : "Insufficient",
    ]),
    summary: ["", "", "", "", "Total:", `€${calculateTotalCost.value}`, ""],
  };

  exportToCSV(data, filename);
}

function handleAllBOMExport() {
  if (!recipes.value?.length) return;

  const date = new Date().toISOString().split("T")[0];
  const data = {
    headers: [
      "Recipe",
      "Ingredient",
      "Required",
      "Unit",
      "In Stock",
      "Unit Cost",
      "Total Cost",
      "Status",
    ],
    rows: recipes.value.flatMap((recipe) => {
      // Calculate BOM for each recipe
      const recipeCalculations = recipe.ingredients.map((item) => {
        const ingredient = availableIngredients.value?.find(
          (i) => i.id === item.ingredientId
        );
        const inStock = getTotalStock(item.ingredientId);
        const unitCost = ingredient?.supplierPrice || 0;
        const totalCost = unitCost * item.quantity;
        const status = inStock >= item.quantity ? "sufficient" : "insufficient";

        return [
          recipe.name,
          ingredient?.name || "Unknown",
          item.quantity,
          ingredient?.unit || "",
          inStock,
          `€${unitCost}`,
          `€${totalCost}`,
          status,
        ];
      });

      return recipeCalculations;
    }),
    // Add total cost for all recipes
    summary: [
      "TOTAL",
      "",
      "",
      "",
      "",
      "",
      `€${calculateTotalCostAllRecipes()}`,
      "",
    ],
  };

  exportToCSV(data, `all-recipes-bom-${date}`);
}

// Form submission
async function handleSubmit() {
  try {
    // Validate stock availability
    const invalidIngredients = form.ingredients.filter(
      (ing) => !validateStock(ing)
    );

    if (invalidIngredients.length > 0) {
      // Show error message about insufficient stock
      console.error("Insufficient stock for some ingredients");
      return;
    }

    if (isEditing.value) {
      await $fetch(`/api/products/recipes/${selectedRecipe.value.id}/update`, {
        method: "POST",
        body: form,
      });
    } else {
      await $fetch("/api/products/recipes", {
        method: "POST",
        body: form,
      });
    }

    handleDialogClose();
    await refresh();
  } catch (error) {
    console.error("Error saving recipe:", error);
  }
}
</script>
