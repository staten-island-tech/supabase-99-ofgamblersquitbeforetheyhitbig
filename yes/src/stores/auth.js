import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),

  actions: {
    async fetchUser() {
      const { data } = await supabase.auth.getUser()
      this.user = data.user
    },

    async login(email, password) {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      this.user = data.user
    },

    async signup(email, password) {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      this.user = data.user
    },

    async logout() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      this.user = null
    },
  },
})
