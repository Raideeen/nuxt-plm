import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    return await prisma.productionLine.create({
        data: {
            name: body.name,
            recipeId: body.recipeId,
            destination: body.destination,
            quantity: body.quantity,
            unitsPerPack: body.unitsPerPack,
            frequency: body.frequency,
            status: 'planned',
            startDate: new Date(body.startDate),
            nextProductionDate: new Date(body.startDate)
        },
        include: {
            recipe: {
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            }
        }
    })
})