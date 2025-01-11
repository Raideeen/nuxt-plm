<template>
  <nav class="flex items-center space-x-4 lg:space-x-6">
    <NuxtLink
      v-for="item in items"
      :key="item.title"
      :to="item.href"
      :class="[
        'text-sm font-medium transition-colors hover:text-primary',
        $route.path === item.href ? 'text-primary' : 'text-muted-foreground',
      ]"
    >
      {{ item.title }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const items = [
  { title: "Overview", href: "/dashboard" },
  { title: "Products", href: "/products" },
  { title: "Inventory", href: "/inventory" },
  { title: "Production", href: "/production" },
  { title: "Reporting", href: "/reporting" },
];
</script>
