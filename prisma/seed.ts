// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // First create our test user
  const manager = await prisma.user.create({
    data: {
      email: 'manager@plm.com',
      name: 'John Manager',
      password: await hash('manager123', 10),
      role: 'manager'
    }
  })

  const operator = await prisma.user.create({
    data: {
      email: 'operator@plm.com',
      name: 'Alice Operator',
      password: await hash('operator123', 10),
      role: 'operator'
    }
  })

  // Create initial ingredient
  const milk = await prisma.ingredient.create({
    data: {
      name: 'Whole Milk',
      sku: 'MILK001',
      minimumStock: 100,
      unit: 'liter',
      supplierPrice: 0.8,
      supplierLeadTime: 2,
      currentVersion: "1",
      // Create first version
      versions: {
        create: {
          version: "1",
          userId: operator.id,
          minimumStock: 100,
          unit: 'liter',
          supplierPrice: 0.8,
          supplierLeadTime: 2,
          changelog: "Initial creation"
        }
      }
    }
  })

  // Update milk price - creates version 2
  const updatedMilk = await prisma.ingredient.update({
    where: { id: milk.id },
    data: {
      supplierPrice: 0.9,
      currentVersion: "2",
      versions: {
        create: {
          version: "2",
          userId: manager.id,
          minimumStock: 100,
          unit: 'liter',
          supplierPrice: 0.9,
          supplierLeadTime: 2,
          changelog: "Updated supplier price due to inflation"
        }
      }
    }
  })

  const yogurtCulture = await prisma.ingredient.create({
    data: {
      name: 'Yogurt Culture',
      sku: 'CULT001',
      minimumStock: 5,
      unit: 'kg',
      supplierPrice: 20,
      supplierLeadTime: 5,
      currentVersion: "1",
      versions: {
        create: {
          version: "1",
          userId: operator.id,
          minimumStock: 5,
          unit: 'kg',
          supplierPrice: 20,
          supplierLeadTime: 5,
          changelog: "Initial creation"
        }
      }
    }
  })

  // Create warehouse
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Storage',
      location: 'Paris',
      inventory: {
        create: [
          {
            ingredientId: milk.id,
            currentStock: 150
          },
          {
            ingredientId: yogurtCulture.id,
            currentStock: 10
          }
        ]
      }
    }
  })

  // Create initial recipe
  const plainYogurt = await prisma.recipe.create({
    data: {
      name: 'Plain Yogurt',
      currentVersion: "1",
      notes: 'Basic yogurt recipe',
      ingredients: {
        create: [
          {
            ingredientId: milk.id,
            quantity: 1,
            unit: 'liter'
          },
          {
            ingredientId: yogurtCulture.id,
            quantity: 0.01,
            unit: 'kg'
          }
        ]
      },
      versions: {
        create: {
          version: "1",
          userId: operator.id,
          changelog: "Initial recipe creation"
        }
      }
    }
  })

  // Update recipe - creates version 2
  const updatedRecipe = await prisma.recipe.update({
    where: { id: plainYogurt.id },
    data: {
      currentVersion: "2",
      versions: {
        create: {
          version: "2",
          userId: manager.id,
          changelog: "Adjusted recipe for better consistency"
        }
      }
    }
  })

  // Create production line
  const yogurtProduction = await prisma.productionLine.create({
    data: {
      name: 'Daily Yogurt Production',
      recipeId: plainYogurt.id,
      quantity: 100,
      destination: 'Paris Store',
      frequency: 'daily',
      status: 'planned',
      startDate: new Date(),
      nextProductionDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
    }
  })

  console.log({
    users: { manager, operator },
    ingredients: { 
      milk: {
        ...milk,
        versions: await prisma.ingredientVersion.findMany({
          where: { ingredientId: milk.id }
        })
      }
    },
    recipes: {
      plainYogurt: {
        ...plainYogurt,
        versions: await prisma.recipeVersion.findMany({
          where: { recipeId: plainYogurt.id }
        })
      }
    },
    warehouse: mainWarehouse,
    productionLine: yogurtProduction
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })