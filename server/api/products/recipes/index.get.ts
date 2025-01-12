import prisma from '~/utils/prisma'

export default defineEventHandler(async () => {
    return await prisma.recipe.findMany({
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