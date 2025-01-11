// server/api/inventory/ingredients/[id].put.ts
import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const user = event.context.user // Now guaranteed by middleware

    // Get current ingredient to increment version
    const currentIngredient = await prisma.ingredient.findUnique({
        where: { id },
        include: { versions: true }
    })

    if (!currentIngredient) {
        throw createError({
            statusCode: 404,
            message: 'Ingredient not found'
        })
    }

    const newVersion = (parseInt(currentIngredient.currentVersion) + 1).toString()

    // Update the ingredient and create new version
    return await prisma.ingredient.update({
        where: { id },
        data: {
            name: body.name,
            sku: body.sku,
            unit: body.unit,
            minimumStock: Number(body.minimumStock),
            supplierPrice: Number(body.supplierPrice),
            supplierLeadTime: Number(body.supplierLeadTime),
            currentVersion: newVersion,
            versions: {
                create: {
                    version: newVersion,
                    userId: user.id,
                    minimumStock: Number(body.minimumStock),
                    unit: body.unit,
                    supplierPrice: Number(body.supplierPrice),
                    supplierLeadTime: Number(body.supplierLeadTime),
                    changelog: "Updated ingredient details"
                }
            }
        },
        include: {
            versions: {
                include: {
                    updatedBy: true
                }
            }
        }
    })
})