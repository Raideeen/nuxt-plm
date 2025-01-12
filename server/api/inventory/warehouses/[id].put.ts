import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    return await prisma.warehouse.update({
        where: { id },
        data: {
            name: body.name,
            location: body.location
        },
        include: {
            inventory: true
        }
    })
})