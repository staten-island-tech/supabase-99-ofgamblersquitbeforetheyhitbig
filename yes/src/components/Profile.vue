<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await auth.signOut()
  router.push('/')
}

const profileData = ref({
  username: '',
  email: '',
  image: '',
})

const inventory = ref([])

onMounted(async () => {
  if (!auth.user) await auth.fetchUser()

  // Get profile info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('username, ImageURL')
    .eq('id', auth.user.id)
    .single()

  if (!userError) {
    profileData.value = {
      email: auth.user.email,
      username: userData.username,
      image: userData.ImageURL,
    }
  }

  // Get user's cards directly from your table
  const { data: cardData, error: cardError } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', auth.user.id)

  if (!cardError) {
    const grouped = {}

    cardData.forEach((card) => {
      const key = card.card_name
      if (!grouped[key]) {
        grouped[key] = { ...card, count: 1 }
      } else {
        grouped[key].count++
      }
    })

    inventory.value = Object.values(grouped)
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

    <div class="inventory-container" v-if="inventory.length">
      <h2>Your Cards</h2>
      <div class="card-grid">
        <div class="card-item" v-for="card in inventory" :key="card.card_name">
          <img :src="card.image" :alt="card.card_name" class="card-img" />
          <div class="card-overlay" v-if="card.count > 1">x{{ card.count }}</div>
        </div>
      </div>
    </div>
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

/* Inventory Styles */
.inventory-container {
  margin-top: 3rem;
  text-align: left;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.card-item {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
}

.card-img {
  width: 100%;
  height: auto;
  display: block;
}

.card-overlay {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 12px;
}
</style>
