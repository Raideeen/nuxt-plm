<template>
  <div class="min-h-screen">
    <!-- Top Navigation Bar -->
    <div class="border-b">
      <div class="flex h-16 items-center px-4">
        <!-- Main Navigation -->
        <nav class="flex items-center space-x-4 lg:space-x-6">
          <NuxtLink
            v-for="item in navigation"
            :key="item.href"
            :to="item.href"
            :class="[
              'text-sm font-medium transition-colors hover:text-primary',
              $route.path === item.href
                ? 'text-primary'
                : 'text-muted-foreground',
            ]"
          >
            {{ item.title }}
          </NuxtLink>
        </nav>

        <!-- Right Side Items -->
        <div class="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import UserNav from "~/components/ui/UserNav.vue";
import { useAuth } from "~/composables/useAuth";

const router = useRouter();
const { clearUser } = useAuth();
const navigation = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Products", href: "/products" },
  { title: "Inventory", href: "/inventory" },
  { title: "Reporting", href: "/reporting" },
  { title: "Production", href: "/production" },
];

const handleLogout = async () => {
  clearUser();
  await router.push("/");
};
</script>
