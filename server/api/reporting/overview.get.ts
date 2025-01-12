// server/api/reporting/overview.get.ts
import { startOfDay, subDays } from 'date-fns'
import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const startDate = query.startDate ? new Date(query.startDate as string) : subDays(new Date(), 30)
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date()

    // Get production lines in date range
    const productionLines = await prisma.productionLine.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
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

    // Calculate costs and revenue
    const calculations = productionLines.map(line => {
        const totalUnits = line.quantity * line.unitsPerPack
        const materialCost = line.recipe.ingredients.reduce((sum, ing) =>
            sum + (ing.quantity * ing.ingredient.supplierPrice * totalUnits), 0
        )

        return {
            id: line.id,
            date: line.createdAt,
            units: totalUnits,
            materialCost,
            // Assuming a 40% markup for revenue calculation
            revenue: materialCost * 1.4
        }
    })

    // Group by date
    const dailyData = calculations.reduce((acc, curr) => {
        const date = startOfDay(curr.date)
        const key = date.toISOString()

        if (!acc[key]) {
            acc[key] = {
                date: key,
                revenue: 0,
                costs: 0,
                units: 0
            }
        }

        acc[key].revenue += curr.revenue
        acc[key].costs += curr.materialCost
        acc[key].units += curr.units

        return acc
    }, {} as Record<string, any>)

    return {
        summary: {
            totalRevenue: calculations.reduce((sum, c) => sum + c.revenue, 0),
            totalCosts: calculations.reduce((sum, c) => sum + c.materialCost, 0),
            totalUnits: calculations.reduce((sum, c) => sum + c.units, 0),
            totalProfit: calculations.reduce((sum, c) => sum + (c.revenue - c.materialCost), 0), // Add total profit
        },
        dailyData: Object.values(dailyData),
        costBreakdown: [
            { name: 'Material Costs', value: calculations.reduce((sum, c) => sum + c.materialCost, 0) },
            // Add other cost categories here
        ]
    }
})