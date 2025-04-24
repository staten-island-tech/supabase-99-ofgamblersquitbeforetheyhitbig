import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useCoinStore = defineStore('coins', () => {
  const coins = ref(Number(localStorage.getItem('coins')) || 0)

  function add(amount) {
    coins.value += amount
  }

  function reset() {
    coins.value = 0
  }

  watch(coins, (newVal) => {
    localStorage.setItem('coins', newVal)
  })

  return { coins, add, reset }
})
