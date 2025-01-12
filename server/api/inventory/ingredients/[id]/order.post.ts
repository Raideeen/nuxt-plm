import prisma from "~/utils/prisma"

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const { quantity, deliveryDate, notes } = await readBody(event)

    return await prisma.purchaseOrder.create({
        data: {
            ingredientId: id,
            quantity,
            expectedDeliveryDate: new Date(deliveryDate),
            notes,
            status: 'pending'
        }
    })
})