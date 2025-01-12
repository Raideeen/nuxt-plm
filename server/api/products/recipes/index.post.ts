import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const user = event.context.user

    return await prisma.recipe.create({
        data: {
            name: body.name,
            description: body.description,
            currentVersion: "1",
            ingredients: {
                create: body.ingredients.map((ing: any) => ({
                    ingredientId: ing.ingredientId,
                    quantity: ing.quantity,
                    unit: ing.unit
                }))
            },
            versions: {
                create: {
                    version: "1",
                    userId: user.id,
                    changelog: "Initial recipe creation"
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