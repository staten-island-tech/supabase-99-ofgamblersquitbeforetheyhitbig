<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'

const auth = useAuthStore()

const handleLogout = async () => {
  await auth.signOut()
}

const profileData = ref({
  username: '',
  email: '',
  image: '',
})

onMounted(async () => {
  if (!auth.user) await auth.fetchUser()

  const { data, error } = await supabase
    .from('users')
    .select('username, ImageURL') // Make sure ImageURL is selected
    .eq('id', auth.user.id)
    .single()

  if (!error) {
    profileData.value = {
      email: auth.user.email,
      username: data.username,
      image: data.ImageURL,
    }
  }
})
</script>

<template>
  <div class="profile-container">
    <h1>User Profile</h1>
    <p><strong>Email:</strong> {{ profileData.email }}</p>
    <p><strong>Username:</strong> {{ profileData.username }}</p>
    <img
      v-if="profileData.image"
      :src="profileData.image"
      alt="Profile image"
      class="profile-img"
    />
    <button v-if="auth.user" @click="handleLogout" class="logout-btn">Logout</button>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.profile-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  margin: 1rem 0;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

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
