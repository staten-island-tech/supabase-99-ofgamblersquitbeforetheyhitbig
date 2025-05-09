<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">🎯 Custom Gacha</h1>

    <button @click="singlePull" class="btn">Single Pull</button>
    <button @click="tenPull" class="btn ml-2">10-Pull</button>

    <div v-if="results.length" class="mt-4">
      <h2 class="text-lg font-semibold">Results:</h2>
      <div v-for="(item, index) in results" :key="index" class="mt-2 p-2 border rounded">
        <p><strong>{{ item.Name }}</strong> ({{ item.Rarity }})</p>
        <p>{{ item.Desc }}</p>
        <img :src="item.Image" alt="Image" class="w-24 mt-1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const results = ref([])

// Define rarity drop rates
const rarityRates = {
  'Lebron James': 0.1,
  'Korean': 0.9,
  'Legendary': 9,
  'Rare': 15,
  'Gooner': 20,
  'Common': 55
}

// Your gacha pool
const gachaPool = [
  {
    Name: 'Andrew',
    Rarity: 'Korean',
    Desc: 'Gotta be a top 10 korean',
    Image: 'Andrew.png',
  },
  {
    Name: 'Barney',
    Rarity: 'Rare',
    Desc: 'Barney is a dinosaur that haunts your imagination',
    Image: 'Barney.webp',
  },
  {
    Name: 'Belle',
    Rarity: 'Korean',
    Desc: 'ryyan loves gooning',
    Image: 'Belle.jpg',
  },
  {
    Name: 'Bob',
    Rarity: 'Rare',
    Desc: 'licks you',
    Image: 'Bob.jpg',
  },
  {
    Name: 'Brude',
    Rarity: 'Common',
    Desc: 'Gotta be a top 10 korean',
    Image: 'Andrew.png',
  },
]

// Weighted random rarity
function getRandomRarity() {
  const roll = Math.random() * 100
  let total = 0
  for (const [rarity, rate] of Object.entries(rarityRates)) {
    total += rate
    if (roll <= total) return rarity
  }
  return 'Common' // Fallback
}

// Pull one character from pool based on rarity
function pullOneCharacter() {
  const targetRarity = getRandomRarity()
  const candidates = gachaPool.filter(c => c.Rarity === targetRarity)
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function singlePull() {
  const pull = pullOneCharacter()
  results.value = pull ? [pull] : []
}

function tenPull() {
  const pulls = []
  for (let i = 0; i < 10; i++) {
    const p = pullOneCharacter()
    if (p) pulls.push(p)
  }
  results.value = pulls
}
</script>

<style scoped>
.btn {
     bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition;
}
</style>