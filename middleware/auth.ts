export default defineNuxtRouteMiddleware((to, from) => {
    const { isAuthenticated } = useAuth()
    
    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated.value && to.path !== '/') {
      return navigateTo('/')
    }
    
    // If user is authenticated and trying to access login page
    if (isAuthenticated.value && to.path === '/') {
      return navigateTo('/dashboard')
    }
  })