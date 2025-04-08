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

  const { data, error } = await supabase
    .from('User Login') // put your table name here
    .select('*')
    .eq('id', user.id)
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 100%;
  object-fit: cover;
  border: 2px solid #000;
}
</style>
