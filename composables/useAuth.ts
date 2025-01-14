// composables/useAuth.ts
export function useAuth() {
  const user = useState('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role || 'viewer')

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

  // Add permission checking
  function hasPermission(permission: string) {
    const rolePermissions = {
      manager: [
        'view_all',
        'create_ingredient',
        'edit_ingredient',
        'create_recipe',
        'edit_recipe',
        'manage_production',
        'view_costs',
        'edit_costs',
        'export_data'
      ],
      operator: [
        'view_production',
        'edit_stock',
        'view_recipes',
        'manage_production'
      ],
      viewer: ['view_basic']
    }

    return rolePermissions[role.value]?.includes(permission) || false
  }

  return {
    user,
    isAuthenticated,
    role,
    setUser,
    fetchUser,
    hasPermission
  }
}