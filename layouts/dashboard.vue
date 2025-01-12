<template>
  <div class="min-h-screen">
    <header class="border-b">
      <div class="flex h-16 items-center px-4">
        <!-- Main Navigation -->
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/dashboard"
                :class="navigationMenuTriggerStyle()"
              >
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-[400px] gap-3 p-4">
                  <li>
                    <NavigationMenuLink as-child>
                      <NuxtLink
                        to="/products/recipes"
                        class="block select-none space-y-1 rounded-md p-3 learding-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div class="text-sm font-medium leading-none">
                          Recipes
                        </div>
                        <p
                          class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                        >
                          Manage recipes
                        </p>
                      </NuxtLink>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Inventory</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-[400px] gap-3 p-4">
                  <li>
                    <NavigationMenuLink as-child>
                      <NuxtLink
                        to="/inventory/ingredients"
                        class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div class="text-sm font-medium leading-none">
                          Ingredients
                        </div>
                        <p
                          class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                        >
                          Manage ingredients and their stock levels
                        </p>
                      </NuxtLink>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink as-child>
                      <NuxtLink
                        to="/inventory/warehouses"
                        class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div class="text-sm font-medium leading-none">
                          Warehouses
                        </div>
                        <p
                          class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                        >
                          Manage warehouses and stock distribution
                        </p>
                      </NuxtLink>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href="/reporting"
                :class="navigationMenuTriggerStyle()"
              >
                Reporting
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href="/production"
                :class="navigationMenuTriggerStyle()"
              >
                Production
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <!-- Right side items -->
        <div class="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import UserNav from "~/components/ui/UserNav.vue";
</script>
