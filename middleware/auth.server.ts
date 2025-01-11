import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    // Get user from session (we'll need to implement session management)
    const user = await prisma.user.findFirst() // Temporary: just get the first user for testing
    console.log('Auth Middleware - Found user:', user)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // Add user to event context
    event.context.user = user
})