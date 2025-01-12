import prisma from '~/utils/prisma'

export default defineEventHandler(async () => {
    const lines = await prisma.productionLine.findMany({
        include: {
            recipe: {
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            },
            allocations: {
                include: {
                    warehouse: true,
                    ingredient: true
                }
            }
        }
    })

    console.log('Production lines from DB:', lines)
    return lines
})