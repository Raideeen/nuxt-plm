import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    const productionLine = await prisma.productionLine.findUnique({
        where: { id },
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

    if (!productionLine) {
        throw createError({
            statusCode: 404,
            message: 'Production line not found'
        })
    }

    // Calculate BOM details
    const totalUnits = productionLine.quantity * productionLine.unitsPerPack
    const ingredients = productionLine.recipe.ingredients.map(recipeIngredient => {
        const totalRequired = recipeIngredient.quantity * totalUnits
        const allocations = productionLine.allocations
            .filter(a => a.ingredientId === recipeIngredient.ingredientId)

        return {
            ingredient: recipeIngredient.ingredient,
            recipeQuantity: recipeIngredient.quantity,
            totalRequired,
            unitCost: recipeIngredient.ingredient.supplierPrice,
            totalCost: recipeIngredient.ingredient.supplierPrice * totalRequired,
            allocations: allocations.map(a => ({
                warehouse: a.warehouse.name,
                quantity: a.quantity,
                status: a.status
            }))
        }
    })

    return {
        productionLine: {
            name: productionLine.name,
            recipe: productionLine.recipe.name,
            quantity: productionLine.quantity,
            unitsPerPack: productionLine.unitsPerPack,
            totalUnits,
            frequency: productionLine.frequency,
            nextProductionDate: productionLine.nextProductionDate
        },
        ingredients,
        totals: {
            materialCost: ingredients.reduce((sum, i) => sum + i.totalCost, 0),
            totalIngredients: ingredients.length,
            totalQuantity: totalUnits
        }
    }
})