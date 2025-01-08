// For product recipes/formulas
export interface Recipe {
    id: string
    name: string
    version: string
    createdAt: Date
    updatedAt: Date
    ingredients: RecipeIngredient[]
    notes?: string
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
    role: UserRole
    createdAt: Date
    updatedAt: Date
  }
  
  export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer'