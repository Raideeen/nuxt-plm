import prisma from "~/utils/prisma"

export default defineEventHandler(async (event) => {
    // Skip auth for login route
    if (event.path === '/api/auth/login') return

    const user = await prisma.user.findFirst()

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // Add user to context
    event.context.user = user
})