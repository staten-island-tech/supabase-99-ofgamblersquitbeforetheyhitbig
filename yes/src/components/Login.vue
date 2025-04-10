<template>
  <div class="flex flex-col gap-2 w-64 mx-auto mt-24 text-center">
    <input
      v-model="email"
      placeholder="Email"
      class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <input
      v-model="password"
      type="password"
      placeholder="Password"
      class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <button
      @click="handleLogin"
      v-if="mode === 'login'"
      class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
    >
      Login
    </button>

    <button
      @click="handleSignup"
      v-else
      class="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
    >
      Sign Up
    </button>

    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>

    <p class="text-blue-500 text-xs cursor-pointer hover:underline" @click="toggleMode">
      {{ mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login' }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/auth'

const userStore = useUserStore()
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const mode = ref('login')

const toggleMode = () => {
  error.value = ''
  success.value = ''
  mode.value = mode.value === 'login' ? 'signup' : 'login'
}

const handleLogin = async () => {
  error.value = ''
  success.value = ''

  try {
    await userStore.login(email.value, password.value)
    success.value = 'Logged in successfully!'
  } catch (err) {
    error.value = err.message
  }
}

const handleSignup = async () => {
  error.value = ''
  success.value = ''

  try {
    await userStore.signup(email.value, password.value)
    success.value = 'Account created successfully! Now log in.'
    mode.value = 'login'
  } catch (err) {
    error.value = err.message
  }
}
</script>
