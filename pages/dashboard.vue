<!-- pages/dashboard.vue -->
<template>
  <div class="hidden flex-col md:flex">
    <!-- Header -->
    <div class="border-b">
      <div class="flex h-16 items-center px-4">
        <MainNav class="mx-6" />
        <div class="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 space-y-4 p-8 pt-6">
      <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div class="flex items-center space-x-2">
          <Button>Download</Button>
        </div>
      </div>

      <Tabs default-value="overview" class="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-4">
          <!-- Stats Cards -->
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card v-for="stat in stats" :key="stat.title">
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0 pb-2"
              >
                <CardTitle class="text-sm font-medium">
                  {{ stat.title }}
                </CardTitle>
                <span class="text-xs text-muted-foreground">$</span>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ stat.value }}</div>
                <p class="text-xs text-muted-foreground">{{ stat.change }}</p>
              </CardContent>
            </Card>
          </div>

          <!-- Charts Grid -->
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card class="col-span-4">
              <CardHeader>
                <CardTitle>Super graph</CardTitle>
              </CardHeader>
              <CardContent>
                <!-- We'll add the graph here -->
              </CardContent>
            </Card>
            <Card class="col-span-3">
              <CardHeader>
                <CardTitle>Super tableau interactif des tâches</CardTitle>
              </CardHeader>
              <CardContent>
                <!-- We'll add the tasks table here -->
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const stats = [
  {
    title: "Stock global",
    value: "4,500 units",
    change: "+20.1% from last month",
  },
  {
    title: "Coût consolidés",
    value: "45,500€",
    change: "+180.1% from last month",
  },
  { title: "Marge approximative", value: "0€", change: "+19% from last month" },
  { title: "Yesn't", value: "45,500€", change: "+201 since last hour" },
];
</script>
