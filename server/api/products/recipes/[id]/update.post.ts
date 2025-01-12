import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const user = event.context.user

    const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: { versions: true }
    })

    if (!recipe) {
        throw createError({
            statusCode: 404,
            message: 'Recipe not found'
        })
    }

    const newVersion = (parseInt(recipe.currentVersion) + 1).toString()

    // Start a transaction to update everything
    return await prisma.$transaction(async (tx) => {
        // Delete existing ingredients
        await tx.recipeIngredient.deleteMany({
            where: { recipeId: id }
        })

        // Update recipe and create new version
        return await tx.recipe.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                currentVersion: newVersion,
                ingredients: {
                    create: body.ingredients.map((ing: any) => ({
                        ingredientId: ing.ingredientId,
                        quantity: ing.quantity,
                        unit: ing.unit
                    }))
                },
                versions: {
                    create: {
                        version: newVersion,
                        userId: user.id,
                        changelog: body.changelog || 'Recipe updated'
                    }
                }
            },
            include: {
                ingredients: {
                    include: {
                        ingredient: true
                    }
                },
                versions: {
                    include: {
                        updatedBy: true
                    }
                }
            }
        })
    })
})