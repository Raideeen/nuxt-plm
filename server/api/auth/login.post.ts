// server/api/auth/login.post.ts
import { compare } from 'bcrypt'
import prisma from '~/utils/prisma'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Verify password
  const passwordValid = await compare(password, user.password)
  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // For now, just return user info without sensitive data
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
})