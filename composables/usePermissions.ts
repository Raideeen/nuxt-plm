// composables/usePermissions.ts
export function usePermissions() {
    const { user } = useAuth()

    const permissions = {
        manager: {
            recipes: {
                view: true,
                create: true,
                edit: true,
                export: true,
                viewBOM: true,
                viewHistory: true
            },
            production: {
                view: true,
                create: true,
                edit: true,
                export: true,
                viewBOM: true,
                allocateStock: true
            }
        },
        operator: {
            recipes: {
                view: true,
                create: false,
                edit: false,
                export: true,
                viewBOM: true,
                viewHistory: true
            },
            production: {
                view: true,
                create: true,
                edit: true,
                export: true,
                viewBOM: true,
                allocateStock: true
            }
        }
    }

    const can = (section: string, action: string) => {
        return permissions[user.value?.role]?.[section]?.[action] ?? false
    }

    return {
        can
    }
}