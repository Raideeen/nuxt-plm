// server/api/inventory/ingredients.ts
import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const { user } = event.context // We'll add auth middleware later

  switch (method) {
    case 'GET':
      return await prisma.ingredient.findMany({
        include: {
          warehouses: true,
          versions: {
            include: {
              updatedBy: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            },
            orderBy: {
              version: 'asc'
            }
          }
        }
      })

    case 'POST':
      const body = await readBody(event)
      return await prisma.ingredient.create({
        data: {
          ...body,
          currentVersion: "1",
          versions: {
            create: {
              version: "1",
              userId: user.id, // We'll add this with auth
              minimumStock: body.minimumStock,
              unit: body.unit,
              supplierPrice: body.supplierPrice,
              supplierLeadTime: body.supplierLeadTime,
              changelog: "Initial creation"
            }
          }
        }
      })

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
  }
})