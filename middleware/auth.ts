// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, role } = useAuth()

  // Define route permissions
  const routePermissions = {
    '/dashboard': ['view_basic'],
    '/inventory/ingredients': ['view_basic'],
    '/inventory/ingredients/new': ['create_ingredient'],
    '/products/recipes': ['view_recipes'],
    '/products/recipes/new': ['create_recipe'],
    '/production': ['view_production'],
    '/reporting': ['view_costs']
  }

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated.value && to.path !== '/') {
    return navigateTo('/')
  }

  // If user is authenticated and trying to access login page
  if (isAuthenticated.value && to.path === '/') {
    return navigateTo('/dashboard')
  }

  // Check route permissions
  const requiredPermissions = routePermissions[to.path]
  if (requiredPermissions) {
    const hasPermission = requiredPermissions.some(permission =>
      permission === 'view_basic' || hasPermission(permission)
    )
    if (!hasPermission) {
      return navigateTo('/dashboard')
    }
  }
})