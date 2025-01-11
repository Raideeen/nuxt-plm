<!-- pages/login.vue -->

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md space-y-8 p-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold">PLM System Login</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Enter your credentials to access the system
        </p>
      </div>

      <form @submit="onSubmit" class="space-y-6">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Enter your email"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Enter your password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full"> Sign in </Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

// Define the login form schema
const loginSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
);

const router = useRouter();
const { setUser } = useAuth();

const form = useForm({
  validationSchema: loginSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: values,
    });

    setUser(response);
    await router.push("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
});
</script>
