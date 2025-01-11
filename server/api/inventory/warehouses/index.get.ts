export default defineEventHandler(async () => {
    return await prisma.warehouse.findMany({
        include: {
            inventory: true
        }
    })
})