// server/api/inventory/ingredients/[id].delete.ts
import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        // Check if ingredient is used in any recipes
        const usedInRecipes = await prisma.recipeIngredient.findFirst({
            where: { ingredientId: id }
        })

        if (usedInRecipes) {
            throw createError({
                statusCode: 400,
                message: 'Cannot delete ingredient that is used in recipes'
            })
        }

        // Check if ingredient has stock in warehouses
        const hasStock = await prisma.warehouseInventory.findFirst({
            where: {
                ingredientId: id,
                currentStock: { gt: 0 }
            }
        })

        if (hasStock) {
            throw createError({
                statusCode: 400,
                message: 'Cannot delete ingredient with existing stock'
            })
        }

        // Delete the ingredient
        await prisma.ingredient.delete({
            where: { id }
        })

        return { success: true }
    } catch (error) {
        console.error('Error deleting ingredient:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Error deleting ingredient'
        })
    }
})