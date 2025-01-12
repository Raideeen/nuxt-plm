// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Users
  const manager = await prisma.user.create({
    data: {
      email: 'manager@plm.com',
      name: 'John Manager',
      password: await hash('manager123', 10),
      role: 'manager',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
  })

  const operator = await prisma.user.create({
    data: {
      email: 'operator@plm.com',
      name: 'Alice Operator',
      password: await hash('operator123', 10),
      role: 'operator',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  })

  // 2. Create initial ingredients
  const milk = await prisma.ingredient.create({
    data: {
      name: 'Whole Milk',
      sku: 'MILK001',
      minimumStock: 100,
      unit: 'liter',
      supplierPrice: 0.8,
      supplierLeadTime: 2,
      currentVersion: '1',
      versions: {
        create: {
          version: '1',
          userId: operator.id,
          minimumStock: 100,
          unit: 'liter',
          supplierPrice: 0.8,
          supplierLeadTime: 2,
          changelog: 'Initial creation',
        },
      },
    },
  })

  // Create version 2 for Milk (simulate price update)
  await prisma.ingredient.update({
    where: { id: milk.id },
    data: {
      supplierPrice: 0.9,
      currentVersion: '2',
      versions: {
        create: {
          version: '2',
          userId: manager.id,
          minimumStock: 100,
          unit: 'liter',
          supplierPrice: 0.9,
          supplierLeadTime: 2,
          changelog: 'Updated supplier price due to inflation',
        },
      },
    },
  })

  const yogurtCulture = await prisma.ingredient.create({
    data: {
      name: 'Yogurt Culture',
      sku: 'CULT001',
      minimumStock: 5,
      unit: 'kg',
      supplierPrice: 20,
      supplierLeadTime: 5,
      currentVersion: '1',
      versions: {
        create: {
          version: '1',
          userId: operator.id,
          minimumStock: 5,
          unit: 'kg',
          supplierPrice: 20,
          supplierLeadTime: 5,
          changelog: 'Initial creation',
        },
      },
    },
  })

  // Additional ingredients for more realistic data
  const strawberryPuree = await prisma.ingredient.create({
    data: {
      name: 'Strawberry Puree',
      sku: 'STRB001',
      minimumStock: 20,
      unit: 'kg',
      supplierPrice: 3.5,
      supplierLeadTime: 3,
      currentVersion: '1',
      versions: {
        create: {
          version: '1',
          userId: operator.id,
          minimumStock: 20,
          unit: 'kg',
          supplierPrice: 3.5,
          supplierLeadTime: 3,
          changelog: 'Initial creation (Strawberry Puree)',
        },
      },
    },
  })

  const vanillaExtract = await prisma.ingredient.create({
    data: {
      name: 'Vanilla Extract',
      sku: 'VANEX01',
      minimumStock: 5,
      unit: 'liter',
      supplierPrice: 15,
      supplierLeadTime: 7,
      currentVersion: '1',
      versions: {
        create: {
          version: '1',
          userId: manager.id,
          minimumStock: 5,
          unit: 'liter',
          supplierPrice: 15,
          supplierLeadTime: 7,
          changelog: 'Initial creation (Vanilla Extract)',
        },
      },
    },
  })

  const sugar = await prisma.ingredient.create({
    data: {
      name: 'Granulated Sugar',
      sku: 'SUGR001',
      minimumStock: 50,
      unit: 'kg',
      supplierPrice: 0.7,
      supplierLeadTime: 3,
      currentVersion: '1',
      versions: {
        create: {
          version: '1',
          userId: operator.id,
          minimumStock: 50,
          unit: 'kg',
          supplierPrice: 0.7,
          supplierLeadTime: 3,
          changelog: 'Initial creation (Sugar)',
        },
      },
    },
  })

  // 3. Create warehouses
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Storage',
      location: 'Paris',
    },
  })

  const backupWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Backup Warehouse',
      location: 'Lyon',
    },
  })

  // 4. Create warehouse inventory
  // Main Storage
  await prisma.warehouseInventory.create({
    data: {
      warehouseId: mainWarehouse.id,
      ingredientId: milk.id,
      currentStock: 250,
    },
  })

  await prisma.warehouseInventory.create({
    data: {
      warehouseId: mainWarehouse.id,
      ingredientId: yogurtCulture.id,
      currentStock: 10,
    },
  })

  await prisma.warehouseInventory.create({
    data: {
      warehouseId: mainWarehouse.id,
      ingredientId: strawberryPuree.id,
      currentStock: 40,
    },
  })

  await prisma.warehouseInventory.create({
    data: {
      warehouseId: mainWarehouse.id,
      ingredientId: vanillaExtract.id,
      currentStock: 2,
    },
  })

  await prisma.warehouseInventory.create({
    data: {
      warehouseId: mainWarehouse.id,
      ingredientId: sugar.id,
      currentStock: 200,
    },
  })

  // Backup Warehouse
  await prisma.warehouseInventory.create({
    data: {
      warehouseId: backupWarehouse.id,
      ingredientId: milk.id,
      currentStock: 80,
    },
  })

  await prisma.warehouseInventory.create({
    data: {
      warehouseId: backupWarehouse.id,
      ingredientId: yogurtCulture.id,
      currentStock: 5,
    },
  })

  await prisma.warehouseInventory.create({
    data: {
      warehouseId: backupWarehouse.id,
      ingredientId: strawberryPuree.id,
      currentStock: 10,
    },
  })

  // 5. Create Recipes
  // Plain Yogurt
  const plainYogurt = await prisma.recipe.create({
    data: {
      name: 'Plain Yogurt',
      notes: 'Basic yogurt recipe',
      currentVersion: '1',
      ingredients: {
        create: [
          {
            ingredientId: milk.id,
            quantity: 1,
            unit: 'liter',
          },
          {
            ingredientId: yogurtCulture.id,
            quantity: 0.01,
            unit: 'kg',
          },
        ],
      },
      versions: {
        create: {
          version: '1',
          userId: operator.id,
          changelog: 'Initial recipe creation',
        },
      },
    },
  })

  // Create version 2 for Plain Yogurt
  await prisma.recipeVersion.create({
    data: {
      recipeId: plainYogurt.id,
      version: '2',
      userId: manager.id,
      changelog: 'Adjusted recipe for better consistency',
    },
  })

  // Vanilla Yogurt
  const vanillaYogurt = await prisma.recipe.create({
    data: {
      name: 'Vanilla Yogurt',
      notes: 'Add a dash of vanilla extract for flavor',
      currentVersion: '1',
      ingredients: {
        create: [
          {
            ingredientId: milk.id,
            quantity: 1.0,
            unit: 'liter',
          },
          {
            ingredientId: yogurtCulture.id,
            quantity: 0.01,
            unit: 'kg',
          },
          {
            ingredientId: vanillaExtract.id,
            quantity: 0.02,
            unit: 'liter',
          },
        ],
      },
      versions: {
        create: {
          version: '1',
          userId: operator.id,
          changelog: 'Initial recipe creation (Vanilla Yogurt)',
        },
      },
    },
  })

  // Strawberry Yogurt
  const strawberryYogurt = await prisma.recipe.create({
    data: {
      name: 'Strawberry Yogurt',
      notes: 'Strawberry puree added for flavor and color',
      currentVersion: '1',
      ingredients: {
        create: [
          {
            ingredientId: milk.id,
            quantity: 1.0,
            unit: 'liter',
          },
          {
            ingredientId: yogurtCulture.id,
            quantity: 0.01,
            unit: 'kg',
          },
          {
            ingredientId: strawberryPuree.id,
            quantity: 0.05,
            unit: 'kg',
          },
          {
            ingredientId: sugar.id,
            quantity: 0.02,
            unit: 'kg',
          },
        ],
      },
      versions: {
        create: {
          version: '1',
          userId: operator.id,
          changelog: 'Initial recipe creation (Strawberry Yogurt)',
        },
      },
    },
  })

  // 6. Create Production Lines
  await prisma.productionLine.create({
    data: {
      name: 'Daily Plain Yogurt Production',
      recipeId: plainYogurt.id,
      quantity: 100,
      destination: 'Paris Store',
      frequency: 'daily',
      unitsPerPack: 2,
      status: 'planned',
      startDate: new Date(),
      nextProductionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date('2025-01-01T10:00:00Z'),  // <-- Distinct createdAt #1
    },
  })

  await prisma.productionLine.create({
    data: {
      name: 'Weekly Vanilla Yogurt',
      recipeId: vanillaYogurt.id,
      quantity: 50,
      destination: 'Lyon Depot',
      frequency: 'weekly',
      unitsPerPack: 4,
      status: 'in-progress',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextProductionDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2025-01-02T11:30:00Z'),  // <-- Distinct createdAt #2
    },
  })

  await prisma.productionLine.create({
    data: {
      name: 'Monthly Strawberry Yogurt',
      recipeId: strawberryYogurt.id,
      quantity: 200,
      destination: 'Marseille Distribution',
      frequency: 'monthly',
      unitsPerPack: 6,
      status: 'planned',
      startDate: new Date(),
      nextProductionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2025-01-03T09:15:00Z'),  // <-- Distinct createdAt #3
    },
  })

  await prisma.productionLine.create({
    data: {
      name: 'Ad-hoc Vanilla Promo Batch',
      recipeId: vanillaYogurt.id,
      quantity: 20,
      destination: 'Paris Store - Promo',
      frequency: 'one-off',
      unitsPerPack: 2,
      status: 'completed',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextProductionDate: null,
      createdAt: new Date('2025-01-05T16:45:00Z'),  // <-- Distinct createdAt #4
    },
  })

  console.log('--- SEED DATA COMPLETE ---')
  console.log({
    totalUsers: await prisma.user.count(),
    totalIngredients: await prisma.ingredient.count(),
    totalWarehouses: await prisma.warehouse.count(),
    totalRecipes: await prisma.recipe.count(),
    totalProductionLines: await prisma.productionLine.count(),
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
