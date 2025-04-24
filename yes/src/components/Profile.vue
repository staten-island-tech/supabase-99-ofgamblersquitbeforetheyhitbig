<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
      <h1 class="text-2xl font-bold mb-4">Your Profile</h1>

      <div v-if="user">
        <p class="text-gray-700 mb-2"><span class="font-semibold">Email:</span> {{ user.email }}</p>

        <button
          @click="handleLogout"
          class="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div v-else>
        <p class="text-gray-500">Not logged in.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const router = useRouter()

const handleLogout = async () => {
  await userStore.logout()
  router.push('/')
}
</script>
