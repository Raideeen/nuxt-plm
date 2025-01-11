// For product recipes/formulas
export interface Recipe {
  id: string
  name: string
  currentVersion: string
  createdAt: Date
  updatedAt: Date
  ingredients: RecipeIngredient[]
  notes?: string
  versions: RecipeVersion[]
}

export interface RecipeVersion {
  id: string
  recipeId: string
  version: string
  updatedBy: User
  userId: string
  updatedAt: Date
  changelog?: string
}

export interface RecipeIngredient {
  id: string
  ingredientId: string
  recipeId: string
  quantity: number
  unit: string
}

// For inventory management
export interface Ingredient {
  id: string
  name: string
  sku: string
  minimumStock: number
  unit: string
  warehouses: WarehouseInventory[]
  supplierPrice: number
  supplierLeadTime: number // in days
  currentVersion: string
  versions: IngredientVersion[]
}

export interface IngredientVersion {
  id: string
  ingredientId: string
  version: string
  updatedBy: User
  userId: string
  updatedAt: Date
  changelog?: string
  minimumStock: number
  unit: string
  supplierPrice: number
  supplierLeadTime: number
}

export interface IngredientForm {
  id?: string
  name: string
  sku: string
  unit: 'kg' | 'l' | 'unit'
  minimumStock: number
  supplierPrice: number
  supplierLeadTime: number
}


export interface Warehouse {
  id: string
  name: string
  location: string
  inventory: WarehouseInventory[]
}

export interface WarehouseInventory {
  id: string
  warehouseId: string
  ingredientId: string
  currentStock: number
  lastUpdated: Date
}

// For production planning
export interface ProductionLine {
  id: string
  name: string
  recipeId: string
  recipe: Recipe
  quantity: number
  destination: string
  frequency: ProductionFrequency
  status: ProductionStatus
  startDate: Date
  nextProductionDate?: Date
}

export type ProductionFrequency = 'one-off' | 'daily' | 'weekly' | 'monthly'
export type ProductionStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled'

// For role-based access
export interface User {
  id: string
  email: string
  name: string
  password: string
  role: UserRole
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
  recipeVersions: RecipeVersion[]
  ingredientVersions: IngredientVersion[]
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer'