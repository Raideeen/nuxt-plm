import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    return await prisma.warehouse.create({
        data: {
            name: body.name,
            location: body.location
        },
        include: {
            inventory: true
        }
    })
})