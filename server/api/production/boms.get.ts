import prisma from '~/utils/prisma'

export default defineEventHandler(async () => {
    const productionLines = await prisma.productionLine.findMany({
        include: {
            recipe: {
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            },
            allocations: {
                include: {
                    warehouse: true,
                    ingredient: true
                }
            }
        }
    })

    // Calculate BOMs for all production lines
    const boms = productionLines.map(line => {
        const totalUnits = line.quantity * line.unitsPerPack

        return {
            productionLine: {
                id: line.id,
                name: line.name,
                recipe: line.recipe.name,
                quantity: line.quantity,
                unitsPerPack: line.unitsPerPack,
                totalUnits,
                frequency: line.frequency,
                nextProductionDate: line.nextProductionDate
            },
            ingredients: line.recipe.ingredients.map(recipeIngredient => ({
                ingredient: recipeIngredient.ingredient,
                recipeQuantity: recipeIngredient.quantity,
                totalRequired: recipeIngredient.quantity * totalUnits,
                unitCost: recipeIngredient.ingredient.supplierPrice,
                totalCost: recipeIngredient.ingredient.supplierPrice * recipeIngredient.quantity * totalUnits,
                allocations: line.allocations
                    .filter(a => a.ingredientId === recipeIngredient.ingredientId)
                    .map(a => ({
                        warehouse: a.warehouse.name,
                        quantity: a.quantity,
                        status: a.status
                    }))
            }))
        }
    })

    return {
        boms,
        summary: {
            totalLines: boms.length,
            totalUnits: boms.reduce((sum, bom) => sum + bom.productionLine.totalUnits, 0),
            totalCost: boms.reduce((sum, bom) =>
                sum + bom.ingredients.reduce((iSum, i) => iSum + i.totalCost, 0)
                , 0)
        }
    }
})