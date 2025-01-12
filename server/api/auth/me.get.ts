// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
    // Because of the auth middleware, we already have event.context.user
    if (!event.context.user) {
        throw createError({ statusCode: 401, message: 'Unauthenticated' })
    }
    const { password, ...userNoPassword } = event.context.user
    return userNoPassword
})
