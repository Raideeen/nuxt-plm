import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const user = event.context.user

        // Check if SKU already exists
        const existingIngredient = await prisma.ingredient.findUnique({
            where: { sku: body.sku }
        })

        if (existingIngredient) {
            throw createError({
                statusCode: 409,
                message: 'SKU already exists'
            })
        }
        if (!user || !user.id) {
            throw createError({
                statusCode: 500,
                message: 'User context not available'
            })
        }

        return await prisma.ingredient.create({
            data: {
                name: body.name,
                sku: body.sku,
                unit: body.unit,
                minimumStock: Number(body.minimumStock),
                supplierPrice: Number(body.supplierPrice),
                supplierLeadTime: Number(body.supplierLeadTime),
                currentVersion: "1",
                versions: {
                    create: {
                        version: "1",
                        userId: user.id,
                        minimumStock: Number(body.minimumStock),
                        unit: body.unit,
                        supplierPrice: Number(body.supplierPrice),
                        supplierLeadTime: Number(body.supplierLeadTime),
                        changelog: "Initial creation"
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
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: 'SKU already exists'
            })
        }
        throw error
    }
})