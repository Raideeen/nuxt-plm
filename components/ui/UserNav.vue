<!-- components/UserNav.vue -->
<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" class="relative h-8 w-8 rounded-full">
        <Avatar class="h-8 w-8">
          <AvatarImage
            :src="user?.avatarUrl || ''"
            :alt="`${user?.name}'s avatar`"
          />
          <AvatarFallback :class="avatarColor">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56" align="end">
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">{{ user?.name }}</p>
          <p class="text-xs leading-none text-muted-foreground">
            {{ user?.email }}
          </p>
          <p class="text-xs leading-none text-muted-foreground capitalize">
            {{ user?.role }}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <button class="flex w-full items-center" @click="handleProfile">
          Profile
        </button>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <button class="flex w-full items-center" @click="handleSettings">
          Settings
        </button>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <button
          class="flex w-full items-center text-red-600"
          @click="handleLogout"
        >
          Log out
        </button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const { user, clearUser } = useAuth();
const router = useRouter();

// Generate initials from name
const userInitials = computed(() => {
  if (!user.value?.name) return "";
  return user.value.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
});

// Generate a consistent color based on user's name
const avatarColor = computed(() => {
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  if (!user.value?.name) return colors[0];
  const index =
    user.value.name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return colors[index];
});

const handleLogout = async () => {
  clearUser();
  await router.push("/");
};

const handleProfile = () => {
  // Implement profile navigation
  console.log("Navigate to profile");
};

const handleSettings = () => {
  // Implement settings navigation
  console.log("Navigate to settings");
};
</script>
