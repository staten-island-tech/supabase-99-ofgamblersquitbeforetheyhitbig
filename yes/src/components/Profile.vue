<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const handleLogout = async () => {
  await auth.signOut()
}
</script>

<template>
  <button v-if="auth.user" @click="handleLogout" class="logout-btn">Logout</button>
</template>

<style scoped>
.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.logout-btn:hover {
  background-color: #d9363e;
}
</style>
