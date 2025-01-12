export function useAuth() {
  const user = useState('user', () => null)

  function setUser(u) {
    user.value = u
  }

  async function fetchUser() {
    try {
      const data = await $fetch('/api/auth/me')
      user.value = data
    } catch (error) {
      user.value = null
    }
  }

  return {
    user,
    setUser,
    fetchUser
  }
}
