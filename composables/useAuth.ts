export const useAuth = () => {
    const user = useState('user', () => null)
    const isAuthenticated = computed(() => !!user.value)
  
    const setUser = (userData: any) => {
      user.value = userData
    }
  
    const clearUser = () => {
      user.value = null
    }
  
    return {
      user,
      isAuthenticated,
      setUser,
      clearUser
    }
  }