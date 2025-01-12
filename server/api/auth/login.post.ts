// server/api/auth/login.post.ts
import { compare } from 'bcrypt'
import { setCookie } from 'h3'
import prisma from '~/utils/prisma'
// We'll need some session store or library. Below is a pseudo approach

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const passwordValid = await compare(password, user.password)
  if (!passwordValid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  // We only do this if the credentials are correct
  // 1. Create a session record or a JWT, for example:
  //    For demonstration, let's just create a random session ID
  const sessionId = crypto.randomUUID()

  // 2. Store that session ID -> user ID mapping somewhere, e.g. in an in-memory store
  //    or a "Session" table. We'll do a simple global store for demonstration:
  //    (See next sections on how to implement a store or a library for sessions)
  globalThis.__sessionStore = globalThis.__sessionStore || {}
  // For production, you'd want a real store: Redis, DB table, etc.
  globalThis.__sessionStore[sessionId] = {
    userId: user.id,
    createdAt: Date.now()
  }

  // 3. Set the sessionId in an HttpOnly cookie
  setCookie(event, 'sessionId', sessionId, {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    // secure: true, // enable if you use HTTPS
    // maxAge: 60 * 60 * 24 (1 day) or something
  })

  // 4. Return the user data (minus password)
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
})
