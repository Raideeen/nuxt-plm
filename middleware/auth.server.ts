// server/middleware/auth.server.ts
import { H3Event, getCookie } from 'h3'
import prisma from '~/utils/prisma'

const endpointPermissions = {
    'POST:/api/inventory/ingredients': ['create_ingredient'],
    'PUT:/api/inventory/ingredients': ['edit_ingredient'],
    'POST:/api/products/recipes': ['create_recipe'],
    'GET:/api/reporting': ['view_costs']
}

export default defineEventHandler(async (event: H3Event) => {
    const sessionId = getCookie(event, 'sessionId')

    if (!sessionId) {
        throw createError({ statusCode: 401, message: 'Unauthorized - no session' })
    }

    globalThis.__sessionStore = globalThis.__sessionStore || {}
    const session = globalThis.__sessionStore[sessionId]
    if (!session) {
        throw createError({ statusCode: 401, message: 'Session not found' })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    })
    if (!user) {
        throw createError({ statusCode: 401, message: 'User not found' })
    }

    // Check endpoint permissions
    const endpoint = `${event.method}:${event.path}`
    const requiredPermissions = endpointPermissions[endpoint]
    if (requiredPermissions) {
        const hasPermission = checkUserPermissions(user.role, requiredPermissions)
        if (!hasPermission) {
            throw createError({ statusCode: 403, message: 'Permission denied' })
        }
    }

    event.context.user = user
})

function checkUserPermissions(role: string, requiredPermissions: string[]) {
    const rolePermissions = {
        manager: ['view_all', 'create_ingredient', 'edit_ingredient', 'create_recipe',
            'edit_recipe', 'manage_production', 'view_costs', 'edit_costs', 'export_data'],
        operator: ['view_production', 'edit_stock', 'view_recipes', 'manage_production'],
        viewer: ['view_basic']
    }

    return requiredPermissions.some(permission =>
        rolePermissions[role]?.includes(permission)
    )
}