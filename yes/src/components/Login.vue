<template>
  <div class="login-box">
    <h2>Login / Sign Up</h2>

    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <input v-model="username" type="text" placeholder="Username (sign up only)" />
    <input v-model="avatarUrl" type="text" placeholder="Avatar Image URL (optional)" />
    <input v-model="birthdate" type="date" />

    <div class="buttons">
      <button @click="signUp">Sign Up</button>
      <button @click="login">Log In</button>
    </div>

    <div class="output">
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
      <pre v-if="profile">{{ profile }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const email = ref('')
const password = ref('')
const username = ref('')
const avatarUrl = ref('')
const birthdate = ref('')

const error = ref('')
const success = ref('')
const profile = ref(null)

const signUp = async () => {
  error.value = ''
  success.value = ''
  profile.value = null

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (signUpError) {
    error.value = signUpError.message
    return
  }

  const userId = data.user.id // This is the Supabase-generated UUID

  // Convert UUID to a numeric value (bigint). In this case, we'll use a simple conversion for example purposes
  const bigintId = BigInt('0x' + userId.replace(/-/g, '')) % BigInt('10000000000000000000') // Making sure it's within range for bigint

  // Insert user profile into the 'User Login' table with a 'bigint' id
  const { error: profileError } = await supabase.from('User Login').insert([
    {
      id: bigintId.toString(), // Insert the bigint ID as a string
      Username: username.value,
      AvatarImageURL: avatarUrl.value,
      Birthdate: new Date(birthdate.value),
    },
  ])

  if (profileError) {
    error.value = profileError.message
  } else {
    success.value = 'Sign up successful! Please check your email to confirm your account.'
  }
}

const login = async () => {
  error.value = ''
  success.value = ''
  profile.value = null

  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (loginError) {
    error.value = loginError.message
    return
  }

  const { data: userData } = await supabase.auth.getUser()

  const { data: userProfile, error: profileFetchError } = await supabase
    .from('User Login') // Fetch data from 'User Login' table
    .select('*')
    .eq('id', userData.user.id) // Use the user ID for querying
    .single()

  if (profileFetchError) {
    error.value = profileFetchError.message
  } else {
    success.value = 'Logged in successfully!'
    profile.value = JSON.stringify(userProfile, null, 2)
  }
}
</script>

<style scoped>
.login-box {
  max-width: 450px;
  margin: 5rem auto;
  padding: 2rem;
  border-radius: 16px;
  background-color: #f9fafb;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  text-align: center;
}

input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.4rem 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

button {
  flex: 1;
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover {
  background: #3730a3;
}

.output {
  margin-top: 1rem;
  text-align: left;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>
