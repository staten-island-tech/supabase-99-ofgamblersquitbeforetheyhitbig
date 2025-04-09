<template>
  <div class="profile">
    <h1>yo, {{ username }}</h1>

    <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />

    <p>Email: {{ email }}</p>
    <p>Birthdate: {{ formattedBirthdate }}</p>

    <button @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const avatarUrl = ref('')
const formattedBirthdate = ref('')

const router = useRouter()

const getProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    router.push('/login')
    return
  }

  const userId = user.id // This is the Supabase-generated UUID

  // Convert UUID to bigint (same as in login.vue)
  const bigintId = BigInt('0x' + userId.replace(/-/g, '')) % BigInt('10000000000000000000') // Convert UUID to a bigint

  // Fetch profile data from 'User Login' table using the bigint ID
  const { data, error } = await supabase
    .from('User Login')
    .select('*')
    .eq('id', bigintId.toString()) // Query by the bigint ID
    .single()

  if (error) {
    console.error(error)
    return
  }

  username.value = data.Username
  email.value = data.Email
  avatarUrl.value = data.AvatarImageURL
  formattedBirthdate.value = new Date(data.Birthdate).toLocaleDateString()
}

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(() => {
  getProfile()
})
</script>

<style scoped>
.profile {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: #1e1e1e;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  margin: 20px 0;
  border: 3px solid #4f46e5;
}

button {
  padding: 10px 20px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #f87171;
}
</style>
