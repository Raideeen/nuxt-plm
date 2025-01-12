import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const assignments = await readBody(event)

    // Convert assignments to Prisma operations
    const operations = Object.entries(assignments).map(([warehouseId, quantity]) => ({
        where: {
            warehouseId_ingredientId: {  // Changed from ingredientId_warehouseId
                ingredientId: id,
                warehouseId
            }
        },
        create: {
            ingredientId: id,
            warehouseId,
            currentStock: quantity,
            lastUpdated: new Date()
        },
        update: {
            currentStock: quantity,
            lastUpdated: new Date()
        }
    }))

    // Execute all operations in a transaction
    return await prisma.$transaction(
        operations.map(op =>
            prisma.warehouseInventory.upsert(op)
        )
    )
})