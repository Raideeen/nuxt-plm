// server/middleware/auth.server.ts
import { H3Event, getCookie } from 'h3'
import prisma from '~/utils/prisma'

export default defineEventHandler(async (event: H3Event) => {
    // 1. Read the 'sessionId' cookie
    const sessionId = getCookie(event, 'sessionId')

    if (!sessionId) {
        throw createError({ statusCode: 401, message: 'Unauthorized - no session' })
    }

    // 2. Look up the session store for that sessionId
    //    For demonstration, we used a global object in login.post
    globalThis.__sessionStore = globalThis.__sessionStore || {}
    const session = globalThis.__sessionStore[sessionId]
    if (!session) {
        throw createError({ statusCode: 401, message: 'Session not found' })
    }

    // 3. Get the user from the DB
    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    })
    if (!user) {
        throw createError({ statusCode: 401, message: 'User not found' })
    }

    // 4. Attach user to event context
    event.context.user = user
})
