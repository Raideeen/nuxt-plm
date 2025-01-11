export default defineEventHandler(async () => {
    const users = await prisma.user.findMany()
    console.log('Users in database:', users)
    return users
})